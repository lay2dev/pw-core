import { OutPoint } from './out-point';
import { DepType, CKBModel } from '../interfaces';
import { validators, transformers } from 'ckb-js-toolkit';

export class CellDep implements CKBModel {
  static fromRPC(data: any): CellDep | undefined {
    if (!data) return undefined;
    validators.ValidateCellDep(data);
    return new CellDep(data.dep_type, data.out_point);
  }

  constructor(public depType: DepType, public outPoint: OutPoint) {}

  validate(): boolean {
    validators.ValidateCellDep(transformers.TransformCellDep(this));
    return true;
  }

  sameWith(cellDep: CellDep): boolean {
    validators.ValidateCellDep(transformers.TransformCellDep(cellDep));
    return (
      cellDep.depType === this.depType &&
      cellDep.outPoint.sameWith(this.outPoint)
    );
  }

  serializeJson(): object {
    return {
      dep_type: this.depType,
      out_point: this.outPoint,
    };
  }
}
