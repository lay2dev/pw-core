import JSBI from 'jsbi';
import bech32 from 'bech32';
import { FormatOptions } from '.';

export const BASE = '100000000';
const ZERO = JSBI.BigInt(0);
const base = JSBI.BigInt(BASE);
const baseLen = BASE.length - 1;
const BECH32_LIMIT = 1023;

export const shannonToCKB = (
  shannonAmount: string,
  options: FormatOptions = { section: 'full' }
): string => {
  let amount = JSBI.BigInt(shannonAmount);
  const negative = JSBI.LT(amount, ZERO);

  if (negative) {
    amount = JSBI.unaryMinus(amount);
  }

  let fraction = JSBI.remainder(amount, base).toString(10);

  while (fraction.length < baseLen) {
    fraction = `0${fraction}`;
  }

  if (options && !options.pad) {
    fraction = fraction.match(/^([0-9]*[1-9]|0)(0*)/)[1];
  }

  let whole = JSBI.divide(amount, base).toString(10);

  if (options && options.commify) {
    whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  let result = `${whole}${fraction === '0' ? '' : `.${fraction}`}`;

  if (options && options.fixed) {
    const fixed = Number(`0.${fraction}`).toFixed(options.fixed).split('.');
    whole = fixed[0] === '0' ? whole : `${Number(whole) + 1}`;
    fraction = fixed[1];
    result = `${whole}.${fraction}`;
  }

  if (options && options.section === 'whole') {
    result = whole;
  }

  if (negative) {
    result = `-${result}`;
  }

  if (options && options.section === 'fraction') {
    result = fraction;
  }

  return result;
};

export const ckbToShannon = (ckbAmount: string): string => {
  if (Number.isNaN(Number(ckbAmount))) {
    throw new Error(`ckb amount ${ckbAmount} is not a number`);
  }

  let amount = Number(ckbAmount).toFixed(8);

  const negative = amount.slice(0, 1) === '-';

  if (negative) {
    amount = amount.slice(1);
  }

  const comps = amount.split('.');
  const whole = JSBI.BigInt(comps[0]);
  const fraction = JSBI.BigInt(comps[1]);

  let result = JSBI.add(JSBI.multiply(whole, base), fraction);

  if (negative) {
    result = JSBI.unaryMinus(result);
  }

  return result.toString();
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
