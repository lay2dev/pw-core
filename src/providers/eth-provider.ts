import PWCore, { ChainID } from '../core';
import { Address, AddressType, LockType, LockTypeOmniPw } from '../models';
import { Provider, Platform } from './provider';
import { Message } from '../signers';
import ENS from 'ethereum-ens';

export class EthProvider extends Provider {
  lockType: LockTypeOmniPw | null;
  onAddressChanged: (newAddress: Address) => void;
  constructor(
    onAddressChanged?: (newAddress: Address) => void,
    lockType: LockTypeOmniPw | null = null
  ) {
    super(Platform.eth);
    this.lockType = lockType;
    this.onAddressChanged = onAddressChanged;
  }
  async init(): Promise<Provider> {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.autoRefreshOnNetworkChange = false;
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      this.address = new Address(
        accounts[0],
        AddressType.eth,
        undefined,
        this.lockType
      );

      if (!!window.ethereum.on) {
        window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
          this.address = new Address(
            newAccounts[0],
            AddressType.eth,
            undefined,
            this.lockType
          );
          if (!!this.onAddressChanged) {
            this.onAddressChanged(this.address);
          }
        });
      }

      return this;
    } else if (!!window.web3) {
      console.log('[eth-provider] try window.web3');
      const accounts = await new Promise((resolve, reject) => {
        window.web3.eth.getAccounts((err, result) => {
          if (!!err) {
            reject(err);
          }
          resolve(result);
        });
      });
      this.address = new Address(
        accounts[0],
        AddressType.eth,
        undefined,
        this.lockType
      );

      return this;
    } else {
      throw new Error(
        'window.ethereum is undefined, Ethereum environment is required.'
      );
    }
  }

  async ensResolver(ens: string): Promise<string> {
    try {
      return await new ENS(window.web3.currentProvider).resolver(ens).addr();
    } catch {
      return 'Unknown ENS Name';
    }
  }

  protected handleResultOmni(result): string {
    let v = Number.parseInt(result.slice(-2), 16);
    if (v >= 27) v -= 27;
    result =
      '0x' +
      '5500000010000000550000005500000041000000' + // 20 bytes for RcLockWitnessLock Molecule table. https://bit.ly/3if4CRg
      result.slice(2, -2) +
      v.toString(16).padStart(2, '0');
    return result;
  }

  protected handleResultPw = (result): string => {
    let v = Number.parseInt(result.slice(-2), 16);
    if (v >= 27) v -= 27;
    result =
      '0x' +
      (PWCore.chainId === ChainID.ckb
        ? ''
        : this.platform.toString(16).padStart(2, '0')) + // Testnet release requires an extra byte for the platform.
      result.slice(2, -2) +
      v.toString(16).padStart(2, '0');
    return result;
  };

  async sign(message: Message): Promise<string> {
    return new Promise((resolve, reject) => {
      // Determine handler based on the lock type.
      const handleResult =
        message.lock.identifyLockType() === LockType.pw
          ? this.handleResultPw
          : this.handleResultOmni;

      const from = this.address.addressString;
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum
          .request({ method: 'personal_sign', params: [from, message.message] })
          .then((result) => {
            resolve(handleResult(result));
          });
      } else if (!!window.web3) {
        window.web3.currentProvider.sendAsync(
          { method: 'personal_sign', params: [message.message, from], from },
          (err, result) => {
            if (err) {
              reject(err);
            }
            if (result.error) {
              reject(result.error);
            }
            resolve(handleResult(result.result));
          }
        );
      } else {
        reject(
          new Error(
            'window.ethereum/window.web3 is undefined, Ethereum environment is required.'
          )
        );
      }
    });
  }

  async close() {
    return true;
  }
}
