import axios from 'axios';
import * as Indexer from './types';

export interface Options {
  url: string;
  thunkSize: number;
}

export class IndexerCellIterator<T = Indexer.Cell> {
  private isQuerying: boolean = false;
  private queryingTask: Promise<T[]> | undefined;

  private cursor: string | undefined;

  constructor(
    private readonly searchKey: Indexer.SearchKey,
    private readonly options: Options
  ) {}

  hasStarted(): boolean {
    return !!this.queryingTask;
  }

  hasNext(): boolean {
    const notStarted = !this.hasStarted();

    // https://github.com/nervosnetwork/ckb/blob/develop/util/jsonrpc-types/src/bytes.rs#L11
    /// | JSON       | Binary                               |
    /// | ---------- | ------------------------------------ |
    /// | "0x"       | Empty binary                         |
    /// | "0x00"     | Single byte 0                        |
    /// | "0x636b62" | 3 bytes, UTF-8 encoding of ckb       |
    /// | "00"       | Invalid, 0x is required              |
    /// | "0x0"      | Invalid, each byte requires 2 digits |
    const cursorNotEmpty = this.cursor !== '0x';

    return notStarted || cursorNotEmpty;
  }

  async next(): Promise<T[]> {
    if (!this.hasNext()) return [];
    if (this.isQuerying) return this.queryingTask;

    this.isQuerying = true;

    // https://github.com/nervosnetwork/ckb-indexer#get_cells
    const params = [
      this.searchKey,
      Indexer.Order.Asc,
      '0x' + this.options.thunkSize.toString(16),
    ];
    try {
      const task = axios.post(this.options.url, {
        id: 2,
        jsonrpc: '2.0',
        method: 'get_cells',
        params: this.cursor ? params.concat(this.cursor) : params,
      });

      this.queryingTask = Promise.resolve(task).then(
        (res) => res.data.result.objects
      );

      this.cursor = await Promise.resolve(task).then(
        (res) => res.data.result.last_cursor
      );

      return this.queryingTask;
    } finally {
      this.isQuerying = false;
    }
  }
}
