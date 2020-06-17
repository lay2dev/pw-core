import { Builder } from '../builders/builder';
import { Collector } from '../collectors/collector';
import {
  Address,
  Amount,
  AmountUnit,
  Cell,
  RawTransaction,
  Transaction,
} from '../models';
import PWCore from '..';

export class SimpleBuilder extends Builder {
  constructor(
    private address: Address,
    private amount: Amount,
    feeRate?: number,
    collector?: Collector
  ) {
    super(feeRate, collector);
  }

  async build(): Promise<Transaction> {
    const outputCell = new Cell(this.amount, this.address.toLockScript());
    const neededAmount = this.amount.add(Builder.MIN_CHANGE);
    let inputSum = new Amount('0');
    const inputCells: Cell[] = [];

    // fill the inputs
    const cells = await this.collector.collect(
      PWCore.provider.address,
      neededAmount
    );
    for (const cell of cells) {
      inputCells.push(cell);
      inputSum = inputSum.add(cell.capacity);
      if (inputSum.gt(neededAmount)) break;
    }

    if (inputSum.lt(this.amount)) {
      throw new Error(
        `input capacity not enough, need ${outputCell.capacity.toString(
          AmountUnit.ckb
        )}, got ${inputSum.toString(AmountUnit.ckb)}`
      );
    }

    const changeCell = new Cell(
      inputSum.sub(outputCell.capacity),
      PWCore.provider.address.toLockScript()
    );

    const tx = new Transaction(
      new RawTransaction(inputCells, [outputCell, changeCell])
    );

    this.fee = Builder.calcFee(tx);

    if (this.fee.add(Builder.MIN_CHANGE).gt(changeCell.capacity)) {
      // TODO: collect more cells and recalculate fee, until input capacity is
      // enough or no more available unspent cells.
      throw new Error(
        `input capacity not enough, need ${outputCell.capacity
          .add(this.fee)
          .toString(AmountUnit.ckb)}, got ${inputSum.toString(AmountUnit.ckb)}`
      );
    }

    // sub fee from changeCell
    changeCell.capacity = changeCell.capacity.sub(this.fee);
    tx.raw.outputs.pop();
    tx.raw.outputs.push(changeCell);

    return tx;
  }

  getCollector() {
    return this.collector;
  }
}
