import { Address } from '../models';
import { Blake2bHasher, Hasher } from '../hashers';

export enum Platform {
  ckb = 0,
  eth,
  eos,
  tron,
  // btc,
  // doge,
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
    return new Blake2bHasher();
  }

  abstract async init(): Promise<Provider>;

  abstract async sign(message: string): Promise<string>;

  abstract async close();
}
