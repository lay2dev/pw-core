import { Cell, Address, Amount, OutPoint } from '..';
import { SUDT } from '../models';
import { SUDTCollector } from './sudt-collector';

export class DummyCollector extends SUDTCollector {
  getBalance(): Promise<Amount> {
    throw new Error('Method not implemented.');
  }
  // public collect(): CollectorResults {
  //   return [new Cell(new Amount('1000000'), this.address.toLockScript())];
  // }
  constructor() {
    super();
  }

  public async collect(address: Address): Promise<Cell[]> {
    const outPoint = new OutPoint(
      '0x79221866125b9aff33c4303a6c35bde25d235e7e10025a86ca2a5d6ad657f51f',
      '0x0'
    );
    const cell = new Cell(
      new Amount('1000000'),
      address.toLockScript(),
      null,
      outPoint
    );
    cell.validate();
    return [cell];
  }

  async getSUDTBalance(): Promise<Amount> {
    throw new Error('Method not implemented.');
  }

  async collectSUDT(sudt: SUDT, address: Address): Promise<Cell[]> {
    const outPoint = new OutPoint(
      '0x79221866125b9aff33c4303a6c35bde25d235e7e10025a86ca2a5d6ad657f51f',
      '0x0'
    );
    const cell = new Cell(
      new Amount('1000000'),
      address.toLockScript(),
      sudt.toTypeScript(),
      outPoint,
      new Amount('1000').toUInt128LE()
    );
    cell.validate();
    return [cell];
  }
}
