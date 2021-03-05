import axios, { AxiosInstance } from 'axios';

export interface Options {
  url?: string;
  thunkSize?: number;
}

export interface IndexerCell {
  block_number: string;
  out_point: {
    index: string;
    tx_hash: string;
  };
  output: {
    capacity: string;
    lock: {
      args: string;
      code_hash: string;
      hash_type: string;
    };
    type?: {
      args: string;
      code_hash: string;
      hash_type: string;
    };
  };
  output_data: string;
  tx_index: string;
}

export class IndexerCellIterator<T = IndexerCell> {
  private agent: AxiosInstance;
  private options: Required<Options>;

  private filter: any;

  private cursor: string | undefined;

  constructor(filter: any, options?: Options) {
    this.filter = filter;

    this.options = {
      url: options?.url ?? 'https://testnet.ckb.dev/indexer',
      thunkSize: options?.thunkSize ?? 100,
    };

    this.agent = axios.create({ baseURL: this.options.url });
  }

  hasNext(): boolean {
    return this.cursor !== '0x';
  }

  async next(): Promise<T[]> {
    if (!this.hasNext()) return [];

    const params = [
      this.filter,
      'asc',
      '0x' + this.options.thunkSize.toString(16),
    ];
    const res = await this.agent.post('', {
      id: 2,
      jsonrpc: '2.0',
      method: 'get_cells',
      params: this.cursor ? params.concat(this.cursor) : params,
    });

    this.cursor = res.data.result.last_cursor;
    return res.data.result.objects;
  }
}
