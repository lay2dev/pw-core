import { Message, Signer } from '.';
import { Keccak256Hasher } from '../hashers';
import { Provider } from '../providers';

export class DefaultSigner extends Signer {
  constructor(
    public readonly provider: Provider,
    hasher = new Keccak256Hasher()
  ) {
    super(hasher);
  }

  async signMessages(messages: Message[]): Promise<string[]> {
    const sigs = [];
    for (const message of messages) {
      if (
        this.provider.address.toLockScript().toHash() === message.lock.toHash()
      ) {
        sigs.push(await this.provider.sign(message.message));
      } else {
        sigs.push('0x');
      }
    }

    return sigs;
  }
}
