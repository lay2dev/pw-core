import { Provider, Platform } from './provider';
import { Address, AddressType } from '../models';

export class TronProvider extends Provider {
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

  async sign(message: string): Promise<string> {
    let result = await window.tronWeb.trx.sign(message);
    let v = Number.parseInt(result.slice(-2), 16);
    if (v >= 27) v -= 27;
    result =
      '0x' +
      this.platform.toString(16).padStart(2, '0') +
      result.slice(2, -2) +
      v.toString(16).padStart(2, '0');

    return result;
  }

  close() {
    throw new Error('Method not implemented.');
  }
}
