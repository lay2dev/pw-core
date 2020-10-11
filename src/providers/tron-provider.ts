import { Provider, Platform } from './provider';
import { Address, AddressType } from '../models';

export class TronProvider extends Provider {
  sign(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  close() {
    throw new Error('Method not implemented.');
  }
  onAddressChanged: (newAddress: Address) => void;
  constructor(onAddressChanged?: (newAddress: Address) => void) {
    super(Platform.tron);
    this.onAddressChanged = onAddressChanged;
  }
  async init(): Promise<Provider> {
    if (!!window.tronWeb) {
      console.log('[tron-provider] try window.tronWeb');
      if (
        !window.tronWeb.defaultAddress ||
        !window.tronWeb.defaultAddress.base58
      ) {
        throw new Error(
          'get tron address failed, please switch to tron account'
        );
      }
      this.address = new Address(
        window.tronWeb.defaultAddress.base58,
        AddressType.tron
      );
      return this;
    } else {
      throw new Error(
        'window.tronWeb is undefined, Tron environment is required.'
      );
    }
  }
}
