import {
  CkbIndexer,
  HexString,
  IndexerCellToCell,
  SnakeScript,
  ScriptType,
  Terminator,
} from '../helpers/ckb-indexer';
import { BalanceOptions, CollectorOptions } from './collector';
import {
  Cell,
  Address,
  AddressType,
  Amount,
  AmountUnit,
  SUDT,
  LockTypeOmniPw,
} from '../models';
import { SUDTCollector } from './sudt-collector';

export class IndexerCollector extends SUDTCollector {
  private indexer: CkbIndexer;
  constructor(public apiBase: string) {
    super();
    this.indexer = new CkbIndexer(apiBase);
  }

  async getBalance(
    address: Address,
    options?: BalanceOptions
  ): Promise<Amount> {
    const lockScriptOptions =
      options && options.lockType && address.addressType !== AddressType.ckb
        ? (options.lockType as LockTypeOmniPw)
        : undefined;
    const searchKey = {
      script: address
        .toLockScript(lockScriptOptions)
        .serializeJson() as SnakeScript,
      script_type: ScriptType.lock,
      filter: {
        output_data_len_range: ['0x0', '0x1'] as [HexString, HexString],
      },
    };
    const cells = (await this.indexer.getCells(searchKey)).filter(
      (cell) => cell.output.type === null
    );
    let balance = Amount.ZERO;
    for (const cell of cells) {
      const amount = new Amount(cell.output.capacity, AmountUnit.shannon);
      balance = balance.add(amount);
    }
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
    const lockScriptOptions =
      options && options.lockType && address.addressType !== AddressType.ckb
        ? (options.lockType as LockTypeOmniPw)
        : undefined;
    const searchKey = {
      script: address
        .toLockScript(lockScriptOptions)
        .serializeJson() as SnakeScript,
      script_type: ScriptType.lock,
      filter: {
        output_data_len_range: ['0x0', '0x1'] as [HexString, HexString],
      },
    };
    const cells = await this.indexer.getCells(searchKey, terminator);
    return cells.map((cell) => IndexerCellToCell(cell));
  }

  async getSUDTBalance(
    sudt: SUDT,
    address: Address,
    options?: BalanceOptions
  ): Promise<Amount> {
    const lockScriptOptions =
      options && options.lockType && address.addressType !== AddressType.ckb
        ? (options.lockType as LockTypeOmniPw)
        : undefined;
    const searchKey = {
      script: address
        .toLockScript(lockScriptOptions)
        .serializeJson() as SnakeScript,
      script_type: ScriptType.lock,
      filter: {
        script: sudt.toTypeScript().serializeJson() as SnakeScript,
      },
    };
    const cells = await this.indexer.getCells(searchKey);
    let balance = Amount.ZERO;
    for (const cell of cells) {
      const amount = Amount.fromUInt128LE(cell.output_data);
      balance = balance.add(amount);
    }
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
    const lockScriptOptions =
      options && options.lockType && address.addressType !== AddressType.ckb
        ? (options.lockType as LockTypeOmniPw)
        : undefined;
    const searchKey = {
      script: address
        .toLockScript(lockScriptOptions)
        .serializeJson() as SnakeScript,
      script_type: ScriptType.lock,
      filter: {
        script: sudt.toTypeScript().serializeJson() as SnakeScript,
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
    return cells.map((cell) => IndexerCellToCell(cell));
  }
}
