import axios from 'axios';
import { Collector } from './collector';
import { Cell, Address, Amount, AmountUnit, OutPoint } from '..';

export class PwCollector extends Collector {
  constructor(address: Address) {
    super(address);
  }

  public async collect(neededAmount: Amount): Promise<Cell[]> {
    const cells: Cell[] = [];

    const res = await axios.get(
      `https://cellapi.ckb.pw/cell/unSpent?lockHash=${this.address
        .toLockScript()
        .toHash()}&capacity=${neededAmount.toHexString()}`
    );

    for (let { capacity, outPoint } of res.data) {
      capacity = new Amount(capacity, AmountUnit.shannon);
      outPoint = new OutPoint(outPoint.txHash, outPoint.index);
      cells.push(
        new Cell(capacity, this.address.toLockScript(), null, outPoint)
      );
    }

    return cells;
  }
}
