import { Signer, Message } from '.';
// import { LockType } from '..';
import { Provider } from '../providers';
import PWCore from '../core';
import { LockType } from '..';

export class DefaultSigner extends Signer {
  constructor(public readonly provider: Provider) {
    super(provider.hasher());
  }

  async signMessages(messages: Message[]): Promise<string[]> {
    const sigs = [];
    for (const message of messages) {
      // Determine if PW-Lock was used for the lock in the message and determine the lock hash based on that.
      const isPwLock =
        message.lock.codeHash === PWCore.config.pwLock.script.codeHash &&
        message.lock.hashType === PWCore.config.pwLock.script.hashType;
      const lockType = isPwLock ? LockType.pw : null;
      const lockHash = this.provider.address.toLockScript(lockType).toHash();

      if (lockHash === message.lock.toHash()) {
        sigs.push(await this.provider.sign(message.message));
      } else {
        sigs.push('0x');
      }
    }

    return sigs;
  }
}
