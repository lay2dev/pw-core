import axios from 'axios';
import { CollectorOptions } from './collector';
import { SUDTCollector } from './sudt-collector';
import {
  Cell,
  Address,
  Amount,
  AmountUnit,
  OutPoint,
  SUDT,
  Script as PwScript,
} from '..';

enum ScriptType {
  type = 'type',
  lock = 'lock',
}

enum Order {
  asc = 'asc',
  desc = 'desc',
}

type HexString = string;
type Hash = HexString;
type HashType = 'type' | 'data';

interface Script {
  code_hash: Hash;
  hash_type: HashType;
  args: HexString;
}

interface SearchKey {
  script: Script;
  script_type: ScriptType;
  filter?: {
    script?: Script;
    output_data_len_range?: [HexString, HexString];
    output_capacity_range?: [HexString, HexString];
    block_range?: [HexString, HexString];
  };
}

interface IndexerCell {
  block_number: HexString;
  out_point: {
    index: HexString;
    tx_hash: Hash;
  };
  output: {
    capacity: HexString;
    lock: Script;
    type?: Script;
  };
  output_data: HexString;
  tx_index: HexString;
}

interface TerminatorResult {
  stop: boolean;
  push: boolean;
}

declare type Terminator = (
  index: number,
  cell: IndexerCell
) => TerminatorResult;

const DefaultTerminator: Terminator = (_index, _cell) => {
  return { stop: false, push: true };
};

function IndexerCellToCell(cell: IndexerCell): Cell {
  return new Cell(
    new Amount(cell.output.capacity, AmountUnit.shannon),
    PwScript.fromRPC(cell.output.lock),
    PwScript.fromRPC(cell.output.type),
    OutPoint.fromRPC(cell.out_point),
    cell.output_data
  );
}

export class CkbIndexer {
  constructor(public ckbIndexerUrl: string) {}

  async request(method: string, params?: any): Promise<any> {
    const data = {
      id: 0,
      jsonrpc: '2.0',
      method,
      params,
    };
    // console.dir({data, url: this.ckbIndexerUrl}, {depth: null});
    const res = await axios.post(this.ckbIndexerUrl, data);
    // console.dir(res, {depth: null});
    if (res.status !== 200) {
      throw new Error(`indexer request failed with HTTP code ${res.status}`);
    }
    if (res.data.error !== undefined) {
      throw new Error(
        `indexer request rpc failed with error: ${JSON.stringify(
          res.data.error
        )}`
      );
    }
    return res.data.result;
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
    while (true) {
      const res = await this.request('get_cells', params);
      const liveCells = res.objects;
      cursor = res.lastCursor;
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

export class IndexerCollector extends SUDTCollector {
  private indexer: CkbIndexer;
  constructor(public apiBase: string) {
    super();
    this.indexer = new CkbIndexer(apiBase);
  }

  async getBalance(address: Address): Promise<Amount> {
    const lock = address.toLockScript();
    const searchKey = {
      script: {
        code_hash: lock.codeHash,
        args: lock.args,
        hash_type: lock.hashType,
      },
      script_type: ScriptType.lock,
      filter: {
        output_data_len_range: ['0x0', '0x1'],
      },
    };
    // console.log({searchKey});
    const cells = (await this.indexer.getCells(searchKey)).filter(
      (cell) => cell.output.type === null
    );
    // console.dir(cells, {depth: null});
    let balance = Amount.ZERO;
    cells.forEach((cell) => {
      const amount = new Amount(cell.output.capacity, AmountUnit.shannon);
      balance = balance.add(amount);
    });
    return balance;
  }

  async collect(address: Address, options: CollectorOptions): Promise<Cell[]> {
    if (!options || !options.neededAmount) {
      throw new Error("'neededAmount' in options must be provided");
    }
    let accCapacity = Amount.ZERO;
    const terminator: Terminator = (_index, cell) => {
      if (accCapacity.gte(options.neededAmount)) {
        return { stop: true, push: false };
      }
      if (cell.output_data.length / 2 - 1 > 0 || cell.output.type !== null) {
        return { stop: false, push: false };
      } else {
        accCapacity = accCapacity.add(
          new Amount(cell.output.capacity, AmountUnit.shannon)
        );
        return { stop: false, push: true };
      }
    };
    const lock = address.toLockScript();
    const searchKey = {
      script: {
        code_hash: lock.codeHash,
        args: lock.args,
        hash_type: lock.hashType,
      },
      script_type: ScriptType.lock,
      filter: {
        output_data_len_range: ['0x0', '0x1'],
      },
    };
    const cells = await this.indexer.getCells(searchKey, terminator);
    // console.dir(cells, {depth: null});
    return cells.map((cell) => IndexerCellToCell(cell));
  }

  async getSUDTBalance(sudt: SUDT, address: Address): Promise<Amount> {
    const lock = address.toLockScript();
    const searchKey = {
      script: {
        code_hash: lock.codeHash,
        args: lock.args,
        hash_type: lock.hashType,
      },
      script_type: ScriptType.lock,
      filter: {
        script: sudt.toTypeScript().serializeJson(),
      },
    };
    // console.log({searchKey});
    const cells = await this.indexer.getCells(searchKey);
    // console.dir(cells, {depth: null});
    let balance = Amount.ZERO;
    cells.forEach((cell) => {
      const amount = Amount.fromUInt128LE(cell.output_data);
      balance = balance.add(amount);
    });
    return balance;
  }

  async collectSUDT(
    sudt: SUDT,
    address: Address,
    options: CollectorOptions
  ): Promise<Cell[]> {
    if (!options || !options.neededAmount) {
      throw new Error("'neededAmount' in options must be provided");
    }
    const lock = address.toLockScript();
    const searchKey = {
      script: {
        code_hash: lock.codeHash,
        args: lock.args,
        hash_type: lock.hashType,
      },
      script_type: ScriptType.lock,
      filter: {
        script: sudt.toTypeScript().serializeJson(),
      },
    };
    let accCapacity = Amount.ZERO;
    const terminator: Terminator = (_index, cell) => {
      if (accCapacity.gte(options.neededAmount)) {
        return { stop: true, push: false };
      }
      accCapacity = accCapacity.add(Amount.fromUInt128LE(cell.output_data));
      return { stop: false, push: true };
    };
    const cells = await this.indexer.getCells(searchKey, terminator);
    // console.dir(cells, {depth: null});
    return cells.map((cell) => IndexerCellToCell(cell));
  }
}
