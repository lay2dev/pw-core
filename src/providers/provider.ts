import { Address } from '../models';

export enum Platform {
  ckb = 0,
  eth,
  eos,
  tron,
  // libra
}

export abstract class Provider {
  constructor(public readonly platform: Platform) {}

  private _address: Address;
  get address(): Address {
    return this._address;
  }
  set address(value: Address) {
    this._address = value;
  }

  abstract async init(): Promise<Provider>;

  async sign(): Promise<string> {
    return '';
  }
}
