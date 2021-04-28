import { Hasher } from '.';
import { Reader } from '../ckb-js-toolkit';
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
    let array: Buffer;
    if (data instanceof Reader) {
      /** Reader type params not enter this branch, it's weired */
      array = Buffer.from(data.serializeJson().replace('0x', ''));
    } else if (data instanceof ArrayBuffer) {
      array = Buffer.from(new Uint8Array(data));
    } else if (typeof data === 'string') {
      array = Buffer.from(data);
    } else {
      array = Buffer.from(new Uint8Array(new Reader(data).toArrayBuffer()));
    }
    this.h.update(array);
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
