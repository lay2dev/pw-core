import axios from 'axios';
import { Collector } from './collector';
import { Cell, Address, Amount, AmountUnit, OutPoint } from '..';

export class PwCollector extends Collector {
  constructor() {
    super();
  }
  public async collect(
    address: Address,
    neededAmount: Amount
  ): Promise<Cell[]> {
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
