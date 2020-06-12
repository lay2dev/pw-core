import { OutPoint } from '.';
import { CKBModel } from '..';
import { validators, transformers } from 'ckb-js-toolkit';

export class CellInput implements CKBModel {
  constructor(public previousOutput: OutPoint, public since: string = '0x0') {}

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
