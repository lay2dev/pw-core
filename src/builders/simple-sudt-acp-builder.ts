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

export class SimpleSUDTACPBuilder extends Builder {
  constructor(
    private sudt: SUDT,
    private address: Address,
    private amount: Amount,
    protected options: BuilderOption = {}
  ) {
    super(options.feeRate, options.collector, options.witnessArgs);
  }

  async build(): Promise<Transaction> {
    if (!this.address.isAcp()) {
      throw new Error("The receiver's address is not anyone-can-pay cell");
    }
    if (!(this.collector instanceof SUDTCollector)) {
      throw new Error('this.collector is not a SUDTCollector instance');
    }

    const receiverSUDTCells = await this.collector.collectSUDT(
      this.sudt,
      this.address,
      { neededAmount: new Amount('1', AmountUnit.shannon) }
    );
    if (!receiverSUDTCells || receiverSUDTCells.length === 0) {
      throw new Error('The receiver has no sudt cell');
    }

    const receiverInputCell = receiverSUDTCells[0];
    const receiverOuputCell = receiverInputCell.clone();

    receiverOuputCell.setSUDTAmount(
      this.amount.add(receiverOuputCell.getSUDTAmount())
    );

    let senderInputSUDTSum = new Amount('0');
    let senderInputCKBSum = new Amount('0');
    let minSenderOccupiedCKBSum = new Amount('0');

    let restNeededSUDT = new Amount(
      this.amount.toHexString(),
      AmountUnit.shannon
    );

    const inputCells: Cell[] = [];
    const outputCells: Cell[] = [];

    // fill the inputs and the outputs
    const unspentSUDTCells = await this.collector.collectSUDT(
      this.sudt,
      PWCore.provider.address,
      { neededAmount: this.amount }
    );

    // First step: build a tx including sender and receiver sudt cell only
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

      inputCells.push(inputCell);
      outputCells.unshift(outputCell);

      if (senderInputSUDTSum.gte(this.amount)) break;
    }

    if (senderInputSUDTSum.lt(this.amount)) {
      throw new Error(
        `input sudt amount not enough, need ${this.amount.toString(
          AmountUnit.ckb
        )}, got ${senderInputSUDTSum.toString(AmountUnit.ckb)}`
      );
    }

    inputCells.push(receiverInputCell);
    outputCells.unshift(receiverOuputCell);

    let tx = this.rectifyTx(inputCells, outputCells);

    const availableCKBFee = senderInputCKBSum.sub(minSenderOccupiedCKBSum);

    // Second step:  if sudt cell can not pay the transaction fee, fetch pure ckb cells to pay the fee.
    if (this.fee.gt(availableCKBFee)) {
      const unspentCKBCells = await this.collector.collect(
        PWCore.provider.address,
        { neededAmount: this.fee.sub(availableCKBFee).add(Builder.MIN_CHANGE) }
      );

      if (!unspentCKBCells || unspentCKBCells.length === 0) {
        throw new Error('not enough CKB to pay the transaction fee');
      }

      // append the fee cell to tx's inputs and outputs
      const ckbFeeInputCell = unspentCKBCells[0];
      inputCells.push(ckbFeeInputCell);
      outputCells.push(ckbFeeInputCell.clone());

      tx = this.rectifyTx(inputCells, outputCells);

      // if fee change cell's capacity less than occuiped capacity, merge the fee cell to sender's input sudt cell.
      if (this.fee.gt(availableCKBFee.add(ckbFeeInputCell.availableFee()))) {
        outputCells.pop();

        const senderOutputCell = outputCells.pop();
        senderOutputCell.capacity = senderOutputCell.capacity.add(
          ckbFeeInputCell.capacity
        );
        outputCells.push(senderOutputCell);

        tx = this.rectifyTx(inputCells, outputCells);
      }
    }

    // Third step: subtract tx fee from outputs' capacity
    tx = this.subtractFee(inputCells, outputCells);

    return tx;
  }

  private subtractFee(inputCells: Cell[], outputCells: Cell[]) {
    let remainFee = new Amount(this.fee.toHexString(), AmountUnit.shannon);
    for (const cell of outputCells.slice(1)) {
      // throw new Error(`remainFee ${remainFee} ${cell.availableFee()}`);
      if (remainFee.gt(cell.availableFee())) {
        remainFee = remainFee.sub(cell.availableFee());
        cell.capacity = cell.occupiedCapacity();
      } else {
        cell.capacity = cell.capacity.sub(remainFee);
        break;
      }
    }
    return this.rectifyTx(inputCells, outputCells);
  }

  private rectifyTx(inputCells: Cell[], outputCells: Cell[]) {
    const sudtCellDeps = [
      PWCore.config.defaultLock.cellDep,
      PWCore.config.pwLock.cellDep,
      PWCore.config.sudtType.cellDep,
    ];
    const tx = new Transaction(
      new RawTransaction(inputCells, outputCells, sudtCellDeps),
      [this.witnessArgs]
    );

    this.fee = Builder.calcFee(tx, this.feeRate);
    return tx;
  }

  getCollector() {
    return this.collector;
  }
}
