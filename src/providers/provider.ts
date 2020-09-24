import { Address } from '..';

export enum Platform {
  ckb,
  eth,
  // btc,
  // eos,
  // tron,
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

  abstract async sign(message: string): Promise<string>;

  abstract async close();
}
