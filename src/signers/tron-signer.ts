import { Signer, Message } from './signer';
import { Keccak256Hasher } from '../hashers';
import { Platform } from '../providers';

export class TronSigner extends Signer {
  currentPlatform: Platform;
  constructor(public readonly from: string) {
    super(new Keccak256Hasher());
    this.currentPlatform = Platform.tron;
  }

  async signMessages(messages: Message[]): Promise<string[]> {
    let result = await window.tronWeb.trx.sign(messages[0].message);
    let v = Number.parseInt(result.slice(-2), 16);
    if (v >= 27) v -= 27;
    result =
      '0x' +
      this.currentPlatform.toString(16).padStart(2, '0') +
      result.slice(2, -2) +
      v.toString(16).padStart(2, '0');

    return [result];
  }
}
