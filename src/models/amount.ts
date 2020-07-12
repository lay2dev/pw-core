import JSBI from 'jsbi';
import { ckbToShannon, shannonToCKB, BASE } from '../utils';
import { HexStringToBigInt } from 'ckb-js-toolkit';

export enum AmountUnit {
  ckb,
  shannon,
}

export interface FormatOptions {
  section?: 'full' | 'whole' | 'fraction';
  pad?: boolean;
  commify?: boolean;
  fixed?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
}

export class Amount {
  static ZERO = new Amount('0');

  add(val: Amount): Amount {
    const res = JSBI.add(this.toBigInt(), val.toBigInt()).toString();
    return new Amount(res, AmountUnit.shannon);
  }

  sub(val: Amount): Amount {
    const res = JSBI.subtract(this.toBigInt(), val.toBigInt()).toString();
    return new Amount(res, AmountUnit.shannon);
  }

  mul(val: Amount): Amount {
    const res = JSBI.divide(
      JSBI.multiply(this.toBigInt(), val.toBigInt()),
      JSBI.BigInt(BASE)
    ).toString();
    return new Amount(res, AmountUnit.shannon);
  }

  gt(val: Amount): boolean {
    return JSBI.GT(this.toBigInt(), val.toBigInt());
  }

  gte(val: Amount): boolean {
    return JSBI.greaterThanOrEqual(this.toBigInt(), val.toBigInt());
  }

  lt(val: Amount): boolean {
    return JSBI.LT(this.toBigInt(), val.toBigInt());
  }

  lte(val: Amount): boolean {
    return JSBI.lessThanOrEqual(this.toBigInt(), val.toBigInt());
  }

  eq(val: Amount): boolean {
    return JSBI.EQ(this.toBigInt(), val.toBigInt());
  }

  private amount: string;
  private unit: AmountUnit;

  constructor(amount: string, unit: AmountUnit = AmountUnit.ckb) {
    if (Number.isNaN(Number(amount))) {
      throw new Error(`Amount ${amount} is not a valid ${unit} value`);
    }

    if (amount.startsWith('0x')) {
      amount = HexStringToBigInt(amount).toString();
    }

    if (unit === AmountUnit.shannon) {
      try {
        amount = amount.match(/^0*(\d*)$/)[1];
        if (amount === '') {
          amount = '0';
        }
      } catch (e) {
        throw new Error(`Amount ${amount} is not a valid ${unit} value`);
      }
    } else if (unit !== AmountUnit.ckb) {
      throw new Error(`Invalid unit ${unit}`);
    }

    this.amount = amount;
    this.unit = unit;
  }

  toString(unit = AmountUnit.ckb, options?: FormatOptions): string {
    if (unit === AmountUnit.shannon) {
      return this.unit === AmountUnit.shannon
        ? this.amount
        : ckbToShannon(this.amount);
    } else if (unit === AmountUnit.ckb) {
      return shannonToCKB(
        this.unit === AmountUnit.shannon
          ? this.amount
          : ckbToShannon(this.amount),
        options
      );
    }
    throw new Error(`${unit} is not a valid unit`);
  }

  toBigInt() {
    if (this.unit === AmountUnit.ckb) {
      return JSBI.BigInt(this.toString(AmountUnit.shannon));
    }
    return JSBI.BigInt(this.amount);
  }

  toHexString() {
    return `0x${this.toBigInt().toString(16)}`;
  }
}
