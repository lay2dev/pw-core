import test from 'ava';
import PWCore, { ChainID } from '../core';
import { Address, AddressType } from './address';
import { DummyCollector } from '../collectors/dummy-collector';
import { EosProvider } from '../providers';
import { DummyProvider } from '../providers/dummy-provider';
import { AddressPrefix, HashType, Script } from '..';

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

const network = {
  blockchain: 'eos',
  chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
  host: 'mainnet.eosamsterdam.net',
  port: 80,
  protocol: 'http',
};
let eosProvider;

test.before(async () => {
  await new PWCore('https://aggron.ckb.dev').init(
    new DummyProvider(),
    new DummyCollector(),
    ChainID.ckb_testnet
  );
  eosProvider = new EosProvider(network);
  const lockArgs = await eosProvider.getCKBLockArgsForEosAccount(eos);
  eosAddress = new Address(eos, AddressType.eos, lockArgs);
});

test('get lock args for eos', async (t) => {
  const lockArgs = await eosProvider.getCKBLockArgsForEosAccount(eos);
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

test('to ckb2021 mainnet address (Nervos RFC21)', async (t) => {
  PWCore.chainId = ChainID.ckb;

  t.is(
    Address.fromLockScript(
      new Script(
        '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        '0xb39bbc0b3673c7d36450bc14cfcdad2d559c6c64',
        HashType.type
      ),
      AddressPrefix.ckb
    ).addressString,
    new Address(
      'ckb1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqdnnw7qkdnnclfkg59uzn8umtfd2kwxceqxwquc4',
      AddressType.ckb
    ).addressString
  );

  PWCore.chainId = ChainID.ckb_testnet;
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

test('is acp address', (t) => {
  t.true(
    new Address(
      'ckt1qjr2r35c0f9vhcdgslx2fjwa9tylevr5qka7mfgmscd33wlhfykykn2zrv2y5rex4nnyfs2tqkde8zmayrls6d3kwa5',
      AddressType.ckb
    ).isAcp()
  );
  t.false(
    new Address(
      'ckt1q35y83078t9h7nwzyvpe9qfuh8qjm08d2ktlegc22tcn4fgem6xnxwlwq4vae7nqgpkl6s59znsqmh9jkrtjhwct56efh7uep9y2xr04d4augtnmauya4s2cdvn0s6nxw9m6k7ndhf2l0un2g0tr7f88fegqns00nq',
      AddressType.ckb
    ).isAcp()
  );
});

test('minimal pay amount', (t) => {
  t.is(
    new Address(
      'ckt1q35y83078t9h7nwzyvpe9qfuh8qjm08d2ktlegc22tcn4fgem6xnxwlwq4vae7nqgpkl6s59znsqmh9jkrtjhwct56efh7uep9y2xr04d4augtnmauya4s2cdvn0s6nxw9m6k7ndhf2l0un2g0tr7f88fegqns00nq',
      AddressType.ckb
    )
      .minPaymentAmount()
      .toString(),
    '105'
  );
  t.is(
    new Address(
      'ckt1qyqxpayn272n8km2k08hzldynj992egs0waqnr8zjs',
      AddressType.ckb
    )
      .minPaymentAmount()
      .toString(),
    '61'
  );
});
