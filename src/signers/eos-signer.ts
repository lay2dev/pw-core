import { Signer, Message } from './signer';
import { Keccak256Hasher } from '../hashers';
import { Platform } from '../providers';
import ecc from 'eosjs-ecc';
import { getEosPublicKey, spliceStr } from '../utils';

export class EosSigner extends Signer {
  currentPlatform: Platform;
  constructor(public readonly from: string) {
    super(new Keccak256Hasher());
    this.currentPlatform = Platform.eos;
  }

  processEosHash(a) {
    let str = a.replace('0x', '');
    str = spliceStr(str, 12, 0, ' ');
    str = spliceStr(str, 12 * 2 + 1, 0, ' ');
    str = spliceStr(str, 12 * 3 + 2, 0, ' ');
    str = spliceStr(str, 12 * 4 + 3, 0, ' ');
    str = spliceStr(str, 12 * 5 + 4, 0, ' ');
    return str;
  }

  async signMessages(messages: Message[]): Promise<string[]> {
    const pubkey = await getEosPublicKey(this.from);
    const sig = await window.scatter.getArbitrarySignature(
      pubkey,
      this.processEosHash(messages[0].message)
    );

    const sigHex = ecc.Signature.from(sig).toHex().replace('0x', '');
    let v = Number.parseInt(sigHex.slice(0, 2), 16);
    if (v >= 27) v = (v - 27) % 4;

    const result =
      '0x' +
      this.currentPlatform.toString(16).padStart(2, '0') +
      sigHex.slice(2) +
      v.toString(16).padStart(2, '0');
    return [result];
  }
}
