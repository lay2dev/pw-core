import { RPC, transformers } from 'ckb-js-toolkit';
import { CHAIN_SPECS } from './constants';
import { Config } from './interfaces';
import { Address, Amount } from './models';
import { EthSigner } from './signers';
import { Collector } from './collectors';
import { SimpleBuilder } from './builders';

export enum ChainID {
  ckb,
  ckb_testnet,
  ckb_dev,
}

export default class PWCore {
  static config: Config;
  static chainId: ChainID;
  static defaultCollector: Collector;

  private readonly _rpc: RPC;

  constructor(nodeUrl: string) {
    this._rpc = new RPC(nodeUrl);
  }

  async init(defaultCollector: Collector, chainId?: ChainID, config?: Config) {
    if (chainId) {
      if (!(chainId in ChainID)) {
        throw new Error(`invalid chainId ${chainId}`);
      }
      PWCore.chainId = chainId;
    } else {
      const info = await this.rpc.get_blockchain_info();
      PWCore.chainId = info.chain;
    }

    if (PWCore.chainId === ChainID.ckb_dev) {
      if (!config) {
        throw new Error('config must be provided for dev chain');
      }
      PWCore.config = config;
    } else {
      // merge customized config to default one
      PWCore.config = {
        ...[CHAIN_SPECS.Lina, CHAIN_SPECS.Aggron][PWCore.chainId],
        ...config,
      };
    }
    if (defaultCollector instanceof Collector) {
      PWCore.defaultCollector = defaultCollector;
    } else {
      throw new Error('defaultCollector must be provided');
    }
  }

  get rpc(): RPC {
    return this._rpc;
  }

  async send(
    address: Address,
    amount: Amount,
    feeRate?: number
  ): Promise<string> {
    const sBuilder = new SimpleBuilder(address, amount, feeRate);

    let tx = await sBuilder.build();

    tx.validate();

    const ethSigner = new EthSigner(tx, address.addressString);

    tx = await ethSigner.sign();

    // throw new Error(
    //   '[debug] fee:' +
    //     sBuilder.getFee().toString(AmountUnit.ckb) +
    //     ', size:' +
    //     tx.getSize() +
    //     '\n\ntx:' +
    //     JSON.stringify(transformers.TransformTransaction(tx))
    // );

    const txHash = await this.rpc.send_transaction(
      transformers.TransformTransaction(tx)
    );

    return txHash;
  }

  // public async sendTransaction()

  // async getBalance(address: Address, collector?: Collector): Amount {

  // }
}
