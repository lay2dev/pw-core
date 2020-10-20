import { Script } from '.';
import PWCore from '../core';

export class SUDT {
  constructor(readonly issuerLockHash: string) {}

  toTypeScript(): Script {
    const { codeHash, hashType } = PWCore.config.sudtType.script;
    return new Script(codeHash, this.issuerLockHash, hashType);
  }
}
