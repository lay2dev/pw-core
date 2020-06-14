import { Cell, Address, Amount } from '../models';

// export interface CollectorResults {
//   [Symbol.asyncIterator](): AsyncIterator<Cell>;
// }

export abstract class Collector {
  protected constructor() {}
  public abstract async collect(
    address: Address,
    neededAmount?: Amount
  ): Promise<Cell[]>;
}
