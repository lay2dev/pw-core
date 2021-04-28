import { Reader } from '../ckb-js-toolkit';

export interface HashMethod {
  update(data: string | Uint8Array): HashMethod;
  digest(data?: string | Uint8Array): string | Uint8Array;
  digest(encoding: string): string | Uint8Array;
}

export abstract class Hasher {
  constructor(protected h: HashMethod) {}
  abstract update(data: string | ArrayBuffer | Reader): Hasher;
  abstract digest(): Reader;
  abstract reset(): void;
  protected setH(h: HashMethod): void {
    this.h = h;
  }
  hash(data: string | Uint8Array | Reader): Reader {
    return this.update(data).digest();
  }
}
