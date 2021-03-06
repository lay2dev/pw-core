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
import { Blake2bHasher, Hasher } from '../hashers';
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair';
import { logger } from '../helpers/logger';

export class RawProvider extends Provider {
  protected keyPair: ECPair;
  constructor(protected privateKey: string) {
    super(Platform.ckb);
    this.keyPair = new ECPair(privateKey);
  }

  async init(): Promise<Provider> {
    const pwPrefix = getDefaultPrefix();
    const prefix =
      pwPrefix === PwAddressPrefix.ckb
        ? AddressPrefix.Mainnet
        : AddressPrefix.Testnet;
    const address = privateKeyToAddress(this.privateKey, { prefix });
    this.address = new Address(address, AddressType.ckb);
    return this;
  }

  hasher(): Hasher {
    return new Blake2bHasher();
  }

  async sign(message: string): Promise<string> {
    logger.debug('message', message);
    const sig = this.keyPair.signRecoverable(message);
    logger.debug('sig', sig);
    return sig;
  }

  async close() {
    return true;
  }
}
