import {
  AddressPrefix,
  AddressType as CkbAddressType,
  privateKeyToAddress,
} from '@nervosnetwork/ckb-sdk-utils';
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
    this.address = new Address(
      privateKeyToAddress(privateKey, {
        prefix: getCkbAddressPrefix(),
        type: CkbAddressType.HashIdx,
        codeHashOrCodeHashIndex: '0x00',
      }),
      AddressType.ckb
    );
  }

  async close(): Promise<any> {
    return Promise.resolve(undefined);
  }

  async init(): Promise<Provider> {
    return this;
  }

  async sign(message: string): Promise<string> {
    const keyPair = new ECPair(this.#privateKey);
    return keyPair.signRecoverable(message);
  }
}
