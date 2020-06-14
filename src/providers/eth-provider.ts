import { Provider } from './provider';
import { Address, AddressType } from '..';

export class EthProvider extends Provider {
  async init() {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.autoRefreshOnNetworkChange = false;
      const accounts = await window.ethereum.enable();
      this.address = new Address(accounts[0], AddressType.eth);
    } else {
      throw new Error(
        'window.ethereum is undefined, Ethereum environment is required.'
      );
    }
  }
}
