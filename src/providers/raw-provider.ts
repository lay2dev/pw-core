import PWCore, { ChainID } from '../core';
import { Platform, Provider } from './provider';
import {
  Address,
  AddressType,
  getDefaultPrefix,
  LockType,
  LockTypeOmniPw,
} from '../models';
import {
  AddressType as CkbSdkAddressType,
  privateKeyToAddress,
} from '@nervosnetwork/ckb-sdk-utils';
import { Reader } from '../ckb-js-toolkit';
import { Message } from '../signers';
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair';
import ethWallet from 'ethereumjs-wallet';
import { arrayBufferToBuffer } from 'arraybuffer-to-buffer';
import { Keccak256Hasher } from '../hashers';

// TODO: Signer algo needs support added for more platform types.
export class RawProvider extends Provider {
  // public readonly platform: Platform; // Inherited from Provider.
  protected privateKey: string;
  protected lockType: LockTypeOmniPw | null;
  protected keyPair: ECPair;

  constructor(
    privateKey: string,
    platform: Platform = Platform.ckb,
    lockType: LockTypeOmniPw | null = null
  ) {
    super(platform);
    this.privateKey = privateKey;
    this.lockType = lockType;
    this.keyPair = new ECPair(privateKey);
  }

  async init(): Promise<Provider> {
    const prefix = getDefaultPrefix();

    if (this.platform === Platform.ckb) {
      // CKB
      const ckbAddress = privateKeyToAddress(this.privateKey, {
        prefix,
        type: CkbSdkAddressType.HashIdx, // This should be changed to FullVersion once the bug is fixed in ckb-sdk-utils.
      });
      this.address = new Address(ckbAddress, AddressType.ckb);
    } else if (this.platform === Platform.eth) {
      // ETH
      const ethAddress = ethWallet
        .fromPrivateKey(
          arrayBufferToBuffer(new Reader(this.privateKey).toArrayBuffer())
        )
        .getAddressString();
      this.address = new Address(
        ethAddress,
        AddressType.eth,
        undefined,
        this.lockType
      );
    } else
      throw new Error(
        `The specified platform type has not been implemented: ${
          Platform[this.platform]
        }`
      );

    return this;
  }

  protected signRecoverablePersonalSign(message: Message) {
    const personalSignPrefix =
      '0x19457468657265756d205369676e6564204d6573736167653a0a3332'; // Personal sign prefix "\x19Ethereum Signed Message:\n32".
    const hashedMessage = new Keccak256Hasher()
      .update(new Reader(personalSignPrefix))
      .update(new Reader(message.message))
      .digest()
      .serializeJson();
    return this.keyPair.signRecoverable(hashedMessage);
  }

  async sign(message: Message): Promise<string> {
    const messageLockType = message.lock.identifyLockType();
    // Sign based on lock type.
    switch (messageLockType) {
      case LockType.default: {
        return this.keyPair.signRecoverable(message.message);
      }
      case LockType.pw: {
        let signature = this.signRecoverablePersonalSign(message);
        signature =
          '0x' +
          (PWCore.chainId === ChainID.ckb
            ? '' // The Mainnet release does not require a platform code.
            : this.platform.toString(16).padStart(2, '0')) + // The Testnet release requires an extra byte for the platform.
          signature.slice(2);
        return signature;
      }
      case LockType.omni: {
        let signature = this.signRecoverablePersonalSign(message);
        signature =
          '0x' +
          '5500000010000000550000005500000041000000' + // 20 bytes for RcLockWitnessLock Molecule table. https://bit.ly/3if4CRg
          signature.slice(2);
        return signature;
      }
      default:
        throw new Error(
          `The specified lock has not been implemented: ${message.lock.codeHash} ${message.lock.hashType}`
        );
    }
  }

  async close() {
    return true;
  }
}
