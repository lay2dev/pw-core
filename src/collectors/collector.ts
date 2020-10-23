import { Cell, Address, Amount } from '../models';

export interface CollectorOptions {
  neededAmount?: Amount;
  withData?: boolean;
}
export abstract class Collector {
  protected constructor() {}
  abstract async getBalance(address: Address): Promise<Amount>;
  abstract async collect(
    address: Address,
    options?: CollectorOptions
  ): Promise<Cell[]>;
}
