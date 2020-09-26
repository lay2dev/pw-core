import axios from 'axios';
import { Collector } from './collector';
import { Cell, Address, Amount, AmountUnit, OutPoint } from '..';
import { SUDT } from '../models/sudt';

export class PwCollector extends Collector {
  constructor(public apiBase: string) {
    super();
    this.apiBase = apiBase;
  }

  async getBalance(address: Address): Promise<Amount> {
    const res = await axios.get(
      `${
        this.apiBase
      }/cell/getCapacityByLockHash?lockHash=${address.toLockScript().toHash()}`
    );
    return new Amount(res.data.data, AmountUnit.shannon);
  }

  async collect(address: Address, neededAmount: Amount): Promise<Cell[]> {
    const cells: Cell[] = [];

    const res = await axios.get(
      `${
        this.apiBase
      }/cell/unSpent?lockHash=${address
        .toLockScript()
        .toHash()}&capacity=${neededAmount.toHexString()}`
    );

    for (let { capacity, outPoint } of res.data.data) {
      capacity = new Amount(capacity, AmountUnit.shannon);
      outPoint = new OutPoint(outPoint.txHash, outPoint.index);
      cells.push(new Cell(capacity, address.toLockScript(), null, outPoint));
    }

    return cells;
  }

  async getSUDTBalance(sudt: SUDT, address: Address): Promise<Amount> {
    const lockHash = address.toLockScript().toHash();
    const typeHash = sudt.toTypeScript().toHash();
    const res = await axios.get(
      `${this.apiBase}/sudt/balance?lockHash=${lockHash}&typeHash=${typeHash}`
    );
    return new Amount(res.data.data.sudtAmount, AmountUnit.shannon);
  }

  async collectSUDT(
    sudt: SUDT,
    address: Address,
    neededAmount?: Amount
  ): Promise<Cell[]> {
    const cells: Cell[] = [];
    const lockHash = address.toLockScript().toHash();
    const typeHash = sudt.toTypeScript().toHash();

    const res = await axios.get(
      `${
        this.apiBase
      }/cell/unSpent?lockHash=${lockHash}&typeHash=${typeHash}&sudtAmount=${neededAmount.toHexString()}`
    );

    for (let { capacity, outPoint, type, data } of res.data.data) {
      capacity = new Amount(capacity, AmountUnit.shannon);
      outPoint = new OutPoint(outPoint.txHash, outPoint.index);
      cells.push(
        new Cell(capacity, address.toLockScript(), type, outPoint, data)
      );
    }

    return cells;
  }
}
