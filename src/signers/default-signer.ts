import { Signer, Message } from '.';
// import { LockType } from '..';
import { Provider } from '../providers';
import { LockType } from '..';

export class DefaultSigner extends Signer {
  constructor(public readonly provider: Provider) {
    super();
  }

  async signMessages(messages: Message[]): Promise<string[]> {
    const sigs = [];
    for (const message of messages) {
      // Determine if PW-Lock was used.
      const isPwLock = message.lock.identifyLockType() === LockType.pw;

      // If PwLock, determine the lock hash based on LockType.pw.
      const lockType = isPwLock ? LockType.pw : null;
      const lockHash = this.provider.address.toLockScript(lockType).toHash();

      // Attempt to sign only for messages matching the current lock hash.
      if (lockHash === message.lock.toHash()) {
        // Sign the message.
        sigs.push(await this.provider.sign(message));
      } else {
        sigs.push('0x');
      }
    }

    return sigs;
  }
}
