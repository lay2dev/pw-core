import JSBI from 'jsbi';
import bech32 from 'bech32';
import { FormatOptions } from './models/amount';
import { toUint64Le } from '@nervosnetwork/ckb-sdk-utils';
import Decimal from 'decimal.js';

const BECH32_LIMIT = 1023;

export const shannonToCKB = (
  shannonAmount: string,
  options: FormatOptions
): string => bnStringToRationalNumber(shannonAmount, 8, options);

export const ckbToShannon = (ckbAmount: string): string =>
  rationalNumberToBnString(ckbAmount, 8);

export const bnStringToRationalNumber = (
  bn: string,
  decimals: number,
  options: FormatOptions
) => {
  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new Error("value of 'decimals' must be a natural integer");
  }

  const n = new Decimal(bn);
  if (n.isNeg()) {
    bn = bn.slice(1);
  }

  let int = bn;
  let dec = '';
  if (decimals > 0) {
    const intLen = bn.length - decimals;
    int = intLen > 0 ? bn.substr(0, intLen) : '0';
    dec = intLen > 0 ? bn.slice(intLen) : `${'0'.repeat(-intLen)}${bn}`;
    dec = new Decimal(`0.${dec}`).toFixed().slice(2);
  }

  if (options) {
    if (options.fixed !== undefined) {
      if (
        !Number.isInteger(options.fixed) ||
        options.fixed < 1
        // || options.fixed > decimals
      ) {
        throw new Error(
          // `value of \'fixed\' must be a positive integer and not bigger than decimals value ${decimals}`
          `value of 'fixed' must be a positive integer`
        );
      }
      const res = new Decimal(`0.${dec}`).toFixed(options.fixed).split('.');
      dec = res[1];
      if (res[0] === '1') {
        int = JSBI.add(JSBI.BigInt(int), JSBI.BigInt(1)).toString();
      }
    } else if (options.pad && dec.length < decimals) {
      dec = `${dec}${'0'.repeat(decimals - dec.length)}`;
    }
    if (options.commify) {
      int = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    if (options.section === 'decimal') {
      return dec;
    }
    if (options.section === 'integer') {
      return n.isNeg() ? `-${int}` : int;
    }
  }

  if (n.isNeg()) {
    int = `-${int}`;
  }

  if (dec.length) return `${int}.${dec}`;
  return int;
};

export const rationalNumberToBnString = (
  rational: string,
  decimals: number
) => {
  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new Error("value of 'decimals' must be a natural integer");
  }
  if (decimals === 0) return rational;

  if (rational === '0x') rational = '0';
  // const r = new Decimal(rational);
  // if (r.dp() > decimals) {
  //   throw new Error(
  //     `decimals ${decimals} is smaller than the digits number of ${rational}`
  //   );
  // }

  if (typeof rational === 'number') {
    const dp = new Decimal(rational).dp();
    rational = Number(rational).toFixed(dp);
  }

  const parts = `${rational}`.split('.');

  if (!!parts[1] && parts[1].length > decimals) {
    throw new Error(
      `decimals ${decimals} is smaller than the digits number of ${rational}`
    );
  }

  return `${parts.join('')}${'0'.repeat(
    decimals - (!!parts[1] ? parts[1].length : 0)
  )}`;
};

// from @lumos/helper

const LINA = {
  PREFIX: 'ckb',
  SCRIPTS: {
    SECP256K1_BLAKE160: {
      SCRIPT: {
        code_hash:
          '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        hash_type: 'type',
      },
      OUT_POINT: {
        tx_hash:
          '0x71a7ba8fc96349fea0ed3a5c47992e3b4084b031a42264a018e0072e8172e46c',
        index: '0x0',
      },
      DEP_TYPE: 'dep_group',
      SHORT_ID: 0,
    },
    SECP256K1_BLAKE160_MULTISIG: {
      SCRIPT: {
        code_hash:
          '0x5c5069eb0857efc65e1bca0c07df34c31663b3622fd3876c876320fc9634e2a8',
        hash_type: 'type',
      },
      OUT_POINT: {
        tx_hash:
          '0x71a7ba8fc96349fea0ed3a5c47992e3b4084b031a42264a018e0072e8172e46c',
        index: '0x1',
      },
      DEP_TYPE: 'dep_group',
      SHORT_ID: 1,
    },
  },
};

const AGGRON4 = {
  PREFIX: 'ckt',
  SCRIPTS: {
    SECP256K1_BLAKE160: {
      SCRIPT: {
        code_hash:
          '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        hash_type: 'type',
      },
      OUT_POINT: {
        tx_hash:
          '0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37',
        index: '0x0',
      },
      DEP_TYPE: 'dep_group',
      SHORT_ID: 0,
    },
    SECP256K1_BLAKE160_MULTISIG: {
      SCRIPT: {
        code_hash:
          '0x5c5069eb0857efc65e1bca0c07df34c31663b3622fd3876c876320fc9634e2a8',
        hash_type: 'type',
      },
      OUT_POINT: {
        tx_hash:
          '0x6495cede8d500e4309218ae50bbcadb8f722f24cc7572dd2274f5876cb603e4e',
        index: '0x1',
      },
      DEP_TYPE: 'dep_group',
      SHORT_ID: 1,
    },
  },
};

export const LumosConfigs = [LINA, AGGRON4];

export function byteArrayToHex(a) {
  return '0x' + a.map((i) => ('00' + i.toString(16)).slice(-2)).join('');
}

export function hexToByteArray(h: string) {
  if (!/^(0x)?([0-9a-fA-F][0-9a-fA-F])*$/.test(h)) {
    throw new Error('Invalid hex string!');
  }
  if (h.startsWith('0x')) {
    h = h.slice(2);
  }
  const array = [];
  while (h.length >= 2) {
    array.push(parseInt(h.slice(0, 2), 16));
    h = h.slice(2);
  }
  return array;
}

export function generateAddress(script: any, { config = LINA } = {}): string {
  const scriptTemplate = Object.values(config.SCRIPTS).find(
    (s) =>
      s.SCRIPT.code_hash === script.code_hash &&
      s.SCRIPT.hash_type === script.hash_type
  );
  const data = [];
  if (scriptTemplate && scriptTemplate.SHORT_ID !== undefined) {
    data.push(1, scriptTemplate.SHORT_ID);
    data.push(...hexToByteArray(script.args));
  } else {
    data.push(script.hash_type === 'type' ? 4 : 2);
    data.push(...hexToByteArray(script.code_hash));
    data.push(...hexToByteArray(script.args));
  }
  const words = bech32.toWords(data);
  return bech32.encode(config.PREFIX, words, BECH32_LIMIT);
}

export function parseAddress(address: string, { config = LINA } = {}) {
  const { prefix, words } = bech32.decode(address, BECH32_LIMIT);
  if (prefix !== config.PREFIX) {
    throw Error(
      `Invalid prefix! Expected: ${config.PREFIX}, actual: ${prefix}`
    );
  }
  const data = bech32.fromWords(words);
  switch (data[0]) {
    case 1:
      if (data.length < 2) {
        throw Error(`Invalid payload length!`);
      }
      const scriptTemplate = Object.values(config.SCRIPTS).find(
        (s) => s.SHORT_ID === data[1]
      );
      if (!scriptTemplate) {
        throw Error(`Invalid code hash index: ${data[1]}!`);
      }
      return { ...scriptTemplate.SCRIPT, args: byteArrayToHex(data.slice(2)) };
    case 2:
      if (data.length < 33) {
        throw Error(`Invalid payload length!`);
      }
      return {
        code_hash: byteArrayToHex(data.slice(1, 33)),
        hash_type: 'data',
        args: byteArrayToHex(data.slice(33)),
      };
    case 4:
      if (data.length < 33) {
        throw Error(`Invalid payload length!`);
      }
      return {
        code_hash: byteArrayToHex(data.slice(1, 33)),
        hash_type: 'type',
        args: byteArrayToHex(data.slice(33)),
      };
  }
  throw Error(`Invalid payload format type: ${data[0]}`);
}

export function verifyCkbAddress(address: string): boolean {
  try {
    const config = address.startsWith('ckb') ? LINA : AGGRON4;
    parseAddress(address, { config });
    return true;
  } catch (e) {
    return false;
  }
}

export function verifyEthAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function verifyEosAddress(address: string): boolean {
  return /(^[a-z1-5.]{0,11}[a-z1-5]$)|(^[a-z1-5.]{12}[a-j1-5]$)/.test(address);
}

export function verifyTronAddress(address: string): boolean {
  // TNV2p8Zmy5JcZWbtn59Qee8jTdGmCRC6e8
  return /^T[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{33}$/.test(
    address
  );
}

export function spliceStr(
  original: string,
  idx: number,
  rem: number,
  str: string
) {
  return original.slice(0, idx) + str + original.slice(idx + Math.abs(rem));
}

export const hexDataOccupiedBytes = (hexString) => {
  // Exclude 0x prefix, and every 2 hex digits are one byte
  return (hexString.length - 2) / 2;
};

export const scriptOccupiedBytes = (script) => {
  if (script !== undefined && script !== null) {
    return (
      1 +
      hexDataOccupiedBytes(script.codeHash) +
      hexDataOccupiedBytes(script.args)
      //   script.args.map(hexDataOccupiedBytes).reduce((x, y) => x + y, 0)
    );
  }
  return 0;
};

export const cellOccupiedBytes = (cell) => {
  return (
    8 +
    hexDataOccupiedBytes(cell.data) +
    scriptOccupiedBytes(cell.lock) +
    scriptOccupiedBytes(cell.type)
  );
};
export function readBigUInt32LE(hex) {
  if (hex.slice(0, 2) !== '0x') {
    throw new Error('hex must start with 0x');
  }
  const dv = new DataView(new ArrayBuffer(4));
  dv.setUint32(0, Number(hex.slice(0, 10)), true);
  return JSBI.BigInt(dv.getUint32(0, false));
  // return BigInt(dv.getUint32(0, false));
}

export function toBigUInt64LE(num) {
  return toUint64Le(`0x${JSBI.BigInt(num).toString(16)}`);
}

export function readBigUInt64LE(hex) {
  if (hex.slice(0, 2) !== '0x') {
    throw new Error('hex must start with 0x');
  }
  const buf = hex.slice(2).padEnd(16, 0);

  const viewRight = `0x${buf.slice(0, 8)}`;
  const viewLeft = `0x${buf.slice(8, 16)}`;

  const numLeft = readBigUInt32LE(viewLeft).toString(16).padStart(8, '0');
  const numRight = readBigUInt32LE(viewRight).toString(16).padStart(8, '0');

  return JSBI.BigInt(`0x${numLeft}${numRight}`);
}

export function toBigUInt128LE(u128) {
  const viewRight = toBigUInt64LE(
    JSBI.signedRightShift(JSBI.BigInt(u128), JSBI.BigInt(64))
  );
  const viewLeft = toBigUInt64LE(
    JSBI.bitwiseAnd(JSBI.BigInt(u128), JSBI.BigInt('0xffffffffffffffff'))
  );

  return `${viewLeft}${viewRight.slice(2)}`;
}

export function readBigUInt128LE(hex) {
  if (hex.slice(0, 2) !== '0x') {
    throw new Error('hex must start with 0x');
  }
  const buf = hex.slice(2).padEnd(32, 0);

  const viewRight = `0x${buf.slice(0, 16)}`;
  const viewLeft = `0x${buf.slice(16, 32)}`;

  const numLeft = readBigUInt64LE(viewLeft).toString(16).padStart(16, '0');
  const numRight = readBigUInt64LE(viewRight).toString(16).padStart(16, '0');

  return JSBI.BigInt(`0x${numLeft}${numRight}`);
}
