import { Hasher } from '.';
import { Reader } from 'ckb-js-toolkit';
import blake2b from 'blake2b';

export class Blake2bHasher extends Hasher {
  constructor() {
    const h = blake2b(
      32,
      null,
      null,
      new Uint8Array(Reader.fromRawString('ckb-default-hash').toArrayBuffer())
    );
    super(h);
  }

  update(data: string | ArrayBuffer): Hasher {
    this.h.update(new Uint8Array(new Reader(data).toArrayBuffer()));
    return this;
  }

  digest(): Reader {
    const out = new Uint8Array(32);
    this.h.digest(out);
    return new Reader(out.buffer);
  }

  reset(): void {
    this.h = blake2b(
      32,
      null,
      null,
      new Uint8Array(Reader.fromRawString('ckb-default-hash').toArrayBuffer())
    );
  }
}
