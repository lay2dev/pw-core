import test from 'ava';
import PWCore, { ChainID } from '../core';
import { Address, AddressType } from './address';
import { DummyCollector } from '../collectors/dummy-collector';
import { Script } from '.';
import { HashType } from '../interfaces';
import { validators } from 'ckb-js-toolkit';
import { DummyProvider } from '../providers/dummy-provider';

const address = new Address(
  'ckt1qyqxpayn272n8km2k08hzldynj992egs0waqnr8zjs',
  AddressType.ckb
);

const lockScript = new Script(
  '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
  '0x60f493579533db6ab3cf717da49c8a5565107bba',
  HashType.type
);

test.before(async () => {
  await new PWCore('https://aggron.ckb.dev').init(
    new DummyProvider(),
    new DummyCollector(),
    ChainID.ckb_testnet
  );
});

test('validate', (t) => {
  t.notThrows(() => validators.ValidateScript(lockScript.serializeJson()));
});

test('sameWith', (t) => {
  t.true(lockScript.sameWith(lockScript), 'the two lockscripts are the same');
});

test('toAddress', (t) => {
  t.deepEqual(lockScript.toAddress(), address);
});

test.todo('toHash');
