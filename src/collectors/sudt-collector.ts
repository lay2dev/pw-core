import { Cell, Address, Amount } from '../models';
import { SUDT } from '../models/sudt';
import { Collector, CollectorOptions } from './collector';

export abstract class SUDTCollector extends Collector {
  protected constructor() {
    super();
  }
  abstract async getSUDTBalance(sudt: SUDT, address: Address): Promise<Amount>;
  abstract async collectSUDT(
    sudt: SUDT,
    address: Address,
    options?: CollectorOptions
  ): Promise<Cell[]>;
}
