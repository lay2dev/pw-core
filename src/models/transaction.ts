import { CKBModel } from '../interfaces';
import { ECDSA_WITNESS_LEN } from '../constants';
import { validators, normalizers, transformers } from 'ckb-js-toolkit';
// import { SerializeTransaction } from 'ckb-js-toolkit-contrib/src/blockchain';
// import { signer } from 'ckb-js-toolkit-contrib/src';
import { SerializeTransaction } from '@ckb-lumos/types/lib/core';
import { RawTransaction } from '.';

export class Transaction implements CKBModel {
  public witnesses: string[];

  constructor(
    public raw: RawTransaction,
    witnessesLength: number[] = [ECDSA_WITNESS_LEN]
  ) {
    // fill witnesses with actural length to make tx size accurate
    this.witnesses = raw.inputs.map((_) => '0x');
    for (let i = 0; i < witnessesLength.length; i++) {
      this.witnesses[i] = '0x' + '0'.repeat(witnessesLength[i] - 2);
    }
  }

  getSize(): number {
    const tx = transformers.TransformTransaction(this);
    validators.ValidateTransaction(tx);
    return SerializeTransaction(normalizers.NormalizeTransaction(tx))
      .byteLength;
  }

  validate(): boolean {
    validators.ValidateTransaction(transformers.TransformTransaction(this));
    return true;
  }

  serializeJson(): object {
    return {
      ...this.raw,
      witnesses: this.witnesses,
    };
  }
}
