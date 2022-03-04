import test from 'ava';
import PWCore, { ChainID } from '../core';
import { Address, AddressType } from './address';
import { DummyCollector } from '../collectors/dummy-collector';
import { EosProvider } from '../providers';
import { DummyProvider } from '../providers/dummy-provider';
import { Script } from './script';
import { HashType } from '../interfaces';
import { NervosAddressVersion } from '..';

const eth = '0x32f4c2df50f678a94609e98f8ee7ffb14b6799bc';

const ckbAddress1StringFullPre2021 =
  'ckt1q3vvtay34wndv9nckl8hah6fzzcltcqwcrx79apwp2a5lkd07fdxxvh5ct04panc49rqn6v03mnllv2tv7vmc9kkmjq';
const ckbAddress1StringFull2021 =
  'ckt1qpvvtay34wndv9nckl8hah6fzzcltcqwcrx79apwp2a5lkd07fdxxqfj7npd758k0z55vz0f378w0la3fdnen0qj5grsu';

const eos = 'sking1234511';
const eosFull =
  'ckt1qpvvtay34wndv9nckl8hah6fzzcltcqwcrx79apwp2a5lkd07fdxxqt0tr9dejylkvtx3fs2wchvgahp6z2wzkcd3cuk8';
const tron = 'TNV2p8Zmy5JcZWbtn59Qee8jTdGmCRC6e8';
const tronFull =
  'ckt1qpvvtay34wndv9nckl8hah6fzzcltcqwcrx79apwp2a5lkd07fdxxqvfg4auqnw9z7ek5clnlasfa9dz3txesqq3pm97m';

const ckbAddress1FullPre2021 = new Address(
  ckbAddress1StringFullPre2021,
  AddressType.ckb
);
const ckbAddress1Full2021 = new Address(
  ckbAddress1StringFull2021,
  AddressType.ckb
);

const ckbAddress2StringShortPre2021 =
  'ckt1qyqxpayn272n8km2k08hzldynj992egs0waqnr8zjs';
const ckbAddress2StringFull2021 =
  'ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqtq7jf409fnmd4t8nm30kjfezj4v5g8hwskhal6m';
const ckbAddress2ShortPre2021 = new Address(
  ckbAddress2StringShortPre2021,
  AddressType.ckb
);

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
  await new PWCore('https://testnet.ckb.dev').init(
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

  t.is(ckbAddress2ShortPre2021.addressString, ckbAddress2StringShortPre2021);
  t.is(ckbAddress2ShortPre2021.addressType, AddressType.ckb);

  t.is(eosAddress.addressString, eos);
  t.is(eosAddress.addressType, AddressType.eos);

  t.is(tronAddress.addressString, tron);
  t.is(tronAddress.addressType, AddressType.tron);
});

test('addressString for AddressType.ckb by default returns address passed class in constructor', (t) => {
  t.is(ckbAddress1Full2021.addressString, ckbAddress1StringFull2021);
  t.is(ckbAddress1Full2021.addressType, AddressType.ckb);

  t.is(ckbAddress1FullPre2021.addressString, ckbAddress1StringFullPre2021);
  t.is(ckbAddress1FullPre2021.addressType, AddressType.ckb);

  t.is(ckbAddress2ShortPre2021.addressString, ckbAddress2StringShortPre2021);
  t.is(ckbAddress2ShortPre2021.addressType, AddressType.ckb);
});

test('"toCKBAddress" correctly transforms preckb2021 address to desired version', (t) => {
  t.is(ckbAddress1FullPre2021.toCKBAddress(), ckbAddress1StringFull2021);
  t.is(
    ckbAddress1FullPre2021.toCKBAddress(NervosAddressVersion.latest),
    ckbAddress1StringFull2021
  );
  t.is(
    ckbAddress1FullPre2021.toCKBAddress(NervosAddressVersion.ckb2021),
    ckbAddress1StringFull2021
  );
  t.is(
    ckbAddress1FullPre2021.toCKBAddress(NervosAddressVersion.pre2021),
    ckbAddress1StringFullPre2021
  );
});

test('"toCKBAddress" general test', (t) => {
  t.is(ethAddress.toCKBAddress(), ckbAddress1StringFull2021);
  t.is(ckbAddress1Full2021.toCKBAddress(), ckbAddress1StringFull2021);
  t.is(ckbAddress2ShortPre2021.toCKBAddress(), ckbAddress2StringFull2021);
  t.is(
    ckbAddress2ShortPre2021.toCKBAddress(NervosAddressVersion.pre2021),
    ckbAddress2StringShortPre2021
  );

  t.is(eosAddress.toCKBAddress(), eosFull);
  t.is(tronAddress.toCKBAddress(), tronFull);
});

// RFC: https://github.com/nervosnetwork/rfcs/pull/239
test('to ckb2021 mainnet address (Nervos RFC21)', async (t) => {
  PWCore.chainId = ChainID.ckb;

  t.is(
    Address.fromLockScript(
      new Script(
        '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        '0xb39bbc0b3673c7d36450bc14cfcdad2d559c6c64',
        HashType.type
      )
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

  t.deepEqual(ckbAddress2ShortPre2021.toLockScript().serializeJson(), {
    args: '0x60f493579533db6ab3cf717da49c8a5565107bba',
    code_hash: PWCore.config.defaultLock.script.codeHash,
    hash_type: PWCore.config.defaultLock.script.hashType,
  });

  t.deepEqual(ckbAddress1Full2021.toLockScript().serializeJson(), {
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
