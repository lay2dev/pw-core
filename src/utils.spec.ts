import JSBI from 'jsbi';
import anyTest, { TestInterface } from 'ava';
import {
  describeAddress,
  LumosConfigs,
  readBigUInt128LE,
  readBigUInt32LE,
  readBigUInt64LE,
  toBigUInt128LE,
  verifyEosAddress,
  verifyTronAddress,
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

  const numLE = toBigUInt128LE(JSBI.BigInt(hexBE));
  t.deepEqual(numLE, hexLE, 'self toBigUInt128LE');
});

test('verifyEosAddress', (t) => {
  t.is(verifyEosAddress('sking1234567'), false);
  t.is(verifyEosAddress('sking123456'), false);
  t.is(verifyEosAddress('sking1234511'), true);
});

test('verifyTronAddress', (t) => {
  t.is(verifyTronAddress('TNV2p8Zmy5JcZWbtn59Qee8jTdGmCRC6e8'), true);
  t.is(verifyTronAddress('TNV2p8Zmy5JcZWbtn59Qee8jTdGmCRC6e'), false);
});

test('describeAddress() general test', (t) => {
  let address;
  let validData;
  let result;

  // Short address (pre2021) SECP256K1 + Blake160.
  address = 'ckt1qyqxpayn272n8km2k08hzldynj992egs0waqnr8zjs';
  validData = {addressVersion: 'pre2021', deprecated: true, payloadFormatType: 1, shortFormatType: 0};
  result = describeAddress(address, {config: LumosConfigs[1]});
  delete result.description;
  t.deepEqual(result, validData);

  // Short address (pre2021) ACP.
  address = 'ckt1qyp260h7pphjhlapmxqhrm7e0nmhujrqqmdqjfln9h';
  validData = {addressVersion: 'pre2021', deprecated: true, payloadFormatType: 1, shortFormatType: 2};
  result = describeAddress(address, {config: LumosConfigs[1]});
  delete result.description;
  t.deepEqual(result, validData);

  // Full address (pre2021) hash type "type".
  address = 'ckt1qjda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsc85jdte2v7md2eu7uta5jwg54t9zpam5y9ptgq';
  validData = {addressVersion: 'pre2021', deprecated: true, payloadFormatType: 4, shortFormatType: null};
  result = describeAddress(address, {config: LumosConfigs[1]});
  delete result.description;
  t.deepEqual(result, validData);

  // Full address (ckb2021).
  address = 'ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqtq7jf409fnmd4t8nm30kjfezj4v5g8hwskhal6m';
  validData = {addressVersion: 'ckb2021', deprecated: false, payloadFormatType: 0, shortFormatType: null};
  result = describeAddress(address, {config: LumosConfigs[1]});
  delete result.description;
  t.deepEqual(result, validData);
});
