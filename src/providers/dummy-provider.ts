import { Provider, Platform } from './provider';
import { Address, AddressType } from '../models';

export class DummyProvider extends Provider {
  sign(message: string): Promise<string> {
    console.log('message', message);
    throw new Error('Method not implemented.');
  }
  constructor(platform: Platform = Platform.eth) {
    super(platform);
  }
  async init(): Promise<Provider> {
    if (this.platform === Platform.eth) {
      this.address = new Address(
        '0x26C5F390FF2033CbB44377361c63A3Dd2DE3121d',
        AddressType.eth
      );
    } else {
      this.address = new Address(
        'ckt1qyqxpayn272n8km2k08hzldynj992egs0waqnr8zjs',
        AddressType.ckb
      );
    }
    return this;
  }

  async close() {
    return true;
  }
}
