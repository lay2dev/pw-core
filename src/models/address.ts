import { Script } from '.';
import PWCore, { ChainID } from '../core';
import { HashType } from '../interfaces';
// import { validators, transformers } from 'ckb-js-toolkit';
import {
  parseAddress,
  generateAddress,
  LumosConfigs,
  verifyCkbAddress,
  verifyEthAddress,
  verifyEosAddress,
  verifyTronAddress,
} from '../utils';
import {
  fullPayloadToAddress,
  AddressType as AType,
  AddressPrefix as APrefix,
} from '@nervosnetwork/ckb-sdk-utils';
import bs58 from 'bs58';

export enum AddressPrefix {
  ckb,
  ckt,
}

export enum AddressType {
  ckb,
  eth,
  eos,
  tron,
  // libra,
}

export enum LockType {
  default,
  multisig,
  pw,
}

export function getDefaultPrefix(): AddressPrefix {
  return PWCore.chainId === ChainID.ckb ? AddressPrefix.ckb : AddressPrefix.ckt;
}

export class Address {
  static fromLockScript(
    lockScript: Script,
    prefix: AddressPrefix = getDefaultPrefix()
  ): Address {
    const addressString = generateAddress(lockScript.serializeJson(), {
      config: LumosConfigs[prefix],
    });

    return new Address(addressString, AddressType.ckb);
  }

  constructor(
    readonly addressString: string,
    readonly addressType: AddressType,
    readonly lockArgs?: string
  ) {
    if (!lockArgs) {
      switch (addressType) {
        case AddressType.eth:
          this.addressString = addressString.toLowerCase();
          this.lockArgs = this.addressString;
          break;
        case AddressType.eos:
          throw new Error('lock args must provided for eos address');
        case AddressType.tron:
          this.lockArgs =
            '0x' +
            Buffer.from(bs58.decode(addressString)).toString('hex', 1, 21);
          break;
        case AddressType.ckb:
          const lock = parseAddress(this.addressString, {
            config: LumosConfigs[getDefaultPrefix()],
          });
          this.lockArgs = lock.args;
          break;
      }
    }
  }

  valid(): boolean {
    switch (this.addressType) {
      case AddressType.ckb:
        return verifyCkbAddress(this.addressString);
      case AddressType.eth:
        return verifyEthAddress(this.addressString);
      case AddressType.eos:
        return verifyEosAddress(this.addressString);
      case AddressType.tron:
        return verifyTronAddress(this.addressString);
      default:
        return true;
    }
  }

  toCKBAddress(): string {
    if (this.addressType === AddressType.ckb) {
      return this.addressString;
    }

    const { args, codeHash, hashType } = this.toLockScript();

    return fullPayloadToAddress({
      arg: args,
      codeHash,
      type:
        hashType === HashType.data ? AType.DataCodeHash : AType.TypeCodeHash,
      prefix:
        getDefaultPrefix() === AddressPrefix.ckb
          ? APrefix.Mainnet
          : APrefix.Testnet,
    });
  }

  toLockScript(): Script {
    if (this.addressType !== AddressType.ckb) {
      const { codeHash, hashType } = PWCore.config.pwLock.script;
      return new Script(codeHash, this.lockArgs, hashType);
    }

    const lock = parseAddress(this.addressString, {
      config: LumosConfigs[getDefaultPrefix()],
    });
    return new Script(lock.code_hash, lock.args, HashType[lock.hash_type]);
  }
}
