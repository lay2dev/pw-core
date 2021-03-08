import { Script } from './script';
import PWCore, { ChainID } from '../core';
import { HashType } from '../interfaces';
import ecc from 'eosjs-ecc';
import {
  parseAddress,
  generateAddress,
  LumosConfigs,
  verifyCkbAddress,
  verifyEthAddress,
  verifyEosAddress,
  verifyTronAddress,
  cellOccupiedBytes,
} from '../utils';
import {
  fullPayloadToAddress,
  AddressType as AType,
  AddressPrefix as APrefix,
} from '@nervosnetwork/ckb-sdk-utils';
import bs58 from 'bs58';
import axios from 'axios';
import ScatterJS from '@scatterjs/core';
import { Keccak256Hasher } from '../hashers';
import { Reader } from 'ckb-js-toolkit';
import { Amount, AmountUnit } from './amount';

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

  static async getEosLockArgs(networkJSON: any, account: string) {
    const network = ScatterJS.Network.fromJson(networkJSON);
    const baseUrl = network.fullhost();

    const res = await axios.post(`${baseUrl}/v1/chain/get_account`, {
      account_name: account,
    });
    const data = res.data;
    const pubkey = data.permissions[0].required_auth.keys[0].key;

    const publicKeyHex = ecc.PublicKey(pubkey).toUncompressed().toHex();
    const publicHash = new Keccak256Hasher()
      .hash(new Reader(`0x${publicKeyHex.slice(2)}`))
      .serializeJson();

    const lockArgs = '0x' + publicHash.slice(-40);
    return lockArgs;
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

  minPaymentAmount(): Amount {
    if (this.isAcp()) {
      return new Amount('1', AmountUnit.shannon);
    }
    const bytes = cellOccupiedBytes({
      lock: this.toLockScript(),
      type: null,
      data: '0x',
    });
    return new Amount(bytes.toString());
  }

  isAcp(): boolean {
    const script = this.toLockScript();
    const { codeHash, hashType } = script;
    const acpLock = PWCore.config.acpLockList.filter(
      (x) => x.codeHash === codeHash && x.hashType === hashType
    );
    return acpLock && acpLock.length > 0;
  }

  toCKBAddress(): string {
    if (this.addressType === AddressType.ckb) {
      return this.addressString;
    }

    const { args, codeHash, hashType } = this.toLockScript();

    return fullPayloadToAddress({
      args,
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
