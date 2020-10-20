import { Script, CellDep } from './models';

export interface CKBModel {
  validate(): any;
  sameWith(model: any): boolean;
  serializeJson(): object;
}

export enum HashType {
  data = 'data',
  type = 'type',
}

export enum DepType {
  code = 'code',
  depGroup = 'dep_group',
}

export interface WitnessArgs {
  lock: string;
  input_type: string;
  output_type: string;
}

export interface ConfigItem {
  cellDep: CellDep;
  script: Script;
}

export interface Config {
  daoType: ConfigItem;
  defaultLock: ConfigItem;
  multiSigLock: ConfigItem;
  pwLock: ConfigItem;
  sudtType: ConfigItem;
  acpLockList: Script[];
}
