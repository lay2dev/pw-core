import { Address } from '../models';
import { Blake2bHasher, Hasher } from '../hashers';
import { Message } from '../signers';

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

  abstract init(): Promise<Provider>;

  abstract sign(message: Message): Promise<string>;

  abstract close();
}
