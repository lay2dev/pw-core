import { CKBModel } from '../interfaces';
import { validators, transformers } from 'ckb-js-toolkit';

export class OutPoint implements CKBModel {
  constructor(public txHash: string, public index: string) {}

  sameWith({ txHash, index }: OutPoint): boolean {
    return this.txHash === txHash && this.index === index;
  }

  validate(): boolean {
    validators.ValidateOutPoint(transformers.TransformOutPoint(this));
    return true;
  }

  serializeJson(): object {
    return {
      tx_hash: this.txHash,
      index: this.index,
    };
  }
}
