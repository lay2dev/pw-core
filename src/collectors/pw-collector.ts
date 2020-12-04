import axios from 'axios';
import { CollectorOptions } from './collector';
import { SUDTCollector } from './sudt-collector';
import { Cell, Address, Amount, AmountUnit, OutPoint, SUDT } from '..';

export class PwCollector extends SUDTCollector {
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

  async collect(address: Address, options: CollectorOptions): Promise<Cell[]> {
    if (!options || !options.neededAmount) {
      throw new Error("'neededAmount' in options must be provided");
    }
    const cells: Cell[] = [];
    const res = await axios.get(
      `${
        this.apiBase
      }/cell/unSpent?lockHash=${address
        .toLockScript()
        .toHash()}&capacity=${options.neededAmount.toHexString()}`
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
    options: CollectorOptions
  ): Promise<Cell[]> {
    if (!options || !options.neededAmount) {
      throw new Error("'neededAmount' in options must be provided");
    }
    const cells: Cell[] = [];
    const lockHash = address.toLockScript().toHash();
    const typeHash = sudt.toTypeScript().toHash();

    const res = await axios.get(
      `${
        this.apiBase
      }/cell/unSpent?lockHash=${lockHash}&capacity=0x0&typeHash=${typeHash}&sudtAmount=${options.neededAmount.toHexString()}`
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
