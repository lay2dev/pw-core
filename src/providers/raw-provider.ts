import {
  AddressPrefix,
  privateKeyToAddress,
} from '@nervosnetwork/ckb-sdk-utils';
import { AddressOptions } from '@nervosnetwork/ckb-sdk-utils/lib/address';
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair';
import PWCore, { Address, AddressType, ChainID } from '..';
import { Platform, Provider } from './provider';

function getCkbAddressPrefix(chainId: ChainID = PWCore.chainId): AddressPrefix {
  return chainId === ChainID.ckb
    ? AddressPrefix.Mainnet
    : AddressPrefix.Testnet;
}

export class RawProvider extends Provider {
  readonly #privateKey: string;

  constructor(privateKey: string) {
    super(Platform.ckb);
    this.#privateKey = privateKey;
  }

  async close(): Promise<void> {
    return;
  }

  async init(): Promise<Provider> {
    // this is a patch for ckb-sdk-utils
    const options = ({
      prefix: getCkbAddressPrefix(),
    } as unknown) as AddressOptions;
    this.address = new Address(
      privateKeyToAddress(this.#privateKey, options),
      AddressType.ckb
    );
    return this;
  }

  async sign(message: string): Promise<string> {
    const keyPair = new ECPair(this.#privateKey);
    return keyPair.signRecoverable(message);
  }
}
