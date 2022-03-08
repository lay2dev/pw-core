import { Script } from './script';
import PWCore, { ChainID } from '../core';
import { HashType } from '../interfaces';
import ecc from 'eosjs-ecc';
import {
  parseAddress,
  verifyCkbAddress,
  verifyEthAddress,
  verifyEosAddress,
  verifyTronAddress,
  cellOccupiedBytes,
  generateCkbAddressString,
  getLumosConfigByNetworkPrefix,
} from '../utils';
import bs58 from 'bs58';
import axios from 'axios';
import ScatterJS from '@scatterjs/core';
import { AddressPrefix } from '@nervosnetwork/ckb-sdk-utils';

import { Keccak256Hasher } from '../hashers';
import { Reader } from '../ckb-js-toolkit';
import { Amount, AmountUnit } from './amount';
import { NervosAddressVersion } from '../helpers/address';

export { AddressPrefix } from '@nervosnetwork/ckb-sdk-utils';

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
  return PWCore.chainId === ChainID.ckb
    ? AddressPrefix.Mainnet
    : AddressPrefix.Testnet;
}

export class Address {
  static fromLockScript(
    lockScript: Script,
    prefix: AddressPrefix = getDefaultPrefix(),
    addressVersion = NervosAddressVersion.latest
  ): Address {
    return new Address(
      generateCkbAddressString(lockScript, prefix, addressVersion),
      AddressType.ckb
    );
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
            config: getLumosConfigByNetworkPrefix(getDefaultPrefix()),
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
        throw Error('Invalid address type specified.');
    }
  }

  /**
   * Returns the minimum amount of CKBytes that an address can receive.
   * 
   * This function will detect well-known ACP locks, and will return an amount of 1 Shannon if detected.
   * To disable this functionality and force the calculation without ACP pass false. eg: minPaymentAmount(false)
   */
  minPaymentAmount(allowAcp = true): Amount {
    if (allowAcp && this.isAcp()) {
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

  toCKBAddress(addressVersion = NervosAddressVersion.latest): string {
    return generateCkbAddressString(
      this.toLockScript(),
      getDefaultPrefix(),
      addressVersion
    );
  }

  toLockScript(): Script {
    if (this.addressType !== AddressType.ckb) {
      const { codeHash, hashType } = PWCore.config.pwLock.script;
      return new Script(codeHash, this.lockArgs, hashType);
    }

    const lock = parseAddress(this.addressString, {
      config: getLumosConfigByNetworkPrefix(getDefaultPrefix()),
    });
    return new Script(lock.code_hash, lock.args, HashType[lock.hash_type]);
  }
}
