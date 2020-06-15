import { Collector } from '../collectors/collector';
import { Amount, AmountUnit, Transaction } from '../models';
import PWCore from '..';

const FEE_BASE = 1000;

export abstract class Builder {
  static readonly MIN_FEE_RATE = 1000;
  static readonly MIN_CHANGE = new Amount('61', AmountUnit.ckb);

  static calcFee(
    tx: Transaction,
    feeRate: number = Builder.MIN_FEE_RATE
  ): Amount {
    if (feeRate < Builder.MIN_FEE_RATE) {
      feeRate = Builder.MIN_FEE_RATE;
    }
    const txSize = tx.getSize();
    const fee = (feeRate / FEE_BASE) * txSize;
    return new Amount(fee.toString(), AmountUnit.shannon);
  }

  protected fee: Amount;

  protected constructor(
    protected feeRate: number = Builder.MIN_FEE_RATE,
    protected collector: Collector = PWCore.defaultCollector
  ) {}

  getFee(): Amount {
    return this.fee;
  }

  abstract async build(): Promise<Transaction>;
}
