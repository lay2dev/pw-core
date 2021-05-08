import { validators, transformers } from '../ckb-js-toolkit';
import { CKBModel } from '..';

export class OutPoint implements CKBModel {
  static fromRPC(data: any): OutPoint | undefined {
    if (!data) return undefined;
    validators.ValidateOutPoint(data);
    return new OutPoint(data.tx_hash, data.index);
  }

  constructor(public txHash: string, public index: string) {}

  sameWith(outPoint: OutPoint): boolean {
    validators.ValidateOutPoint(transformers.TransformOutPoint(outPoint));
    return this.txHash === outPoint.txHash && this.index === outPoint.index;
  }

  validate(): OutPoint {
    validators.ValidateOutPoint(transformers.TransformOutPoint(this));
    return this;
  }

  serializeJson(): object {
    return {
      tx_hash: this.txHash,
      index: this.index,
    };
  }
}
