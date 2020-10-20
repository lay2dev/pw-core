import { Cell, Address, Amount } from '../models';
import { SUDT } from '../models/sudt';

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
  abstract async getSUDTBalance(sudt: SUDT, address: Address): Promise<Amount>;
  abstract async collectSUDT(
    sudt: SUDT,
    address: Address,
    neededAmount?: Amount,
    options?: CollectorOptions
  ): Promise<Cell[]>;
}
