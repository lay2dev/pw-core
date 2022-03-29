import { CollectorOptions } from './collector';
import {
  Address,
  AddressType,
  Amount,
  Cell,
  LockTypeOmniPw,
  OutPoint,
} from '../models';
import { SUDT } from '../models/sudt';
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

  public async collect(
    address: Address,
    options?: CollectorOptions
  ): Promise<Cell[]> {
    const outPoint = new OutPoint(
      '0x79221866125b9aff33c4303a6c35bde25d235e7e10025a86ca2a5d6ad657f51f',
      '0x0'
    );
    const lockScriptOptions =
      options && options.lockType && address.addressType !== AddressType.ckb
        ? (options.lockType as LockTypeOmniPw)
        : undefined;
    const cell = new Cell(
      new Amount('1000000'),
      address.toLockScript(lockScriptOptions),
      null,
      outPoint
    );
    cell.validate();
    return [cell];
  }

  async getSUDTBalance(): Promise<Amount> {
    throw new Error('Method not implemented.');
  }

  async collectSUDT(
    sudt: SUDT,
    address: Address,
    options?: CollectorOptions
  ): Promise<Cell[]> {
    const outPoint = new OutPoint(
      '0x79221866125b9aff33c4303a6c35bde25d235e7e10025a86ca2a5d6ad657f51f',
      '0x0'
    );
    const lockScriptOptions =
      options && options.lockType && address.addressType !== AddressType.ckb
        ? (options.lockType as LockTypeOmniPw)
        : undefined;
    const cell = new Cell(
      new Amount('1000000'),
      address.toLockScript(lockScriptOptions),
      sudt.toTypeScript(),
      outPoint,
      new Amount('1000').toUInt128LE()
    );
    cell.validate();
    return [cell];
  }
}
