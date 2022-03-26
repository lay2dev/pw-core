import PWCore from '../core';
import { Platform, Provider } from './provider';
import { Address, AddressType, getDefaultPrefix } from '../models';
import {
  AddressType as CkbSdkAddressType,
  privateKeyToAddress,
} from '@nervosnetwork/ckb-sdk-utils';
import { Reader } from '../ckb-js-toolkit';
import { Blake2bHasher, Hasher, Keccak256Hasher } from '../hashers';
import { Message } from '../signers';
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair';
import ethWallet from 'ethereumjs-wallet';
import { arrayBufferToBuffer } from 'arraybuffer-to-buffer';

// TODO: Signer aglo needs support added for more platform types.
export class RawProvider extends Provider {
  protected keyPair: ECPair;
  protected selectedHasher: Hasher = new Blake2bHasher();

  constructor(protected privateKey: string, platform: Platform = Platform.ckb) {
    super(platform);
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
      this.address = new Address(ethAddress, AddressType.eth);
    } else
      throw new Error(
        `The specified platform type has not been implemented: ${
          Platform[this.platform]
        }`
      );

    return this;
  }

  hasher(): Hasher {
    return this.selectedHasher;
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
    // Set flags for lock types.
    const isDefaultLock =
      message.lock.codeHash === PWCore.config.defaultLock.script.codeHash &&
      message.lock.hashType === PWCore.config.defaultLock.script.hashType;
    const isPwLock =
      message.lock.codeHash === PWCore.config.pwLock.script.codeHash &&
      message.lock.hashType === PWCore.config.pwLock.script.hashType;
    const isOmniLock =
      message.lock.codeHash === PWCore.config.omniLock.script.codeHash &&
      message.lock.hashType === PWCore.config.omniLock.script.hashType;

    // Select hasher based on lock type.
    if (isPwLock) this.selectedHasher = new Keccak256Hasher();
    else this.selectedHasher = new Blake2bHasher();

    // Sign based on lock type.
    if (isDefaultLock) {
      return this.keyPair.signRecoverable(message.message);
    } else if (isPwLock) {
      return this.signRecoverablePersonalSign(message);
    } else if (isOmniLock) {
      let signature = this.signRecoverablePersonalSign(message);
      signature =
        '0x' +
        '5500000010000000550000005500000041000000' + // 20 bytes for RcLockWitnessLock Molecule table. https://bit.ly/3if4CRg
        signature.slice(2);
      return signature;
    } else
      throw new Error(
        `The specified lock has not been implemented: ${message.lock.codeHash} ${message.lock.hashType}`
      );
  }

  async close() {
    return true;
  }
}
