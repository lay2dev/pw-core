import { BalanceOptions, Collector, CollectorOptions } from './collector';
import { Address, Amount, Cell } from '../models';
import { SUDT } from '../models/sudt';

export abstract class SUDTCollector extends Collector {
  protected constructor() {
    super();
  }
  abstract getSUDTBalance(
    sudt: SUDT,
    address: Address,
    options?: BalanceOptions
  ): Promise<Amount>;
  abstract collectSUDT(
    sudt: SUDT,
    address: Address,
    options?: CollectorOptions
  ): Promise<Cell[]>;
}
