import { Amount } from '../models';
import { Collector } from './collector';

export class NullCollector extends Collector {
  constructor() {
    super();
  }
  async getBalance() {
    return Amount.ZERO;
  }
  async collect() {
    return [];
  }
}
