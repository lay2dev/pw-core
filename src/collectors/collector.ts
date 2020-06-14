import { Cell, Address, Amount } from '../models';

// export interface CollectorResults {
//   [Symbol.asyncIterator](): AsyncIterator<Cell>;
// }

export abstract class Collector {
  protected constructor() {}
  abstract async getBalance(address: Address): Promise<Amount>;
  abstract async collect(
    address: Address,
    neededAmount?: Amount
  ): Promise<Cell[]>;
}
