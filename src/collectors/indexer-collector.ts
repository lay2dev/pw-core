import { Address, Amount, AmountUnit, Cell, OutPoint, SUDTCollector } from '..';
import { SUDT } from '../models';
import { CollectorOptions } from './collector';
import {
  IndexerCellIterator,
  Options,
} from './indexer-collector/IndexerCellIterator';

export class IndexerCollector extends SUDTCollector {
  private readonly options: Required<Options>;

  constructor(options?: Options) {
    super();
    this.options = {
      thunkSize: options?.thunkSize ?? 100,
      url: options?.url ?? 'https://testnet.ckb.dev/indexer',
    };
  }

  async collect(address: Address, options?: CollectorOptions): Promise<Cell[]> {
    if (!options || !options.neededAmount) {
      throw new Error("'neededAmount' in options must be provided");
    }

    const iter = new IndexerCellIterator(
      { script: address.toLockScript().serializeJson(), script_type: 'lock' },
      this.options
    );

    const cells: Cell[] = [];
    let accAmount = new Amount('0', AmountUnit.shannon);

    while (iter.hasNext()) {
      for (const { output, out_point } of await iter.next()) {
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
        script: address.toLockScript().serializeJson(),
        script_type: 'lock',
        filter: { script: sudt.toTypeScript().serializeJson() },
      },
      this.options
    );

    const cells: Cell[] = [];
    let accAmount = new Amount('0', AmountUnit.shannon);

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
      { script: address.toLockScript().serializeJson(), script_type: 'lock' },
      this.options
    );

    let balance = new Amount('0', AmountUnit.shannon);

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
        script: address.toLockScript().serializeJson(),
        script_type: 'lock',
        filter: { script: sudt.toTypeScript().serializeJson() },
      },
      this.options
    );

    let balance = new Amount('0', AmountUnit.shannon);

    while (iter.hasNext()) {
      for (const { output_data } of await iter.next()) {
        balance = balance.add(Amount.fromUInt128LE(output_data));
      }
    }

    return balance;
  }
}
