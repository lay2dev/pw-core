// type Option<T> = T | null;

// https://github.com/nervosnetwork/ckb/blob/master/util/types

type Uint64 = string;
type Uint32 = string;

type Capacity = Uint64;
type BlockNumber = Uint64;
type JsonBytes = string;
type H256 = string;

// https://github.com/nervosnetwork/ckb/blob/develop/util/jsonrpc-types/src/blockchain.rs
export type Script = {
  args: string;
  code_hash: string;
  hash_type: string;
};

export type OutPoint = {
  index: Uint32;
  tx_hash: H256;
};

export type Cell = {
  output: CellOutput;
  output_data: JsonBytes;
  out_point: OutPoint;
  block_number: BlockNumber;
  tx_index: Uint32;
};

export type CellOutput = {
  capacity: Capacity;
  /// The lock script.
  lock: Script;
  type?: Script;
};

// https://github.com/nervosnetwork/ckb-indexer/blob/master/src/service.rs
export type SearchKey = {
  script: Script;
  script_type: ScriptType;
  filter?: SearchKeyFilter;
};

export enum ScriptType {
  Type = 'type',
  Lock = 'lock',
}

export type SearchKeyFilter = {
  script?: Script;
  output_data_len_range?: [Uint64, Uint64];
  output_capacity_range?: [Uint64, Uint64];
  block_range?: [BlockNumber, BlockNumber];
};

export enum Order {
  Desc = 'desc',
  Asc = 'asc',
}
