import axios from 'axios';
import {
  Cell,
  Amount,
  AmountUnit,
  OutPoint,
  Script as PwScript,
  HashType,
} from '..';

export enum ScriptType {
  type = 'type',
  lock = 'lock',
}

export enum Order {
  asc = 'asc',
  desc = 'desc',
}

export type HexString = string;
export type Hash = HexString;
// export type HashType = 'type' | 'data';

export interface SnakeScript {
  code_hash: Hash;
  hash_type: HashType;
  args: HexString;
}

export interface SearchKey {
  script: SnakeScript;
  script_type: ScriptType;
  filter?: {
    script?: SnakeScript;
    output_data_len_range?: [HexString, HexString];
    output_capacity_range?: [HexString, HexString];
    block_range?: [HexString, HexString];
  };
}

export interface IndexerCell {
  block_number: HexString;
  out_point: {
    index: HexString;
    tx_hash: Hash;
  };
  output: {
    capacity: HexString;
    lock: SnakeScript;
    type?: SnakeScript;
  };
  output_data: HexString;
  tx_index: HexString;
}

export interface TerminatorResult {
  stop: boolean;
  push: boolean;
}

export declare type Terminator = (
  index: number,
  cell: IndexerCell
) => TerminatorResult;

export const DefaultTerminator: Terminator = () => {
  return { stop: false, push: true };
};

export class CkbIndexer {
  constructor(public ckbIndexerUrl: string) {}

  async request(method: string, params?: any): Promise<any> {
    const data = {
      id: 0,
      jsonrpc: '2.0',
      method,
      params,
    };
    const response = await axios.post(this.ckbIndexerUrl, data);
    if (response.status !== 200) {
      throw new Error(
        `indexer request failed with HTTP code ${response.status}`
      );
    }
    if (response.data.error !== undefined) {
      throw new Error(
        `indexer request rpc failed with error: ${JSON.stringify(
          response.data.error
        )}`
      );
    }
    return response.data.result;
  }

  public async getCells(
    searchKey: SearchKey,
    terminator: Terminator = DefaultTerminator,
    {
      sizeLimit = 0x100,
      order = Order.asc,
    }: { sizeLimit?: number; order?: Order } = {}
  ): Promise<IndexerCell[]> {
    const infos: IndexerCell[] = [];
    let cursor = null;
    let index = 0;
    const params = [searchKey, order, `0x${sizeLimit.toString(16)}`, cursor];
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const response = await this.request('get_cells', params);
      const liveCells = response.objects;
      cursor = response.lastCursor;
      for (const cell of liveCells) {
        const { stop, push } = terminator(index, cell);
        if (push) {
          infos.push(cell);
        }
        if (stop) {
          return infos;
        }
        index++;
      }
      if (liveCells.length < sizeLimit) {
        break;
      }
    }
    return infos;
  }
}

export function IndexerCellToCell(cell: IndexerCell): Cell {
  return new Cell(
    new Amount(cell.output.capacity, AmountUnit.shannon),
    PwScript.fromRPC(cell.output.lock),
    PwScript.fromRPC(cell.output.type),
    OutPoint.fromRPC(cell.out_point),
    cell.output_data
  );
}
