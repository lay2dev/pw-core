import { Builder, BuilderOption } from './builder';
import {
  Address,
  Amount,
  AmountUnit,
  Cell,
  RawTransaction,
  Transaction,
  SUDT,
} from '../models';
import PWCore from '..';
import { SUDTCollector } from '../collectors/sudt-collector';

export class SimpleSUDTBuilder extends Builder {
  fee: Amount;

  inputCells: Cell[] = [];
  outputCells: Cell[] = [];

  constructor(
    private sudt: SUDT,
    private address: Address,
    private amount: Amount,
    protected options: BuilderOption = {}
  ) {
    super(options.feeRate, options.collector, options.witnessArgs);
    this.fee = new Amount('0');
  }

  async build(): Promise<Transaction> {
    const { tx, neededCKB } = await this.buildSudtCells();
    if (tx) return tx;

    const tx2 = await this.buildCKBCells(neededCKB);
    return tx2;
  }

  /**
   * build a transaction with only sudt cells
   */
  async buildSudtCells(): Promise<{ tx: Transaction; neededCKB: Amount }> {
    let senderInputSUDTSum = new Amount('0');
    let senderInputCKBSum = new Amount('0');
    let minSenderOccupiedCKBSum = new Amount('0');

    const receiverAmount = new Amount('142');
    const receiverOutputCell = new Cell(
      receiverAmount,
      this.address.toLockScript(),
      this.sudt.toTypeScript(),
      null,
      this.amount.toUInt128LE()
    );

    // acp cell with zero sudt
    if (this.amount.eq(new Amount('0'))) {
      this.outputCells.push(receiverOutputCell);
      return { tx: null, neededCKB: receiverAmount };
    }

    let restNeededSUDT = new Amount(
      this.amount.toHexString(),
      AmountUnit.shannon
    );

    if (!(this.collector instanceof SUDTCollector)) {
      throw new Error('this.collector is not a SUDTCollector instance');
    }

    const unspentSUDTCells = await this.collector.collectSUDT(
      this.sudt,
      PWCore.provider.address,
      { neededAmount: this.amount }
    );

    // build a tx including sender and receiver sudt cell only
    for (const inputCell of unspentSUDTCells) {
      const outputCell = inputCell.clone();

      const inputSUDTAmount = inputCell.getSUDTAmount();
      senderInputSUDTSum = senderInputSUDTSum.add(inputSUDTAmount);
      senderInputCKBSum = senderInputCKBSum.add(inputCell.capacity);

      minSenderOccupiedCKBSum = minSenderOccupiedCKBSum.add(
        outputCell.occupiedCapacity()
      );

      if (inputSUDTAmount.lt(restNeededSUDT)) {
        restNeededSUDT = restNeededSUDT.sub(inputSUDTAmount);
        outputCell.setSUDTAmount(new Amount('0'));
      } else {
        outputCell.setSUDTAmount(inputSUDTAmount.sub(restNeededSUDT));
        restNeededSUDT = new Amount('0');
      }

      this.inputCells.push(inputCell);
      this.outputCells.unshift(outputCell);

      if (senderInputSUDTSum.gte(this.amount)) break;
    }

    if (senderInputSUDTSum.lt(this.amount)) {
      throw new Error(
        `input sudt amount not enough, need ${this.amount.toString(
          AmountUnit.ckb
        )}, got ${senderInputSUDTSum.toString(AmountUnit.ckb)}`
      );
    }

    this.outputCells.unshift(receiverOutputCell);
    this.rectifyTx();

    const availableCKB = senderInputCKBSum.sub(minSenderOccupiedCKBSum);

    if (receiverAmount.add(this.fee).lt(availableCKB)) {
      const tx = this.extractCKBFromOutputs(receiverAmount.add(this.fee));
      return { tx, neededCKB: new Amount('0') };
    } else {
      this.extractCKBFromOutputs(receiverAmount);
      return { tx: null, neededCKB: receiverAmount.sub(availableCKB) };
    }
  }

  /**
   * Fetch pure CKB cells to fullfill the need CKB amount
   * @param ckbAmount  needed CKB amount
   */
  async buildCKBCells(ckbAmount): Promise<Transaction> {
    // fetch pure ckb cells to pay the fee.
    const neededAmount = ckbAmount.add(Builder.MIN_CHANGE).add(this.fee);
    let inputSum = new Amount('0');

    const unspentCKBCells = await this.collector.collect(
      PWCore.provider.address,
      { neededAmount }
    );

    if (!unspentCKBCells || unspentCKBCells.length === 0) {
      throw new Error('no avaiable CKB');
    }

    for (const ckbCell of unspentCKBCells) {
      this.inputCells.push(ckbCell);
      inputSum = inputSum.add(ckbCell.capacity);

      if (inputSum.gt(neededAmount)) break;
    }

    if (inputSum.lt(ckbAmount.add(this.fee))) {
      throw new Error('no enough CKB to create acp cell 1');
    }

    // with changeCell
    if (inputSum.gt(neededAmount)) {
      const changeCell = new Cell(
        inputSum.sub(ckbAmount),
        PWCore.provider.address.toLockScript()
      );
      this.outputCells.push(changeCell);

      this.rectifyTx();

      if (this.fee.add(Builder.MIN_CHANGE).lte(changeCell.capacity)) {
        changeCell.capacity = changeCell.capacity.sub(this.fee);
        return this.rectifyTx();
      } else {
        // pop changeCell
        this.outputCells.pop();
      }
    }

    // no change cell, merge rest CKB to last output cell
    const lastCell = this.outputCells.pop();
    lastCell.capacity = lastCell.capacity.add(inputSum.sub(ckbAmount));
    this.outputCells.push(lastCell);

    this.rectifyTx();

    if (this.fee.add(lastCell.occupiedCapacity()).gt(lastCell.capacity)) {
      throw new Error('no enough CKB to create acp cell 2');
    }

    lastCell.capacity = lastCell.capacity.sub(this.fee);
    return this.rectifyTx();
  }

  /**
   * subtract specified ckb amount from sender's outputs
   * @param ckbAmount
   */
  private extractCKBFromOutputs(ckbAmount) {
    for (const cell of this.outputCells.slice(1)) {
      if (ckbAmount.gt(cell.availableFee())) {
        ckbAmount = ckbAmount.sub(cell.availableFee());
        cell.capacity = cell.occupiedCapacity();
      } else {
        cell.capacity = cell.capacity.sub(ckbAmount);
        break;
      }
    }
    return this.rectifyTx();
  }

  /**
   * build tx based on inputs and outputs, and calculate the tx fee
   */
  private rectifyTx() {
    const sudtCellDeps = [
      PWCore.config.defaultLock.cellDep,
      PWCore.config.pwLock.cellDep,
      PWCore.config.sudtType.cellDep,
    ];
    const tx = new Transaction(
      new RawTransaction(this.inputCells, this.outputCells, sudtCellDeps),
      [this.witnessArgs]
    );

    this.fee = Builder.calcFee(tx, this.feeRate);
    return tx;
  }

  getCollector() {
    return this.collector;
  }
}
