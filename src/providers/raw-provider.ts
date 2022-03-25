import { Platform, Provider } from './provider';
import { Address, AddressType, getDefaultPrefix } from '../models';
import {
  AddressType as CkbSdkAddressType,
  privateKeyToAddress,
} from '@nervosnetwork/ckb-sdk-utils';
import { Blake2bHasher, Hasher } from '../hashers';
import { Message } from '../signers';
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair';

// TODO: Add support to specify Platform in the constructor.
export class RawProvider extends Provider {
  protected keyPair: ECPair;
  constructor(protected privateKey: string) {
    super(Platform.ckb);
    this.keyPair = new ECPair(privateKey);
  }

  async init(): Promise<Provider> {
    const prefix = getDefaultPrefix();

    const address = privateKeyToAddress(this.privateKey, {
      prefix,
      type: CkbSdkAddressType.HashIdx,
    });
    this.address = new Address(address, AddressType.ckb);
    return this;
  }

  hasher(): Hasher {
    return new Blake2bHasher();
  }

  async sign(message: Message): Promise<string> {
    const sig = this.keyPair.signRecoverable(message.message);
    return sig;
  }

  async close() {
    return true;
  }
}
