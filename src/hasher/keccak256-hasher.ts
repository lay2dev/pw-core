import { Hasher } from '.';
import { Reader } from 'ckb-js-toolkit';
import keccak from 'keccak';

export class Keccak256Hasher extends Hasher {
  constructor() {
    super(keccak('keccak256'));
  }

  update(data: string | ArrayBuffer | Reader): Hasher {
    this.h.update(data.toString());
    return this;
  }

  digest(): Reader {
    const hex = '0x' + this.h.digest('hex').toString();
    return new Reader(hex);
  }

  reset(): void {
    this.h = keccak('keccak256');
  }
}
