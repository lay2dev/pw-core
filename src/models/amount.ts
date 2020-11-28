import JSBI from 'jsbi';
import {
  toBigUInt128LE,
  readBigUInt128LE,
  bnStringToRationalNumber,
  rationalNumberToBnString,
} from '../utils';

export enum AmountUnit {
  shannon,
  ckb = 8,
}

export interface FormatOptions {
  section?: 'integer' | 'decimal';
  pad?: boolean;
  commify?: boolean;
  fixed?: number;
}

export class Amount {
  static ZERO = new Amount('0');

  add(val: Amount): Amount {
    return new Amount(JSBI.add(this.toBigInt(), val.toBigInt()).toString(), 0);
  }

  sub(val: Amount): Amount {
    return new Amount(
      JSBI.subtract(this.toBigInt(), val.toBigInt()).toString(),
      0
    );
  }

  mul(val: Amount): Amount {
    const res = JSBI.divide(
      JSBI.multiply(this.toBigInt(), val.toBigInt()),
      JSBI.BigInt(10 ** (val.decimals + this.decimals))
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
  private decimals: number;

  constructor(amount: string, decimals: number | AmountUnit = AmountUnit.ckb) {
    if (!Number.isInteger(decimals) || decimals < 0) {
      throw new Error(`decimals ${decimals} must be a natural number`);
    }
    this.decimals = decimals;

    if (Number.isNaN(amount)) {
      throw new Error(`amount ${amount} must be a valid number`);
    }
    this.amount = rationalNumberToBnString(amount, decimals);
  }

  toString(
    decimals: number | AmountUnit = AmountUnit.ckb,
    options?: FormatOptions
  ): string {
    return bnStringToRationalNumber(
      this.toBigInt().toString(),
      decimals,
      options
    );
  }

  toBigInt() {
    return JSBI.BigInt(this.amount);
  }

  toHexString() {
    return `0x${this.toBigInt().toString(16)}`;
  }

  toUInt128LE(): string {
    return toBigUInt128LE(JSBI.BigInt(this.toHexString()));
  }

  static fromUInt128LE(hex) {
    return new Amount(
      `0x${readBigUInt128LE(hex).toString(16)}`,
      AmountUnit.shannon
    );
  }
}
