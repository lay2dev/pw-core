import { Cell, Address, Amount, LockType } from '../models';

export interface BalanceOptions {
  lockType?: LockType;
}

export interface CollectorOptions {
  neededAmount?: Amount;
  withData?: boolean;
  lockType?: LockType;
}

export abstract class Collector {
  // protected constructor() {}
  abstract getBalance(
    address: Address,
    options?: BalanceOptions
  ): Promise<Amount>;
  abstract collect(
    address: Address,
    options?: CollectorOptions
  ): Promise<Cell[]>;
}
