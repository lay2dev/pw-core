import PWCore from '../core';
import { CKBModel } from '../interfaces';
import { CellDep, Cell } from '../models';
import { SerializeRawTransaction } from '@ckb-lumos/types/lib/core';
import { validators, normalizers, Reader, transformers } from 'ckb-js-toolkit';
import { CellInput } from './cell-input';
import { Blake2bHasher } from '../hashers';

export class RawTransaction implements CKBModel {
  public inputs: CellInput[];
  public outputsData: string[];

  constructor(
    public inputCells: Cell[],
    public outputs: Cell[],
    public cellDeps: CellDep[] = [
      PWCore.config.defaultLock.cellDep,
      PWCore.config.pwLock.cellDep,
    ],
    public headerDeps: string[] = [],
    public readonly version: string = '0x0'
  ) {
    this.inputs = inputCells.map((i) => i.toCellInput());
    this.outputsData = this.outputs.map((o) => o.getHexData());
  }
  sameWith(raw: RawTransaction): boolean {
    validators.ValidateTransaction(transformers.TransformTransaction(raw));
    return raw.toHash() === this.toHash();
  }

  toHash() {
    const rawTx = transformers.TransformRawTransaction(this);
    const hasher = new Blake2bHasher();
    return hasher
      .hash(
        new Reader(
          SerializeRawTransaction(normalizers.NormalizeRawTransaction(rawTx))
        )
      )
      .serializeJson();
  }

  validate(): boolean {
    validators.ValidateRawTransaction(
      transformers.TransformRawTransaction(this)
    );
    return true;
  }

  serializeJson(): object {
    return {
      version: this.version,
      cell_deps: this.cellDeps,
      header_deps: this.headerDeps,
      inputs: this.inputs,
      outputs: this.outputs,
      outputs_data: this.outputsData,
    };
  }
}
