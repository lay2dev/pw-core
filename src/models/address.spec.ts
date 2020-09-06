import test from 'ava';
import PWCore, { ChainID } from '../core';
import { Address, AddressType } from './address';
import { DummyCollector } from '../collectors/dummy-collector';
import { DummyProvider } from '../providers/dummy-provider';
import { getCKBLockArgsForEosAccount } from '../utils';

const eth = '0x32f4c2df50f678a94609e98f8ee7ffb14b6799bc';
const ckb = 'ckt1qyqxpayn272n8km2k08hzldynj992egs0waqnr8zjs';
const ckbFull =
  'ckt1q3vvtay34wndv9nckl8hah6fzzcltcqwcrx79apwp2a5lkd07fdxxvh5ct04panc49rqn6v03mnllv2tv7vmc9kkmjq';

const eos = 'sking1234511';
const eosFull =
  'ckt1q3vvtay34wndv9nckl8hah6fzzcltcqwcrx79apwp2a5lkd07fdxxm6cetwv38anze52vznk9mz8dcwsjns4kdxuu6a';
const tron = 'TNV2p8Zmy5JcZWbtn59Qee8jTdGmCRC6e8';
const tronFull =
  'ckt1q3vvtay34wndv9nckl8hah6fzzcltcqwcrx79apwp2a5lkd07fdx8z2900qym3ghkd4x8ullvz0ftg52ekvqqtyehuu';

const ckbAddress = new Address(ckb, AddressType.ckb);
const ckbFullAddress = new Address(ckbFull, AddressType.ckb);
const ethAddress = new Address(eth, AddressType.eth);
let eosAddress;
const tronAddress = new Address(tron, AddressType.tron);

test.before(async () => {
  await new PWCore('https://aggron.ckb.dev').init(
    new DummyProvider(),
    new DummyCollector(),
    ChainID.ckb_testnet
  );
  const lockArgs = await getCKBLockArgsForEosAccount(eos);
  eosAddress = new Address(eos, AddressType.eos, lockArgs);
});

test('get lock args for eos', async (t) => {
  const lockArgs = await getCKBLockArgsForEosAccount(eos);
  t.is(lockArgs, '0x6f58cadcc89fb31668a60a762ec476e1d094e15b');
});

test('to address and type', (t) => {
  t.is(ethAddress.addressString, eth);
  t.is(ethAddress.addressType, AddressType.eth);

  t.is(ckbAddress.addressString, ckb);
  t.is(ckbAddress.addressType, AddressType.ckb);

  t.is(eosAddress.addressString, eos);
  t.is(eosAddress.addressType, AddressType.eos);

  t.is(tronAddress.addressString, tron);
  t.is(tronAddress.addressType, AddressType.tron);

  t.is(ckbFullAddress.addressString, ckbFull);
  t.is(ckbFullAddress.addressType, AddressType.ckb);
});

test('to ckb address', (t) => {
  t.is(ethAddress.toCKBAddress(), ckbFull);
  t.is(ckbFullAddress.toCKBAddress(), ckbFull);
  t.is(ckbAddress.toCKBAddress(), ckb);

  t.is(eosAddress.toCKBAddress(), eosFull);
  t.is(tronAddress.toCKBAddress(), tronFull);
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

  t.deepEqual(eosAddress.toLockScript().serializeJson(), {
    args: '0x6f58cadcc89fb31668a60a762ec476e1d094e15b',
    code_hash: PWCore.config.pwLock.script.codeHash,
    hash_type: PWCore.config.pwLock.script.hashType,
  });

  t.deepEqual(tronAddress.toLockScript().serializeJson(), {
    args: '0x89457bc04dc517b36a63f3ff609e95a28acd9800',
    code_hash: PWCore.config.pwLock.script.codeHash,
    hash_type: PWCore.config.pwLock.script.hashType,
  });
});
