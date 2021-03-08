import { Address } from '../models';
import { Hasher, Keccak256Hasher } from '../hashers';

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

  hasher(): Hasher {
    return new Keccak256Hasher();
  }

  abstract async init(): Promise<Provider>;

  abstract async sign(message: string): Promise<string>;

  abstract async close();
}
