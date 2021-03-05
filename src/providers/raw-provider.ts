import { Platform, Provider } from './provider';
import {
  Address,
  AddressType,
  getDefaultPrefix,
  AddressPrefix as PwAddressPrefix,
} from '../models';
import {
  AddressPrefix,
  privateKeyToAddress,
} from '@nervosnetwork/ckb-sdk-utils';
import { ECPair } from '../signers';

export class RawProvider extends Provider {
  protected ecPair: ECPair;
  constructor(protected privateKey: string) {
    super(Platform.ckb);
    this.ecPair = new ECPair(privateKey);
  }

  async init(): Promise<Provider> {
    const pwPrefix = getDefaultPrefix();
    let prefix;
    if (pwPrefix === PwAddressPrefix.ckb) {
      prefix = AddressPrefix.Mainnet;
    } else {
      prefix = AddressPrefix.Testnet;
    }
    const address = privateKeyToAddress(this.privateKey, { prefix });
    this.address = new Address(address, AddressType.ckb);
    return this;
  }

  async sign(message: string): Promise<string> {
    return this.ecPair.signRecoverable(message);
  }

  async close() {
    return true;
  }
}
