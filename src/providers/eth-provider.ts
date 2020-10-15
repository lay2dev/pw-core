import { Provider, Platform } from './provider';
import { Address, AddressType } from '../models';
import ENS from 'ethereum-ens';

export class EthProvider extends Provider {
  onAddressChanged: (newAddress: Address) => void;
  constructor(onAddressChanged?: (newAddress: Address) => void) {
    super(Platform.eth);
    this.onAddressChanged = onAddressChanged;
  }
  async init(): Promise<Provider> {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.autoRefreshOnNetworkChange = false;
      const accounts = await window.ethereum.enable();
      this.address = new Address(accounts[0], AddressType.eth);

      if (!!window.ethereum.on) {
        window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
          this.address = new Address(newAccounts[0], AddressType.eth);
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
      this.address = new Address(accounts[0], AddressType.eth);

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
    } catch (e) {
      return 'Unknown ENS Name';
    }
  }

  async sign(message: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const from = this.address.addressString;
      const params = [message, from];
      const method = 'personal_sign';

      window.web3.currentProvider.sendAsync(
        { method, params, from },
        (err, result) => {
          if (err) {
            reject(err);
          }
          if (result.error) {
            reject(result.error);
          }
          result = result.result;
          let v = Number.parseInt(result.slice(-2), 16);
          if (v >= 27) v -= 27;
          result =
            '0x' +
            this.platform.toString(16).padStart(2, '0') +
            result.slice(2, -2) +
            v.toString(16).padStart(2, '0');

          resolve(result);
        }
      );
    });
  }

  async close() {
    return true;
  }
}
