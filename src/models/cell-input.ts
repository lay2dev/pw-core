import { OutPoint } from './out-point';
import { CKBModel } from '../interfaces';
import { validators, transformers } from 'ckb-js-toolkit';

export class CellInput implements CKBModel {
  static fromRPC(data: any): CellInput {
    if (!data) {
      throw new Error('Cannot create CellInput from empty data');
    }
    validators.ValidateCellInput(data);
    return new CellInput(data.previous_output, data.since);
  }

  constructor(public previousOutput: OutPoint, public since: string = '0x0') {}

  sameWith(cellInput: CellInput): boolean {
    validators.ValidateCellInput(transformers.TransformCellInput(cellInput));
    return (
      cellInput.previousOutput.sameWith(this.previousOutput) &&
      cellInput.since === this.since
    );
  }

  validate(): boolean {
    validators.ValidateCellInput(transformers.TransformCellInput(this));
    return true;
  }

  serializeJson(): object {
    return {
      since: this.since,
      previous_output: this.previousOutput,
    };
  }
}
