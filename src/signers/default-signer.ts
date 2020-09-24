import { Signer, Message } from '.';
import { Keccak256Hasher } from '../hashers';
import { Provider } from '../providers';

export class DefaultSigner extends Signer {
  constructor(public readonly provider: Provider) {
    super(new Keccak256Hasher());
  }

  async signMessages(messages: Message[]): Promise<string[]> {
    return [await this.provider.sign(messages[0].message)];
  }
}
