import { Provider, Platform } from './provider';
import { Address, AddressType } from '..';
import ENS from 'ethereum-ens';
import Web3 from 'web3';
import { verifyEthAddress } from '../utils';

export class Web3ModalProvider extends Provider {
  onAddressChanged: (newAddress: Address) => void;

  web3: Web3;

  constructor(
    readonly web3Provider: any,
    onAddressChanged?: (newAddress: Address) => void
  ) {
    super(Platform.eth);
    this.onAddressChanged = onAddressChanged;
  }

  async init(): Promise<Provider> {
    this.web3 = new Web3(this.web3Provider);
    const accounts = await this.web3.eth.getAccounts();
    if (!verifyEthAddress(accounts[0])) {
      throw new Error('get ethereum address failed');
    }

    this.address = new Address(accounts[0], AddressType.eth);
    if (this.web3Provider.on) {
      this.web3Provider.on('accountsChanged', async (newAccounts: string[]) => {
        this.address = new Address(newAccounts[0], AddressType.eth);
        this.onAddressChanged(this.address);
      });
    }

    return this;
  }

  async ensResolver(ens: string): Promise<string> {
    try {
      return await new ENS(this.web3Provider).resolver(ens).addr();
    } catch (e) {
      return 'Unknown ENS Name';
    }
  }

  async sign(message: string): Promise<string> {
    let result = await this.web3.eth.personal.sign(
      message,
      this.address.addressString,
      null
    );

    let v = Number.parseInt(result.slice(-2), 16);
    if (v >= 27) v -= 27;
    result = result.slice(0, -2) + v.toString(16).padStart(2, '0');

    return result;
  }

  async close() {
    if (this.web3 && this.web3Provider && this.web3Provider.close) {
      await this.web3Provider.close();
    }
  }
}
