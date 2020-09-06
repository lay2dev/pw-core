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
}
