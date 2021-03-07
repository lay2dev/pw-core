// https://github.com/nervosnetwork/ckb/blob/master/util/types
type Uint64 = string;
type Uint32 = string;

type Capacity = Uint64;
type BlockNumber = Uint64;

// https://github.com/nervosnetwork/ckb/blob/develop/util/jsonrpc-types/src/bytes.rs#L11
/// | JSON       | Binary                               |
/// | ---------- | ------------------------------------ |
/// | "0x"       | Empty binary                         |
/// | "0x00"     | Single byte 0                        |
/// | "0x636b62" | 3 bytes, UTF-8 encoding of ckb       |
/// | "00"       | Invalid, 0x is required              |
/// | "0x0"      | Invalid, each byte requires 2 digits |
type JsonBytes = string;
type H256 = string;

// https://github.com/nervosnetwork/ckb/blob/develop/util/jsonrpc-types/src/blockchain.rs
export type Cell = {
  output: CellOutput;
  output_data: JsonBytes;
  out_point: OutPoint;
  block_number: BlockNumber;
  tx_index: Uint32;
};

export type Script = {
  args: JsonBytes;
  code_hash: H256;
  hash_type: ScriptHashType;
};

export enum ScriptHashType {
  Data = 'data',
  Type = 'type',
}

export type OutPoint = {
  index: Uint32;
  tx_hash: H256;
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
