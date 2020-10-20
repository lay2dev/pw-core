import anyTest, { TestInterface } from 'ava';
import {
  readBigUInt128LE,
  readBigUInt32LE,
  readBigUInt64LE,
  toBigUInt128LE,
} from './utils';

// import { utils } from '@ckb-lumos/base';

const test = anyTest as TestInterface<{ utils }>;

test('readUint32LE', (t) => {
  const hexLE = '0x78563412';
  const hexBE = '0x12345678';

  const num = readBigUInt32LE(hexLE);
  t.deepEqual(num.toString(16), hexBE.slice(2));
});

test('readUint64LE', (t) => {
  const hexLE = '0xefcdab9078563412';
  const hexBE = '0x1234567890abcdef';

  const num = readBigUInt64LE(hexLE);

  //   t.deepEqual(
  //     utils.readBigUInt64LE(hexLE).toString(16),
  //     hexBE.slice(2),
  //     'lumos'
  //   );
  t.deepEqual(num.toString(16), hexBE.slice(2), 'self');
});

test('readUint128LE', (t) => {
  const hexLE = '0x8f7e6d5c4b3a2019efcdab9078563412';
  const hexBE = '0x1234567890abcdef19203a4b5c6d7e8f';

  const num = readBigUInt128LE(hexLE);
  //   t.deepEqual(
  //     utils.readBigUInt128LE(hexLE).toString(16),
  //     hexBE.slice(2),
  //     'lumos'
  //   );

  t.deepEqual(num.toString(16), hexBE.slice(2), 'self');
});

test('toBigUInt128LE', (t) => {
  const hexLE = '0x8f7e6d5c4b3a2019efcdab9078563412';
  const hexBE = '0x1234567890abcdef19203a4b5c6d7e8f';

  //   const numLE2 = utils.toBigUInt128LE(BigInt(hexBE));
  //   t.deepEqual(numLE2, hexLE, 'lumos toBigUInt128LE');

  const numLE = toBigUInt128LE(BigInt(hexBE));
  t.deepEqual(numLE, hexLE, 'self toBigUInt128LE');
});
