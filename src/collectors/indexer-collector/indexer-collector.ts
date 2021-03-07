import { Indexer, IndexerCellIterator } from '.';
import {
  Address,
  Amount,
  AmountUnit,
  Cell,
  CollectorOptions,
  OutPoint,
} from '../..';
import { SUDT } from '../../models';
import { SUDTCollector } from '../sudt-collector';
import { Options } from './indexer-cell-iterator';

export class IndexerCollector extends SUDTCollector {
  private readonly options: Options;

  constructor(options: { url: string; thunkSize?: number }) {
    super();

    this.options = {
      url: options.url,
      thunkSize: options?.thunkSize ?? 100,
    };
  }

  async collect(address: Address, options?: CollectorOptions): Promise<Cell[]> {
    if (!options || !options.neededAmount) {
      throw new Error("'neededAmount' in options must be provided");
    }

    const iter = new IndexerCellIterator(
      {
        script: address.toLockScript().serializeJson() as Indexer.Script,
        script_type: Indexer.ScriptType.Lock,
        filter: {
          // ensure that only ckb live cells are filtered out
          output_data_len_range: ['0x0', '0x1'],
        },
      },
      this.options
    );

    const cells: Cell[] = [];
    let accAmount = Amount.ZERO;

    while (iter.hasNext()) {
      for (const { output, out_point } of await iter.next()) {
        // ensure that only ckb live cells are filtered out
        if (output.type != null) continue;

        const capacity = new Amount(output.capacity, AmountUnit.shannon);
        const outPoint = new OutPoint(out_point.tx_hash, out_point.index);
        cells.push(new Cell(capacity, address.toLockScript(), null, outPoint));

        accAmount = accAmount.add(capacity);
        if (accAmount.gte(options.neededAmount)) return cells;
      }
    }

    return cells;
  }

  async collectSUDT(
    sudt: SUDT,
    address: Address,
    options?: CollectorOptions
  ): Promise<Cell[]> {
    if (!options || !options.neededAmount) {
      throw new Error("'neededAmount' in options must be provided");
    }

    const iter = new IndexerCellIterator(
      {
        script: address.toLockScript().serializeJson() as Indexer.Script,
        script_type: Indexer.ScriptType.Lock,
        filter: {
          script: sudt.toTypeScript().serializeJson() as Indexer.Script,
        },
      },
      this.options
    );

    const cells: Cell[] = [];
    let accAmount = Amount.ZERO;

    while (iter.hasNext()) {
      for (const { output, out_point, output_data } of await iter.next()) {
        const capacity = new Amount(output.capacity, AmountUnit.shannon);
        const outPoint = new OutPoint(out_point.tx_hash, out_point.index);
        cells.push(
          new Cell(
            capacity,
            address.toLockScript(),
            sudt.toTypeScript(),
            outPoint,
            output_data
          )
        );

        accAmount = accAmount.add(Amount.fromUInt128LE(output_data));
        if (accAmount.gte(options.neededAmount)) return cells;
      }
    }

    return cells;
  }

  async getBalance(address: Address): Promise<Amount> {
    const iter = new IndexerCellIterator(
      {
        script: address.toLockScript().serializeJson() as Indexer.Script,
        script_type: Indexer.ScriptType.Lock,
        filter: {
          // ensure that only ckb live cells are filtered out
          output_data_len_range: ['0x0', '0x1'],
        },
      },
      this.options
    );

    let balance = Amount.ZERO;

    while (iter.hasNext()) {
      for (const { output } of await iter.next()) {
        if (output.type != null) continue;

        const capacity = new Amount(output.capacity, AmountUnit.shannon);
        balance = balance.add(capacity);
      }
    }

    return Promise.resolve(balance);
  }

  async getSUDTBalance(sudt: SUDT, address: Address): Promise<Amount> {
    const iter = new IndexerCellIterator(
      {
        script: address.toLockScript().serializeJson() as Indexer.Script,
        script_type: Indexer.ScriptType.Lock,
        filter: {
          script: sudt.toTypeScript().serializeJson() as Indexer.Script,
        },
      },
      this.options
    );

    let balance = Amount.ZERO;

    while (iter.hasNext()) {
      for (const { output_data } of await iter.next()) {
        balance = balance.add(Amount.fromUInt128LE(output_data));
      }
    }

    return balance;
  }
}
