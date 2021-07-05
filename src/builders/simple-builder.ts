import { Builder } from '../builders/builder';
import {
  Address,
  Amount,
  AmountUnit,
  Cell,
  RawTransaction,
  Transaction,
} from '../models';
import PWCore from '../core';
import { SimpleACPBuilder } from './simple-acp-builder';
import { BuilderOption } from './builder';

export class SimpleBuilder extends Builder {
  simpleACPBuilder: Builder;

  constructor(
    private address: Address,
    private amount: Amount,
    protected options: BuilderOption = {}
  ) {
    super(options.feeRate, options.collector, options.witnessArgs);
    this.simpleACPBuilder = new SimpleACPBuilder(
      this.address,
      this.amount,
      this.options
    );
  }

  async build(fee: Amount = Amount.ZERO): Promise<Transaction> {
    if (this.amount.lt(Builder.MIN_CHANGE)) {
      return this.simpleACPBuilder.build();
    }

    const outputCell = new Cell(this.amount, this.address.toLockScript());

    const data = this.options.data;
    if (data) {
      if (data.startsWith('0x')) {
        outputCell.setHexData(data);
      }
      else {
        outputCell.setData(data);
      }
    }

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
      inputSum.sub(outputCell.capacity),
      PWCore.provider.address.toLockScript()
    );

    const tx = new Transaction(
      new RawTransaction(inputCells, [outputCell, changeCell]),
      [this.witnessArgs]
    );

    this.fee = Builder.calcFee(tx, this.feeRate);

    if (changeCell.capacity.gte(Builder.MIN_CHANGE.add(this.fee))) {
      changeCell.capacity = changeCell.capacity.sub(this.fee);
      tx.raw.outputs.pop();
      tx.raw.outputs.push(changeCell);
      return tx;
    }

    return this.build(this.fee);
  }

  getCollector() {
    return this.collector;
  }
}
