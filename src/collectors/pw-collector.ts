import axios from 'axios';
import { Collector } from './collector';
import { Cell, Address, Amount, AmountUnit, OutPoint } from '..';

export class PwCollector extends Collector {
  constructor() {
    super();
  }

  async getBalance(address: Address): Promise<Amount> {
    const res = await axios.get(
      `https://cellapi.ckb.pw/cell/getCapacityByLockHash?lockHash=${address
        .toLockScript()
        .toHash()}`
    );
    return new Amount(res.data, AmountUnit.shannon);
  }

  async collect(address: Address, neededAmount: Amount): Promise<Cell[]> {
    const cells: Cell[] = [];

    const res = await axios.get(
      `https://cellapi.ckb.pw/cell/unSpent?lockHash=${address
        .toLockScript()
        .toHash()}&capacity=${neededAmount.toHexString()}`
    );

    for (let { capacity, outPoint } of res.data) {
      capacity = new Amount(capacity, AmountUnit.shannon);
      outPoint = new OutPoint(outPoint.txHash, outPoint.index);
      cells.push(new Cell(capacity, address.toLockScript(), null, outPoint));
    }

    return cells;
  }
}
