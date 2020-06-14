import { Address, Amount, Script, CellDep, Transaction } from './models';

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

export interface BlockHeader {
  compact_target: string;
  number: string;
  parent_hash: string;
  nonce: string;
  timestamp: string;
  transactions_root: string;
  proposals_hash: string;
  uncles_hash: string;
  version: string;
  epoch: string;
  dao: string;
}

export interface Block {
  header: BlockHeader;
  transactions: Transaction[];
  proposals: string[];
  uncles: string[];
}

export interface CellbaseWitness {
  lock: Script;
  message: string;
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
  table: CellDep;
  daoType: ConfigItem;
  defaultLock: ConfigItem;
  multiSigLock: ConfigItem;
  pwLock: ConfigItem;
}

export interface ReceivePair {
  address: Address;
  amount: Amount;
}
