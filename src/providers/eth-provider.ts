import { Provider, Platform } from './provider';
import { Address, AddressType } from '..';

export class EthProvider extends Provider {
  constructor() {
    super(Platform.eth);
  }
  async init(): Promise<Provider> {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.autoRefreshOnNetworkChange = false;
      const accounts = await window.ethereum.enable();
      this.address = new Address(accounts[0], AddressType.eth);
      return this;
    } else {
      throw new Error(
        'window.ethereum is undefined, Ethereum environment is required.'
      );
    }
  }
}
