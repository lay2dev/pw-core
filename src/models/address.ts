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
} from '../utils';
import {
  fullPayloadToAddress,
  AddressType as AType,
  AddressPrefix as APrefix,
} from '@nervosnetwork/ckb-sdk-utils';

export enum AddressPrefix {
  ckb,
  ckt,
}

export enum AddressType {
  ckb,
  eth,
  // btc,
  // eos,
  // tron,
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
    readonly addressType: AddressType
  ) {
    this.addressString = addressString.toLowerCase();
  }

  valid(): boolean {
    switch (this.addressType) {
      case AddressType.ckb:
        return verifyCkbAddress(this.addressString);
      case AddressType.eth:
        return verifyEthAddress(this.addressString);
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
      return new Script(codeHash, this.addressString, hashType);
    }

    const lock = parseAddress(this.addressString, {
      config: LumosConfigs[getDefaultPrefix()],
    });
    return new Script(lock.code_hash, lock.args, HashType[lock.hash_type]);
  }
}
