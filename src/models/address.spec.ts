import test from 'ava';
import PWCore, { ChainID } from '../core';
import { Address, AddressType } from './address';
import { DummyCollector } from '../collectors/dummy-collector';
import { DummyProvider } from '../providers/dummy-provider';

const eth = '0x32f4c2df50f678a94609e98f8ee7ffb14b6799bc';
const ckb = 'ckt1qyqxpayn272n8km2k08hzldynj992egs0waqnr8zjs';
const ckbFull =
  'ckt1q3vvtay34wndv9nckl8hah6fzzcltcqwcrx79apwp2a5lkd07fdxxvh5ct04panc49rqn6v03mnllv2tv7vmc9kkmjq';

const ckbAddress = new Address(ckb, AddressType.ckb);
const ckbFullAddress = new Address(ckbFull, AddressType.ckb);
const ethAddress = new Address(eth, AddressType.eth);

test.before(async () => {
  await new PWCore('https://testnet.ckb.dev').init(
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
