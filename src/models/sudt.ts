import { Script } from '.';
import PWCore from '../core';

export interface SudtInfo {
  symbol: string;
  decimals: number;
  name: string;
}
export class SUDT {
  constructor(readonly issuerLockHash: string, readonly info?: SudtInfo) {}

  toTypeScript(): Script {
    const { codeHash, hashType } = PWCore.config.sudtType.script;
    return new Script(codeHash, this.issuerLockHash, hashType);
  }
}
