import axios from 'axios';
import { BalanceOptions, CollectorOptions } from './collector';
import {
  Cell,
  Address,
  Amount,
  AmountUnit,
  OutPoint,
  SUDT,
  LockTypeOmniPw,
} from '../models';
import { SUDTCollector } from './sudt-collector';

export class PwCollector extends SUDTCollector {
  constructor(public apiBase: string) {
    super();
    this.apiBase = apiBase;
  }

  async getBalance(
    address: Address,
    options?: BalanceOptions
  ): Promise<Amount> {
    const lockScriptOptions = options.lockType
      ? (options.lockType as LockTypeOmniPw)
      : undefined;
    const result = await axios.get(
      `${this.apiBase}/cell/getCapacityByLockHash?lockHash=${address
        .toLockScript(lockScriptOptions)
        .toHash()}`
    );
    return new Amount(result.data.data, AmountUnit.shannon);
  }

  async collect(address: Address, options: CollectorOptions): Promise<Cell[]> {
    if (!options || !options.neededAmount) {
      throw new Error("'neededAmount' in options must be provided");
    }
    const lockScriptOptions = options.lockType
      ? (options.lockType as LockTypeOmniPw)
      : undefined;
    const cells: Cell[] = [];
    const result = await axios.get(
      `${this.apiBase}/cell/unSpent?lockHash=${address
        .toLockScript(lockScriptOptions)
        .toHash()}&capacity=${options.neededAmount.toHexString()}`
    );

    for (let { capacity, outPoint } of result.data.data) {
      capacity = new Amount(capacity, AmountUnit.shannon);
      outPoint = new OutPoint(outPoint.txHash, outPoint.index);
      cells.push(
        new Cell(
          capacity,
          address.toLockScript(lockScriptOptions),
          null,
          outPoint
        )
      );
    }

    return cells;
  }

  async getSUDTBalance(
    sudt: SUDT,
    address: Address,
    options?: BalanceOptions
  ): Promise<Amount> {
    const lockScriptOptions = options.lockType
      ? (options.lockType as LockTypeOmniPw)
      : undefined;
    const lockHash = address.toLockScript(lockScriptOptions).toHash();
    const typeHash = sudt.toTypeScript().toHash();
    const result = await axios.get(
      `${this.apiBase}/sudt/balance?lockHash=${lockHash}&typeHash=${typeHash}`
    );
    return new Amount(result.data.data.sudtAmount, AmountUnit.shannon);
  }

  async collectSUDT(
    sudt: SUDT,
    address: Address,
    options: CollectorOptions
  ): Promise<Cell[]> {
    if (!options || !options.neededAmount) {
      throw new Error("'neededAmount' in options must be provided");
    }
    const cells: Cell[] = [];
    const lockScriptOptions = options.lockType
      ? (options.lockType as LockTypeOmniPw)
      : undefined;
    const lockHash = address.toLockScript(lockScriptOptions).toHash();
    const typeHash = sudt.toTypeScript().toHash();

    const result = await axios.get(
      `${
        this.apiBase
      }/cell/unSpent?lockHash=${lockHash}&capacity=0x0&typeHash=${typeHash}&sudtAmount=${options.neededAmount.toHexString()}`
    );

    // eslint-disable-next-line prefer-const
    for (let { capacity, outPoint, type, data } of result.data.data) {
      capacity = new Amount(capacity, AmountUnit.shannon);
      outPoint = new OutPoint(outPoint.txHash, outPoint.index);
      cells.push(
        new Cell(
          capacity,
          address.toLockScript(lockScriptOptions),
          type,
          outPoint,
          data
        )
      );
    }

    return cells;
  }
}
