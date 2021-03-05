import { ec as EC } from 'elliptic';

const ec = new EC('secp256k1');

const hexToBytes = (rawhex: string | number | bigint) => {
  if (rawhex === '') return new Uint8Array();
  if (typeof rawhex === 'string' && !rawhex.startsWith('0x')) {
    throw new Error(`Hex string ${rawhex} should start with 0x`);
  }

  let hex = rawhex.toString(16).replace(/^0x/i, '');
  hex = hex.length % 2 ? `0${hex}` : hex;

  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }

  return new Uint8Array(bytes);
};

interface Options {
  compressed?: boolean;
}

export class ECPair {
  protected key: EC.KeyPair;

  public compressed: boolean = false;

  constructor(
    sk: Uint8Array | string,
    { compressed = true }: Options = {
      compressed: true,
    }
  ) {
    if (sk === undefined) throw new Error('Private key is required');

    if (typeof sk === 'string' && !sk.startsWith('0x')) {
      throw new Error(`Hex string ${sk} should start with 0x`);
    }

    if (typeof sk === 'string' && sk.length !== 66) {
      throw new Error('Private key has invalid length');
    }

    if (typeof sk === 'object' && sk.byteLength !== 32) {
      throw new Error('Private key has invalid length');
    }

    this.key = ec.keyFromPrivate(
      typeof sk === 'string' ? sk.replace(/^0x/, '') : sk
    );
    this.compressed = compressed;
  }

  get privateKey() {
    return `0x${this.key.getPrivate('hex').padStart(64, '0')}`;
  }

  get publicKey() {
    return `0x${this.key.getPublic(this.compressed, 'hex') as string}`;
  }

  public getPrivateKey = (enc: 'hex' = 'hex') => {
    if (enc === 'hex') {
      return this.privateKey;
    }
    return this.key.getPrivate(enc);
  }

  public getPublicKey = (enc: 'hex' | 'array') => {
    if (enc === 'hex') {
      return this.publicKey;
    }
    return this.key.getPublic(this.compressed, enc);
  }

  public sign = (message: string | Uint8Array): string => {
    const msg = typeof message === 'string' ? hexToBytes(message) : message;
    return `0x${this.key
      .sign(msg, {
        canonical: true,
      })
      .toDER('hex')}`;
  }

  public verify = (message: string | Buffer, sig: string | Buffer) => {
    const msg = typeof message === 'string' ? hexToBytes(message) : message;
    const signature = typeof sig === 'string' ? hexToBytes(sig) : sig;
    return this.key.verify(msg, signature as any);
  }

  public signRecoverable = (message: string | Uint8Array): string => {
    const msg = typeof message === 'string' ? hexToBytes(message) : message;
    const { r, s, recoveryParam } = this.key.sign(msg, {
      canonical: true,
    });
    if (recoveryParam === null) throw new Error('Fail to sign the message');
    const fmtR = r.toString(16).padStart(64, '0');
    const fmtS = s.toString(16).padStart(64, '0');
    return `0x${fmtR}${fmtS}0${recoveryParam}`;
  }
}
