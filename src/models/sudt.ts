import { Script } from '.';
import { Amount, AmountUnit } from '..';
import { utils } from '@ckb-lumos/base';
import PWCore from '../core';

export class SUDT {
  static convertDataToAmount(data: string): Amount {
    return new Amount(
      utils.readBigUInt128LE(data).toString(10),
      AmountUnit.shannon
    );
  }

  static convertAmountToData(amount: Amount) {
    return utils.toBigUInt128LE(BigInt(amount.toHexString()));
  }

  constructor(readonly issuerLockHash: string) {}

  toTypeScript(): Script {
    const { codeHash, hashType } = PWCore.config.sudtType.script;
    return new Script(codeHash, this.issuerLockHash, hashType);
  }
}
