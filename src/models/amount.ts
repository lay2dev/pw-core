import JSBI from 'jsbi';
import {
  toBigUInt128LE,
  readBigUInt128LE,
  rationalNumberToBnString,
  bnStringToRationalNumber,
} from '../utils';
import { HexStringToBigInt } from 'ckb-js-toolkit';

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
      JSBI.BigInt(10 ** (val.decimal + this.decimal))
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
  private decimal: number;

  constructor(amount: string, unit?: AmountUnit);
  constructor(amount: string, decimal: number = 8) {
    if (Number.isNaN(amount)) {
      throw new Error(`Amount ${amount} is not a valid number`);
    }
    amount = `${amount}`;

    if (!Number.isInteger(decimal) || decimal < 0) {
      throw new Error(`Decimal ${decimal} must be a natural number`);
    }
    this.decimal = decimal;

    if (amount.startsWith('0x')) {
      amount = HexStringToBigInt(amount).toString();
    }

    if (decimal === AmountUnit.shannon) {
      try {
        amount = amount.match(/^0*(\d*)$/)[1];
        if (amount === '') {
          amount = '0';
        }
      } catch (e) {
        throw new Error(`Amount ${amount} is invalid`);
      }
    }
    this.amount = amount;
    this.decimal = decimal;
  }
  toString(
    decimal = AmountUnit.ckb as number,
    options?: FormatOptions
  ): string {
    return bnStringToRationalNumber(
      this.toBigInt().toString(),
      decimal,
      options
    );
  }

  toBigInt(decimal?: number) {
    return JSBI.BigInt(
      rationalNumberToBnString(this.amount, decimal || this.decimal)
    );
  }

  toHexString() {
    return `0x${this.toBigInt().toString(16)}`;
  }

  toUInt128LE(): string {
    return toBigUInt128LE(BigInt(this.toHexString()));
  }

  static fromUInt128LE(hex) {
    return new Amount(
      `0x${readBigUInt128LE(hex).toString(16)}`,
      AmountUnit.shannon
    );
  }
}
