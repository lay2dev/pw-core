import { CKBModel, WitnessArgs } from '../interfaces';
import { ECDSA_WITNESS_LEN } from '../constants';
import {
  validators,
  normalizers,
  transformers,
  Reader,
} from '../ckb-js-toolkit';
import { SerializeTransaction, SerializeWitnessArgs } from '../ckb-lumos/core';
import { RawTransaction } from '.';

export class Transaction implements CKBModel {
  public witnesses: string[];

  constructor(
    public raw: RawTransaction,
    public witnessArgs: (WitnessArgs | string)[],
    _witnessLengths: number[] = [ECDSA_WITNESS_LEN]
  ) {
    this.witnesses = raw.inputs.map((_) => '0x');
    // for (let i = 0; i < witnessLengths.length; i++) {
    //   this.witnesses[i] = '0x' + '0'.repeat(witnessLengths[i] - 2);
    // }
    if (!Array.isArray(witnessArgs))
      throw new Error('[Transaction] - witnessArgs must be an Array!');
    for (let i = 0; i < witnessArgs.length; i++) {
      if (typeof witnessArgs[i] !== 'string') {
        this.witnesses[i] = new Reader(
          SerializeWitnessArgs(
            normalizers.NormalizeWitnessArgs(this.witnessArgs[i] as WitnessArgs)
          )
        ).serializeJson();
      }
    }
  }

  sameWith(tx: Transaction): boolean {
    validators.ValidateTransaction(transformers.TransformTransaction(tx));
    return (
      tx.raw.sameWith(this.raw) &&
      tx.witnesses.join('-') === this.witnesses.join('-')
    );
  }

  getSize(): number {
    const tx = transformers.TransformTransaction(this);
    validators.ValidateTransaction(tx);

    // TODO: find out why the size is always smaller than the correct value by exact '4'
    return (
      SerializeTransaction(normalizers.NormalizeTransaction(tx)).byteLength + 4
    );
  }

  validate(): Transaction {
    validators.ValidateTransaction(transformers.TransformTransaction(this));
    return this;
  }

  transform(): object {
    return transformers.TransformTransaction(this.serializeJson());
  }

  serializeJson(): object {
    return {
      ...this.raw,
      witnesses: this.witnesses,
    };
  }
}
