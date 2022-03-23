import { Cell, Address, Amount } from '../models';

export interface CollectorOptions {
  neededAmount?: Amount;
  withData?: boolean;
}
export abstract class Collector {
  // protected constructor() {}
  abstract getBalance(address: Address): Promise<Amount>;
  abstract collect(
    address: Address,
    options?: CollectorOptions
  ): Promise<Cell[]>;
}
