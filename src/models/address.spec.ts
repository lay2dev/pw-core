import test from 'ava';
import PWCore, { ChainID } from '../core';
import { Address, AddressType } from './address';
import { DummyCollector } from '../collectors/dummy-collector';
import { DummyProvider } from '../providers/dummy-provider';

const eth = '0x32f4c2df50f678a94609e98f8ee7ffb14b6799bc'.toLowerCase();
const ckb = 'ckt1qyqxpayn272n8km2k08hzldynj992egs0waqnr8zjs';
const ckbFull =
  'ckt1qjmk32srs9nx345sgj0xrcq6slzx5ta3vt8azm4py95aalx7qq2agvh5ct04panc49rqn6v03mnllv2tv7vmc2z5pkp';

const ckbAddress = new Address(ckb, AddressType.ckb);
const ckbFullAddress = new Address(ckbFull, AddressType.ckb);
const ethAddress = new Address(eth, AddressType.eth);

test.before(async () => {
  await new PWCore('https://aggron.ckb.dev').init(
    new DummyProvider(),
    new DummyCollector(),
    ChainID.ckb_testnet
  );
});

test('to address and type', (t) => {
  t.is(ethAddress.addressString, eth);
  t.is(ethAddress.addressType, AddressType.eth);

  t.is(ckbAddress.addressString, ckb);
  t.is(ckbAddress.addressType, AddressType.ckb);

  t.is(ckbFullAddress.addressString, ckbFull);
  t.is(ckbFullAddress.addressType, AddressType.ckb);
});

test('to ckb address', (t) => {
  t.is(ethAddress.toCKBAddress(), ckbFull);
  t.is(ckbFullAddress.toCKBAddress(), ckbFull);
  t.is(ckbAddress.toCKBAddress(), ckb);
});

test('to lock script', (t) => {
  t.deepEqual(ethAddress.toLockScript().serializeJson(), {
    args: eth,
    code_hash: PWCore.config.pwLock.script.codeHash,
    hash_type: PWCore.config.pwLock.script.hashType,
  });

  t.deepEqual(ckbAddress.toLockScript().serializeJson(), {
    args: '0x60f493579533db6ab3cf717da49c8a5565107bba',
    code_hash: PWCore.config.defaultLock.script.codeHash,
    hash_type: PWCore.config.defaultLock.script.hashType,
  });

  t.deepEqual(ckbFullAddress.toLockScript().serializeJson(), {
    args: '0x32f4c2df50f678a94609e98f8ee7ffb14b6799bc',
    code_hash: PWCore.config.pwLock.script.codeHash,
    hash_type: PWCore.config.pwLock.script.hashType,
  });
});
