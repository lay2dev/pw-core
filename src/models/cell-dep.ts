import { OutPoint } from '.';
import { DepType, CKBModel } from '..';
import { validators, transformers } from 'ckb-js-toolkit';

export class CellDep implements CKBModel {
  constructor(public depType: DepType, public outPoint: OutPoint) {}

  validate(): boolean {
    validators.ValidateCellDep(transformers.TransformCellDep(this));
    return true;
  }

  serializeJson(): object {
    return {
      dep_type: this.depType,
      out_point: this.outPoint,
    };
  }
}
