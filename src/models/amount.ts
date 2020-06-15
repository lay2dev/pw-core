import JSBI from 'jsbi';
import { ckbToShannon, shannonToCKB } from '../utils';
import { HexStringToBigInt } from 'ckb-js-toolkit';

export enum AmountUnit {
  ckb,
  shannon,
}

export interface FormatOptions {
  section?: 'full' | 'whole' | 'fraction';
  pad?: boolean;
  commify?: boolean;
}

export class Amount {
  static ADD(a: Amount, b: Amount): Amount {
    const res = JSBI.add(a.toBigInt(), b.toBigInt()).toString();
    return new Amount(res, AmountUnit.shannon);
  }

  static SUB(a: Amount, b: Amount): Amount {
    const res = JSBI.subtract(a.toBigInt(), b.toBigInt()).toString();
    return new Amount(res, AmountUnit.shannon);
  }

  static MUL(a: Amount, b: Amount): Amount {
    const res = JSBI.multiply(a.toBigInt(), b.toBigInt()).toString();
    return new Amount(res, AmountUnit.shannon);
  }

  static GT(a: Amount, b: Amount): boolean {
    return JSBI.GT(a.toBigInt(), b.toBigInt());
  }

  static GTE(a: Amount, b: Amount): boolean {
    return JSBI.greaterThanOrEqual(a.toBigInt(), b.toBigInt());
  }

  static LT(a: Amount, b: Amount): boolean {
    return JSBI.LT(a.toBigInt(), b.toBigInt());
  }

  static LTE(a: Amount, b: Amount): boolean {
    return JSBI.lessThanOrEqual(a.toBigInt(), b.toBigInt());
  }

  static EQ(a: Amount, b: Amount): boolean {
    return JSBI.EQ(a.toBigInt(), b.toBigInt());
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

  toString(unit: AmountUnit, options?: FormatOptions): string {
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
