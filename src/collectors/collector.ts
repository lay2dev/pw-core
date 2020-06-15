import { Cell, Address, Amount } from '../models';

// export interface CollectorResults {
//   [Symbol.asyncIterator](): AsyncIterator<Cell>;
// }

export interface CollectorOptions {
  withData?: boolean;
}
export abstract class Collector {
  protected constructor() {}
  abstract async getBalance(address: Address): Promise<Amount>;
  abstract async collect(
    address: Address,
    neededAmount?: Amount,
    options?: CollectorOptions
  ): Promise<Cell[]>;
}
