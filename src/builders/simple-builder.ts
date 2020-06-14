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
    address: Address,
    amount: Amount,
    feeRate?: number,
    collector?: Collector
  ) {
    super([{ address, amount }], feeRate, collector);
  }

  async build(): Promise<Transaction> {
    const outputCell = new Cell(
      this.outputs[0].amount,
      this.outputs[0].address.toLockScript()
    );
    const neededAmount = Amount.ADD(this.outputs[0].amount, Builder.MIN_CHANGE);
    let inputSum = new Amount('0');
    const inputCells: Cell[] = [];

    // fill the inputs
    const cells = await this.collector.collect(
      PWCore.provider.address,
      neededAmount
    );
    for (const cell of cells) {
      inputCells.push(cell);
      inputSum = Amount.ADD(inputSum, cell.capacity);
      if (Amount.GT(inputSum, neededAmount)) break;
    }

    if (Amount.LT(inputSum, this.outputs[0].amount)) {
      throw new Error(
        `input capacity not enough, need ${outputCell.capacity.toString(
          AmountUnit.ckb
        )}, got ${inputSum.toString(AmountUnit.ckb)}`
      );
    }

    const changeCell = new Cell(
      Amount.SUB(inputSum, outputCell.capacity),
      this.outputs[0].address.toLockScript()
    );

    const tx = new Transaction(
      new RawTransaction(inputCells, [outputCell, changeCell])
    );

    this.fee = Builder.calcFee(tx);

    if (
      Amount.GT(Amount.ADD(this.fee, Builder.MIN_CHANGE), changeCell.capacity)
    ) {
      // TODO: collect more cells and recalculate fee, until input capacity is
      // enough or no more available unspent cells.
      throw new Error(
        `input capacity not enough, need ${Amount.ADD(
          outputCell.capacity,
          this.fee
        ).toString(AmountUnit.ckb)}, got ${inputSum.toString(AmountUnit.ckb)}`
      );
    }

    // sub fee from changeCell
    changeCell.capacity = Amount.SUB(changeCell.capacity, this.fee);
    tx.raw.outputs.pop();
    tx.raw.outputs.push(changeCell);

    return tx;
  }

  getCollector() {
    return this.collector;
  }
}
