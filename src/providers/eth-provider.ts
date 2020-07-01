import { Provider, Platform } from './provider';
import { Address, AddressType } from '..';

export class EthProvider extends Provider {
  onAddressChanged: any;
  constructor(onAddressChanged?: (newAddress: Address) => void) {
    super(Platform.eth);
    this.onAddressChanged = onAddressChanged;
  }
  async init(): Promise<Provider> {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.autoRefreshOnNetworkChange = false;
      const accounts = await window.ethereum.enable();
      this.address = new Address(accounts[0], AddressType.eth);
      window.ethereum.on &&
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          this.address = new Address(accounts[0], AddressType.eth);
          this.onAddressChanged && this.onAddressChanged(this.address);
        });

      return this;
    } else {
      throw new Error(
        'window.ethereum is undefined, Ethereum environment is required.'
      );
    }
  }
}
