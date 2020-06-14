import { Provider } from './provider';
import { Address, AddressType } from '..';

export class DummyProvider extends Provider {
  async init(): Promise<void> {
    this.address = new Address(
      '0x26C5F390FF2033CbB44377361c63A3Dd2DE3121d',
      AddressType.eth
    );
  }
}
