import { Script } from './script';
import PWCore, { ChainID } from '../core';
import { HashType } from '../interfaces';
import ecc from 'eosjs-ecc';
import {
  describeAddress,
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
  // btc,
  // doge,
}

export enum LockType {
  acp,
  default,
  multisig,
  omni,
  pw,
}

export type LockTypeOmniPw = LockType.omni | LockType.pw;

export function getDefaultPrefix(): AddressPrefix {
  return PWCore.chainId === ChainID.ckb
    ? AddressPrefix.Mainnet
    : AddressPrefix.Testnet;
}

export class Address {
  constructor(
    readonly addressString: string,
    readonly addressType: AddressType,
    readonly lockArgs: string | null = null,
    readonly lockType: LockTypeOmniPw | null = null // TODO: Consider changing this from LockTypeOmniPw to LockType in the future to allow MultiSig, ACP, etc.
  ) {
    // lockArgs generation logic moved to generateLockArgs().
    // This was done in preparation for OmniLock support which could require different data.

    // Warn when lock type is specified and a CKB address was provided.
    if (this.addressType === AddressType.ckb && this.lockType !== null) {
      this.lockType = null;
      console.warn(
        `LockType should not be specified on Address() when AddressType.ckb is used.`
      );
    }
  }

  /**
   * Create a new instance of Address from an instance of Script.
   */
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

  /***
   * Generate a hex string to be used as an OmniLock Lock Args.
   * Currently, only mode 0 (off) is supported.
   * Note: String is not prefixed with '0x'.
   */
  generateOmniLockArgs() {
    return '00';
  }

  /***
   * Generate a hex string to be used as an OmniLock Auth Flag for the AddressType specified.
   * Note: String is not prefixed with '0x'.
   */
  generateOmniLockAuthFlag(addressType: AddressType) {
    switch (addressType) {
      case AddressType.ckb:
        return '00';
      case AddressType.eos:
        return '02';
      case AddressType.eth:
        return '01';
      case AddressType.tron:
        return '03';
      default:
        throw new Error(
          `Unsupported AddressType specified: ${AddressType[addressType]}`
        );
    }
  }

  /**
   * Generate lockArgs for the appropriate lockType.
   *
   * TODO: Add more sanity checks around edge conditions to help developers with debugging incorrect usage.
   */
  generateLockArgs(lockType: LockType | null = null) {
    // If lockArgs were provided in the constructor, always return it unmodified.
    if (this.lockArgs !== null) return this.lockArgs;

    // Generate the base lockArgs. This output is the same that is used with PW-Lock.
    let lockArgs;
    switch (this.addressType) {
      case AddressType.eth:
        lockArgs = this.addressString.toLowerCase();
        break;
      case AddressType.eos:
        throw new Error('lock args must provided for eos address');
      case AddressType.tron:
        lockArgs =
          '0x' +
          Buffer.from(bs58.decode(this.addressString)).toString('hex', 1, 21);
        break;
      case AddressType.ckb:
        const lock = parseAddress(this.addressString, {
          config: getLumosConfigByNetworkPrefix(getDefaultPrefix()),
        });
        lockArgs = lock.args;
        break;
      default:
        throw new Error(
          `Invalid address type specified: ${AddressType[this.addressType]}`
        );
    }

    // Process the lock args based on the lock type.
    switch (lockType) {
      case null:
      case LockType.default:
      case LockType.multisig:
        return lockArgs;
      case LockType.pw:
        // PW-Lock Chain IDs Specification: https://github.com/lay2dev/pw-lock/blob/c2b1456bcca06c892e1bb8ec8ac0a64d4fb2b83d/c/pw_lock.h#L190-L223
        return lockArgs;
      case LockType.omni:
        // Omni Lock Specification: https://github.com/XuJiandong/docs-bank/blob/master/omni_lock.md
        const omniLockauthFlag = this.generateOmniLockAuthFlag(
          this.addressType
        ); // 1 byte OmniLock Auth Flag
        const omniLockauthContent = lockArgs.replace('0x', ''); // 20 byte OmniLock Auth Content
        const omniLockArgs = this.generateOmniLockArgs(); // 1 byte OmniLock Args
        return `0x${omniLockauthFlag}${omniLockauthContent}${omniLockArgs}`;
      default:
        throw new Error(`Unsupported lock type: ${LockType[lockType]}`);
    }
  }

  /**
   * Generate a lock script configuration based on the specified lock type.
   */
  generateLockScriptConfig(lockType: LockType) {
    switch (lockType) {
      case LockType.default:
        return PWCore.config.defaultLock.script;
      case LockType.multisig:
        return PWCore.config.multiSigLock.script;
      case LockType.omni:
        return PWCore.config.omniLock.script;
      case LockType.pw:
        return PWCore.config.pwLock.script;
      default:
        throw new Error(
          `Invalid lock type specified: "${LockType[lockType]}".`
        );
    }
  }

  /**
   * Fetch the EOS lock args for the specified account using a remote JSONRPC server.
   */
  static async getEosLockArgs(networkJSON: any, account: string) {
    const network = ScatterJS.Network.fromJson(networkJSON);
    const baseUrl = network.fullhost();

    const response = await axios.post(`${baseUrl}/v1/chain/get_account`, {
      account_name: account,
    });
    const data = response.data;
    const pubkey = data.permissions[0].required_auth.keys[0].key;

    const publicKeyHex = ecc.PublicKey(pubkey).toUncompressed().toHex();
    const publicHash = new Keccak256Hasher()
      .hash(new Reader(`0x${publicKeyHex.slice(2)}`))
      .serializeJson();

    const lockArgs = '0x' + publicHash.slice(-40);
    return lockArgs;
  }

  describe() {
    if (this.addressType === AddressType.ckb)
      return describeAddress(this.addressString, {
        config: getLumosConfigByNetworkPrefix(getDefaultPrefix()),
      });
    else
      return describeAddress(this.toCKBAddress(), {
        config: getLumosConfigByNetworkPrefix(getDefaultPrefix()),
      });
  }

  /**
   * Check if the address provided in the constructor is valid.
   */
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
        throw new Error('Invalid address type specified.');
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
      lock: this.toLockScript(this.lockType),
      type: null,
      data: '0x',
    });
    return new Amount(bytes.toString());
  }

  /**
   * Check if the address supports ACP.
   */
  isAcp(): boolean {
    const script = this.toLockScript(this.lockType);
    const acpLock = PWCore.config.acpLockList.filter((x) =>
      script.sameCodeTypeWith(x)
    );
    return acpLock && acpLock.length > 0;
  }

  /**
   * Generate a CKB address string for the Address.
   */
  toCKBAddress(
    addressVersion = NervosAddressVersion.latest,
    lockType: LockTypeOmniPw | null = null
  ): string {
    // Warn when lock type is specified and a CKB address was provided.
    if (this.addressType === AddressType.ckb && lockType !== null) {
      lockType = null;
      console.warn(
        `LockType should not be specified on toCKBAddress() when AddressType.ckb is used.`
      );
    }

    const preferredLockType = lockType !== null ? lockType : this.lockType;
    return generateCkbAddressString(
      this.toLockScript(preferredLockType),
      getDefaultPrefix(),
      addressVersion
    );
  }

  /**
   * Generate a lock script for the Address.
   */
  toLockScript(lockType: LockTypeOmniPw | null = null): Script {
    // Warn when lock type is specified and a CKB address was provided.
    if (this.addressType === AddressType.ckb && lockType !== null) {
      lockType = null;
      console.warn(
        `LockType should not be specified on toLockScript() when AddressType.ckb is used.`
      );
    }

    // Handle CKB native address type.
    if (this.addressType === AddressType.ckb) {
      const lock = parseAddress(this.addressString, {
        config: getLumosConfigByNetworkPrefix(getDefaultPrefix()),
      });
      return new Script(lock.code_hash, lock.args, HashType[lock.hash_type]);
    }

    // Default the lock type to LockType.omni and allow the local `lockType` to override the class defined `this.lockType`.
    let preferredLockType = lockType !== null ? lockType : this.lockType;
    if (preferredLockType === null) preferredLockType = LockType.omni;

    // Handle external address types. (ETH, EOS, Tron, etc.)
    const lockScriptConfig = this.generateLockScriptConfig(preferredLockType);
    const lockArgs = this.generateLockArgs(preferredLockType);
    return new Script(
      lockScriptConfig.codeHash,
      lockArgs,
      lockScriptConfig.hashType
    );
  }
}
