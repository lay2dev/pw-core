import { Cell, Address, Amount } from '../models';

// export interface CollectorResults {
//   [Symbol.asyncIterator](): AsyncIterator<Cell>;
// }

export abstract class Collector {
  protected constructor(public address: Address) {}
  public abstract async collect(neededAmount?: Amount): Promise<Cell[]>;
}
