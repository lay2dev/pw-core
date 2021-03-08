import { Builder, BuilderOption } from '../builders/builder';
import {
  Address,
  Amount,
  AmountUnit,
  Cell,
  RawTransaction,
  Transaction,
} from '../models';
import PWCore from '..';
export class SimpleACPBuilder extends Builder {
  receiverInputCell: Cell;
  receiverOutputCell: Cell;

  constructor(
    protected address: Address,
    protected amount: Amount,
    protected options: BuilderOption = {}
  ) {
    super(options.feeRate, options.collector, options.witnessArgs);
  }

  async build(): Promise<Transaction> {
    if (!this.address.isAcp()) {
      throw new Error("The Receiver's address is not anyone-can-pay cell");
    }

    const receiverACPCells = await this.collector.collect(this.address, {
      neededAmount: new Amount('1', AmountUnit.shannon),
    });
    if (!receiverACPCells || receiverACPCells.length === 0) {
      throw new Error('The receiver has no sudt cell');
    }

    this.receiverInputCell = receiverACPCells[0];
    this.receiverOutputCell = this.receiverInputCell.clone();

    this.receiverOutputCell.capacity = this.receiverOutputCell.capacity.add(
      this.amount
    );
    return this.buildSenderCells();
  }

  async buildSenderCells(fee: Amount = Amount.ZERO): Promise<Transaction> {
    const neededAmount = this.amount.add(Builder.MIN_CHANGE).add(fee);
    let inputSum = new Amount('0');
    const inputCells: Cell[] = [];

    // fill the inputs
    const cells = await this.collector.collect(PWCore.provider.address, {
      neededAmount,
    });
    for (const cell of cells) {
      inputCells.push(cell);
      inputSum = inputSum.add(cell.capacity);
      if (inputSum.gt(neededAmount)) break;
    }

    if (inputSum.lt(neededAmount)) {
      throw new Error(
        `input capacity not enough, need ${neededAmount.toString(
          AmountUnit.ckb
        )}, got ${inputSum.toString(AmountUnit.ckb)}`
      );
    }

    const changeCell = new Cell(
      inputSum.sub(this.amount),
      PWCore.provider.address.toLockScript()
    );

    const tx = new Transaction(
      new RawTransaction(
        [...inputCells, this.receiverInputCell],
        [this.receiverOutputCell, changeCell]
      ),
      [this.witnessArgs]
    );

    this.fee = Builder.calcFee(tx, this.feeRate);

    if (changeCell.capacity.gte(Builder.MIN_CHANGE.add(this.fee))) {
      changeCell.capacity = changeCell.capacity.sub(this.fee);
      tx.raw.outputs.pop();
      tx.raw.outputs.push(changeCell);
      return tx;
    }

    return this.buildSenderCells(this.fee);
  }

  getCollector() {
    return this.collector;
  }
}
