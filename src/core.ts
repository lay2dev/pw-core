import { RPC, transformers } from 'ckb-js-toolkit';
import { CHAIN_SPECS } from './constants';
import { Config } from './interfaces';
import { Address, Amount } from './models';
import { EthSigner, Signer } from './signers';
import { Collector } from './collectors';
import { SimpleBuilder, Builder } from './builders';
import { Provider } from './providers';

export enum ChainID {
  ckb,
  ckb_testnet,
  ckb_dev,
}

export default class PWCore {
  static config: Config;
  static chainId: ChainID;
  static provider: Provider;
  static defaultCollector: Collector;

  private readonly _rpc: RPC;

  constructor(nodeUrl: string) {
    this._rpc = new RPC(nodeUrl);
  }

  async init(
    provider: Provider,
    defaultCollector: Collector,
    chainId?: ChainID,
    config?: Config
  ) {
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

    if (provider instanceof Provider) {
      PWCore.provider = await provider.init();
    } else {
      throw new Error('provider must be provided');
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
    const simpleBuilder = new SimpleBuilder(address, amount, feeRate);
    const ethSigner = new EthSigner(address.addressString);
    return this.sendTransaction(simpleBuilder, ethSigner);
  }

  async sendTransaction(builder: Builder, signer: Signer): Promise<string> {
    return this.rpc.send_transaction(
      transformers.TransformTransaction(
        await signer.sign((await builder.build()).validate())
      )
    );
  }
}
