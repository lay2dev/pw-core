import test from 'ava';
import PWCore, { ChainID } from '../core';
import { Address, AddressType, LockType } from './address';
import { DummyCollector } from '../collectors/dummy-collector';
import { DummyProvider } from '../providers/dummy-provider';
import { EosProvider } from '../providers';
import { Script } from './script';
import { HashType } from '../interfaces';
import { NervosAddressVersion } from '..';

// This is a standard CKB address using the default lock.
const ckbAddressStringShortPre2021 =
  'ckt1qyqxpayn272n8km2k08hzldynj992egs0waqnr8zjs';
const ckbAddressShortPre2021 = new Address(
  ckbAddressStringShortPre2021,
  AddressType.ckb
);
const ckbAddressStringFull2021 =
  'ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqtq7jf409fnmd4t8nm30kjfezj4v5g8hwskhal6m';

// Interoperability Addresses: ETH
const ethChainAddress = '0x32f4c2df50f678a94609e98f8ee7ffb14b6799bc';
const ethAddress = new Address(ethChainAddress, AddressType.eth);
const ethAddressOmni = new Address(
  ethChainAddress,
  AddressType.eth,
  null,
  LockType.omni
);
const ethAddressPw = new Address(
  ethChainAddress,
  AddressType.eth,
  null,
  LockType.pw
);
const ethAddressStringPre2021Pw =
  'ckt1q3vvtay34wndv9nckl8hah6fzzcltcqwcrx79apwp2a5lkd07fdxxvh5ct04panc49rqn6v03mnllv2tv7vmc9kkmjq';
const ethAddressString2021Pw =
  'ckt1qpvvtay34wndv9nckl8hah6fzzcltcqwcrx79apwp2a5lkd07fdxxqfj7npd758k0z55vz0f378w0la3fdnen0qj5grsu';
const ethAddressStringPre2021Omni =
  'ckt1q3uljza4azfdsrwjzdpea6442yfqadqhv7yzfu5zknlmtusm45hpuqfj7npd758k0z55vz0f378w0la3fdnen0qqheqlhl';
const ethAddressString2021Omni =
  'ckt1qpuljza4azfdsrwjzdpea6442yfqadqhv7yzfu5zknlmtusm45hpuqgpxt6v9h6s7eu2j3sfax8caellk99k0xduqq0pcwmd';

// Interoperability Addresses: EOS
const eosChainAddress = 'sking1234511'; // Base lockArg: 0x6f58cadcc89fb31668a60a762ec476e1d094e15b
let eosProvider; // Populated in test.before().
let eosAddressPw; // Populated in test.before().
let eosAddressOmni; // Populated in test.before().
const eosAddressStringPre2021Pw =
  'ckt1q3vvtay34wndv9nckl8hah6fzzcltcqwcrx79apwp2a5lkd07fdxxm6cetwv38anze52vznk9mz8dcwsjns4kdxuu6a';
const eosAddressString2021Pw =
  'ckt1qpvvtay34wndv9nckl8hah6fzzcltcqwcrx79apwp2a5lkd07fdxxqt0tr9dejylkvtx3fs2wchvgahp6z2wzkcd3cuk8';
const eosAddressStringPre2021Omni =
  'ckt1q3uljza4azfdsrwjzdpea6442yfqadqhv7yzfu5zknlmtusm45hpuqn0tr9dejylkvtx3fs2wchvgahp6z2wzkcq9j4s0d';
const eosAddressString2021Omni =
  'ckt1qpuljza4azfdsrwjzdpea6442yfqadqhv7yzfu5zknlmtusm45hpuqgzdavv4hxgn7e3v69xpfmza3rku8gffc2mqqx393a7';

// Interoperability Addresses: TRON
const tronChainAddress = 'TNV2p8Zmy5JcZWbtn59Qee8jTdGmCRC6e8'; // Base lockArg: 0x89457bc04dc517b36a63f3ff609e95a28acd9800
const tronAddress = new Address(tronChainAddress, AddressType.tron);
const tronAddressOmni = new Address(
  tronChainAddress,
  AddressType.tron,
  null,
  LockType.omni
);
const tronAddressPw = new Address(
  tronChainAddress,
  AddressType.tron,
  null,
  LockType.pw
);
const tronAddressStringPre2021Pw =
  'ckt1q3vvtay34wndv9nckl8hah6fzzcltcqwcrx79apwp2a5lkd07fdx8z2900qym3ghkd4x8ullvz0ftg52ekvqqtyehuu';
const tronAddressString2021Pw =
  'ckt1qpvvtay34wndv9nckl8hah6fzzcltcqwcrx79apwp2a5lkd07fdxxqvfg4auqnw9z7ek5clnlasfa9dz3txesqq3pm97m';
const tronAddressStringPre2021Omni =
  'ckt1q3uljza4azfdsrwjzdpea6442yfqadqhv7yzfu5zknlmtusm45hpuqufg4auqnw9z7ek5clnlasfa9dz3txesqqq6rdksf';
const tronAddressString2021Omni =
  'ckt1qpuljza4azfdsrwjzdpea6442yfqadqhv7yzfu5zknlmtusm45hpuqgr39zhhszdc5tmx6nr70lkp854529vmxqqqq79jmm4';

test.before(async () => {
  // Init PWCore
  await new PWCore('https://testnet.ckb.dev').init(
    new DummyProvider(),
    new DummyCollector(),
    ChainID.ckb_testnet
  );

  // Lookup EOS lockArgs.
  const eosNetwork = {
    blockchain: 'eos',
    chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
    host: 'mainnet.eosamsterdam.net',
    port: 80,
    protocol: 'http',
  };
  eosProvider = new EosProvider(eosNetwork);
  const lockArgsPw = await eosProvider.getCKBLockArgsForEosAccount(
    eosChainAddress
  );
  const lockArgsOmni = `0x02${lockArgsPw.replace('0x', '')}00`;
  eosAddressPw = new Address(eosChainAddress, AddressType.eos, lockArgsPw);
  eosAddressOmni = new Address(eosChainAddress, AddressType.eos, lockArgsOmni);
});

test('get lock args for eos', async (t) => {
  const lockArgs = await eosProvider.getCKBLockArgsForEosAccount(
    eosChainAddress
  );
  t.is(lockArgs, '0x6f58cadcc89fb31668a60a762ec476e1d094e15b');
});

test('addressString and addressType returns values passed class in constructor', (t) => {
  t.is(ckbAddressShortPre2021.addressString, ckbAddressStringShortPre2021);
  t.is(ckbAddressShortPre2021.addressType, AddressType.ckb);

  t.is(ethAddress.addressString, ethChainAddress);
  t.is(ethAddress.addressType, AddressType.eth);

  t.is(eosAddressPw.addressString, eosChainAddress);
  t.is(eosAddressPw.addressType, AddressType.eos);
  t.is(eosAddressOmni.addressString, eosChainAddress);
  t.is(eosAddressOmni.addressType, AddressType.eos);

  t.is(tronAddress.addressString, tronChainAddress);
  t.is(tronAddress.addressType, AddressType.tron);
});

test('toCKBAddress() general test', (t) => {
  t.is(ckbAddressShortPre2021.toCKBAddress(), ckbAddressStringFull2021);
  t.is(ethAddress.toCKBAddress(), ethAddressString2021Omni);
  t.is(eosAddressOmni.toCKBAddress(), eosAddressString2021Omni);
  t.is(tronAddress.toCKBAddress(), tronAddressString2021Omni);
});

test('toCKBAddress() correctly transforms preckb2021 address to desired version', (t) => {
  t.is(
    ckbAddressShortPre2021.toCKBAddress(NervosAddressVersion.latest),
    ckbAddressStringFull2021
  );
  t.is(
    ckbAddressShortPre2021.toCKBAddress(NervosAddressVersion.ckb2021),
    ckbAddressStringFull2021
  );
  t.is(
    ckbAddressShortPre2021.toCKBAddress(NervosAddressVersion.pre2021),
    ckbAddressStringShortPre2021
  );

  t.is(
    ethAddress.toCKBAddress(NervosAddressVersion.latest),
    ethAddressString2021Omni
  );
  t.is(
    ethAddress.toCKBAddress(NervosAddressVersion.ckb2021),
    ethAddressString2021Omni
  );
  t.is(
    ethAddress.toCKBAddress(NervosAddressVersion.pre2021),
    ethAddressStringPre2021Omni
  );

  t.is(
    eosAddressOmni.toCKBAddress(NervosAddressVersion.latest),
    eosAddressString2021Omni
  );
  t.is(
    eosAddressOmni.toCKBAddress(NervosAddressVersion.ckb2021),
    eosAddressString2021Omni
  );
  t.is(
    eosAddressOmni.toCKBAddress(NervosAddressVersion.pre2021),
    eosAddressStringPre2021Omni
  );

  t.is(
    tronAddress.toCKBAddress(NervosAddressVersion.latest),
    tronAddressString2021Omni
  );
  t.is(
    tronAddress.toCKBAddress(NervosAddressVersion.ckb2021),
    tronAddressString2021Omni
  );
  t.is(
    tronAddress.toCKBAddress(NervosAddressVersion.pre2021),
    tronAddressStringPre2021Omni
  );
});

test('toCKBAddress() correctly outputs interoperability addresses when NervosAddressVersion and LockType are specified', (t) => {
  t.is(
    ethAddress.toCKBAddress(NervosAddressVersion.latest, LockType.pw),
    ethAddressString2021Pw
  );
  t.is(
    ethAddress.toCKBAddress(NervosAddressVersion.ckb2021, LockType.pw),
    ethAddressString2021Pw
  );
  t.is(
    ethAddress.toCKBAddress(NervosAddressVersion.pre2021, LockType.pw),
    ethAddressStringPre2021Pw
  );
  t.is(
    ethAddress.toCKBAddress(NervosAddressVersion.latest, LockType.omni),
    ethAddressString2021Omni
  );
  t.is(
    ethAddress.toCKBAddress(NervosAddressVersion.ckb2021, LockType.omni),
    ethAddressString2021Omni
  );
  t.is(
    ethAddress.toCKBAddress(NervosAddressVersion.pre2021, LockType.omni),
    ethAddressStringPre2021Omni
  );

  t.is(
    eosAddressPw.toCKBAddress(NervosAddressVersion.latest, LockType.pw),
    eosAddressString2021Pw
  );
  t.is(
    eosAddressPw.toCKBAddress(NervosAddressVersion.ckb2021, LockType.pw),
    eosAddressString2021Pw
  );
  t.is(
    eosAddressPw.toCKBAddress(NervosAddressVersion.pre2021, LockType.pw),
    eosAddressStringPre2021Pw
  );
  t.is(
    eosAddressOmni.toCKBAddress(NervosAddressVersion.latest, LockType.omni),
    eosAddressString2021Omni
  );
  t.is(
    eosAddressOmni.toCKBAddress(NervosAddressVersion.ckb2021, LockType.omni),
    eosAddressString2021Omni
  );
  t.is(
    eosAddressOmni.toCKBAddress(NervosAddressVersion.pre2021, LockType.omni),
    eosAddressStringPre2021Omni
  );

  t.is(
    tronAddress.toCKBAddress(NervosAddressVersion.latest, LockType.pw),
    tronAddressString2021Pw
  );
  t.is(
    tronAddress.toCKBAddress(NervosAddressVersion.ckb2021, LockType.pw),
    tronAddressString2021Pw
  );
  t.is(
    tronAddress.toCKBAddress(NervosAddressVersion.pre2021, LockType.pw),
    tronAddressStringPre2021Pw
  );
  t.is(
    tronAddress.toCKBAddress(NervosAddressVersion.latest, LockType.omni),
    tronAddressString2021Omni
  );
  t.is(
    tronAddress.toCKBAddress(NervosAddressVersion.ckb2021, LockType.omni),
    tronAddressString2021Omni
  );
  t.is(
    tronAddress.toCKBAddress(NervosAddressVersion.pre2021, LockType.omni),
    tronAddressStringPre2021Omni
  );
});

test('toCKBAddress() correctly outputs interoperability addresses when LockType was specified in the Address() contructor.', (t) => {
  t.is(ethAddressOmni.toCKBAddress(), ethAddressString2021Omni);
  t.is(
    ethAddressOmni.toCKBAddress(null, LockType.omni),
    ethAddressString2021Omni
  );
  t.is(ethAddressOmni.toCKBAddress(null, LockType.pw), ethAddressString2021Pw);
  t.is(ethAddressPw.toCKBAddress(), ethAddressString2021Pw);
  t.is(
    ethAddressPw.toCKBAddress(null, LockType.omni),
    ethAddressString2021Omni
  );
  t.is(ethAddressPw.toCKBAddress(null, LockType.pw), ethAddressString2021Pw);

  t.is(tronAddressOmni.toCKBAddress(), tronAddressString2021Omni);
  t.is(
    tronAddressOmni.toCKBAddress(null, LockType.omni),
    tronAddressString2021Omni
  );
  t.is(
    tronAddressOmni.toCKBAddress(null, LockType.pw),
    tronAddressString2021Pw
  );
  t.is(tronAddressPw.toCKBAddress(), tronAddressString2021Pw);
  t.is(
    tronAddressPw.toCKBAddress(null, LockType.omni),
    tronAddressString2021Omni
  );
  t.is(tronAddressPw.toCKBAddress(null, LockType.pw), tronAddressString2021Pw);
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

test('toLockScript() general test', (t) => {
  t.deepEqual(ckbAddressShortPre2021.toLockScript().serializeJson(), {
    args: '0x60f493579533db6ab3cf717da49c8a5565107bba',
    code_hash: PWCore.config.defaultLock.script.codeHash,
    hash_type: PWCore.config.defaultLock.script.hashType,
  });

  t.deepEqual(ethAddress.toLockScript().serializeJson(), {
    args: '0x0132f4c2df50f678a94609e98f8ee7ffb14b6799bc00',
    code_hash: PWCore.config.omniLock.script.codeHash,
    hash_type: PWCore.config.omniLock.script.hashType,
  });

  t.deepEqual(eosAddressOmni.toLockScript().serializeJson(), {
    args: '0x026f58cadcc89fb31668a60a762ec476e1d094e15b00',
    code_hash: PWCore.config.omniLock.script.codeHash,
    hash_type: PWCore.config.omniLock.script.hashType,
  });

  t.deepEqual(tronAddress.toLockScript().serializeJson(), {
    args: '0x0389457bc04dc517b36a63f3ff609e95a28acd980000',
    code_hash: PWCore.config.omniLock.script.codeHash,
    hash_type: PWCore.config.omniLock.script.hashType,
  });
});

test('toLockScript() correctly outputs lock scripts when LockType is specified', (t) => {
  t.deepEqual(ethAddress.toLockScript(LockType.omni).serializeJson(), {
    args: '0x0132f4c2df50f678a94609e98f8ee7ffb14b6799bc00',
    code_hash: PWCore.config.omniLock.script.codeHash,
    hash_type: PWCore.config.omniLock.script.hashType,
  });

  t.deepEqual(ethAddress.toLockScript(LockType.pw).serializeJson(), {
    args: '0x32f4c2df50f678a94609e98f8ee7ffb14b6799bc',
    code_hash: PWCore.config.pwLock.script.codeHash,
    hash_type: PWCore.config.pwLock.script.hashType,
  });

  t.deepEqual(eosAddressOmni.toLockScript(LockType.omni).serializeJson(), {
    args: '0x026f58cadcc89fb31668a60a762ec476e1d094e15b00',
    code_hash: PWCore.config.omniLock.script.codeHash,
    hash_type: PWCore.config.omniLock.script.hashType,
  });

  t.deepEqual(eosAddressPw.toLockScript(LockType.pw).serializeJson(), {
    args: '0x6f58cadcc89fb31668a60a762ec476e1d094e15b',
    code_hash: PWCore.config.pwLock.script.codeHash,
    hash_type: PWCore.config.pwLock.script.hashType,
  });

  t.deepEqual(tronAddress.toLockScript(LockType.omni).serializeJson(), {
    args: '0x0389457bc04dc517b36a63f3ff609e95a28acd980000',
    code_hash: PWCore.config.omniLock.script.codeHash,
    hash_type: PWCore.config.omniLock.script.hashType,
  });

  t.deepEqual(tronAddress.toLockScript(LockType.pw).serializeJson(), {
    args: '0x89457bc04dc517b36a63f3ff609e95a28acd9800',
    code_hash: PWCore.config.pwLock.script.codeHash,
    hash_type: PWCore.config.pwLock.script.hashType,
  });
});

test('toLockScript() correctly outputs lock scripts when LockType is specified in the constructor', (t) => {
  t.deepEqual(ethAddressOmni.toLockScript().serializeJson(), {
    args: '0x0132f4c2df50f678a94609e98f8ee7ffb14b6799bc00',
    code_hash: PWCore.config.omniLock.script.codeHash,
    hash_type: PWCore.config.omniLock.script.hashType,
  });

  t.deepEqual(ethAddressOmni.toLockScript(LockType.omni).serializeJson(), {
    args: '0x0132f4c2df50f678a94609e98f8ee7ffb14b6799bc00',
    code_hash: PWCore.config.omniLock.script.codeHash,
    hash_type: PWCore.config.omniLock.script.hashType,
  });

  t.deepEqual(ethAddressOmni.toLockScript(LockType.pw).serializeJson(), {
    args: '0x32f4c2df50f678a94609e98f8ee7ffb14b6799bc',
    code_hash: PWCore.config.pwLock.script.codeHash,
    hash_type: PWCore.config.pwLock.script.hashType,
  });

  t.deepEqual(ethAddressPw.toLockScript().serializeJson(), {
    args: '0x32f4c2df50f678a94609e98f8ee7ffb14b6799bc',
    code_hash: PWCore.config.pwLock.script.codeHash,
    hash_type: PWCore.config.pwLock.script.hashType,
  });

  t.deepEqual(ethAddressPw.toLockScript(LockType.omni).serializeJson(), {
    args: '0x0132f4c2df50f678a94609e98f8ee7ffb14b6799bc00',
    code_hash: PWCore.config.omniLock.script.codeHash,
    hash_type: PWCore.config.omniLock.script.hashType,
  });

  t.deepEqual(ethAddressPw.toLockScript(LockType.pw).serializeJson(), {
    args: '0x32f4c2df50f678a94609e98f8ee7ffb14b6799bc',
    code_hash: PWCore.config.pwLock.script.codeHash,
    hash_type: PWCore.config.pwLock.script.hashType,
  });

  t.deepEqual(tronAddressOmni.toLockScript().serializeJson(), {
    args: '0x0389457bc04dc517b36a63f3ff609e95a28acd980000',
    code_hash: PWCore.config.omniLock.script.codeHash,
    hash_type: PWCore.config.omniLock.script.hashType,
  });

  t.deepEqual(tronAddressOmni.toLockScript(LockType.omni).serializeJson(), {
    args: '0x0389457bc04dc517b36a63f3ff609e95a28acd980000',
    code_hash: PWCore.config.omniLock.script.codeHash,
    hash_type: PWCore.config.omniLock.script.hashType,
  });

  t.deepEqual(tronAddressOmni.toLockScript(LockType.pw).serializeJson(), {
    args: '0x89457bc04dc517b36a63f3ff609e95a28acd9800',
    code_hash: PWCore.config.pwLock.script.codeHash,
    hash_type: PWCore.config.pwLock.script.hashType,
  });

  t.deepEqual(tronAddressPw.toLockScript().serializeJson(), {
    args: '0x89457bc04dc517b36a63f3ff609e95a28acd9800',
    code_hash: PWCore.config.pwLock.script.codeHash,
    hash_type: PWCore.config.pwLock.script.hashType,
  });

  t.deepEqual(tronAddressPw.toLockScript(LockType.omni).serializeJson(), {
    args: '0x0389457bc04dc517b36a63f3ff609e95a28acd980000',
    code_hash: PWCore.config.omniLock.script.codeHash,
    hash_type: PWCore.config.omniLock.script.hashType,
  });

  t.deepEqual(tronAddressPw.toLockScript(LockType.pw).serializeJson(), {
    args: '0x89457bc04dc517b36a63f3ff609e95a28acd9800',
    code_hash: PWCore.config.pwLock.script.codeHash,
    hash_type: PWCore.config.pwLock.script.hashType,
  });
});

test('is acp address', (t) => {
  let address;

  // CKB short address (pre2021) using the default lock.
  address = 'ckt1qyqxpayn272n8km2k08hzldynj992egs0waqnr8zjs';
  t.false(new Address(address, AddressType.ckb).isAcp());

  // CKB full address (pre2021) using the default lock.
  address =
    'ckt1qjda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsc85jdte2v7md2eu7uta5jwg54t9zpam5y9ptgq';
  t.false(new Address(address, AddressType.ckb).isAcp());

  // CKB full address (ckb2021) using the default lock.
  address =
    'ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqtq7jf409fnmd4t8nm30kjfezj4v5g8hwskhal6m';
  t.false(new Address(address, AddressType.ckb).isAcp());

  // CKB full address (pre2021) using the ACP lock.
  address =
    'ckt1qjr2r35c0f9vhcdgslx2fjwa9tylevr5qka7mfgmscd33wlhfykykn2zrv2y5rex4nnyfs2tqkde8zmayrls6d3kwa5';
  t.true(new Address(address, AddressType.ckb).isAcp());

  // CKB full address (ckb2021) using the ACP lock.
  address =
    'ckt1qzr2r35c0f9vhcdgslx2fjwa9tylevr5qka7mfgmscd33wlhfykykq2dggd3gjs0y6kwv3xpfvzehyut05s07rgk2r806';
  t.true(new Address(address, AddressType.ckb).isAcp());

  // CKB full address (pre2021) using an unknown lock and extra args.
  address =
    'ckt1q35y83078t9h7nwzyvpe9qfuh8qjm08d2ktlegc22tcn4fgem6xnxwlwq4vae7nqgpkl6s59znsqmh9jkrtjhwct56efh7uep9y2xr04d4augtnmauya4s2cdvn0s6nxw9m6k7ndhf2l0un2g0tr7f88fegqns00nq';
  t.false(new Address(address, AddressType.ckb).isAcp());

  // CKB full address (ckb2021) using an unknown lock and extra args.
  address =
    'ckt1qp5y83078t9h7nwzyvpe9qfuh8qjm08d2ktlegc22tcn4fgem6xnxqfmacz4nh86vpqxml2zs52wqrwuk2cdw2ampwnt9xlmnyy53gcd74khh3pw00hsnkkptp4jd7r2vech02m6dka9taljdfpav0eyua89q9px9au';
  t.false(new Address(address, AddressType.ckb).isAcp());

  // CKB full address (pre2021) using PW-Lock (ETH).
  address = ethAddressStringPre2021Pw;
  t.true(new Address(address, AddressType.ckb).isAcp());

  // CKB full address (ckb2021) using PW-Lock (ETH).
  address = ethAddressString2021Pw;
  t.true(new Address(address, AddressType.ckb).isAcp());

  // CKB full address (pre2021) using OmniLock (ETH).
  address = ethAddressStringPre2021Omni;
  t.true(new Address(address, AddressType.ckb).isAcp());

  // CKB full address (ckb2021) using OmniLock (ETH).
  address = ethAddressString2021Omni;
  t.true(new Address(address, AddressType.ckb).isAcp());

  // CKB full address (pre2021) using PW-Lock (EOS).
  address = eosAddressStringPre2021Pw;
  t.true(new Address(address, AddressType.ckb).isAcp());

  // CKB full address (ckb2021) using PW-Lock (EOS).
  address = eosAddressString2021Pw;
  t.true(new Address(address, AddressType.ckb).isAcp());

  // CKB full address (pre2021) using OmniLock (EOS).
  address = eosAddressStringPre2021Omni;
  t.true(new Address(address, AddressType.ckb).isAcp());

  // CKB full address (ckb2021) using OmniLock (EOS).
  address = eosAddressString2021Omni;
  t.true(new Address(address, AddressType.ckb).isAcp());

  // CKB full address (pre2021) using PW-Lock (TRON).
  address = tronAddressStringPre2021Pw;
  t.true(new Address(address, AddressType.ckb).isAcp());

  // CKB full address (ckb2021) using PW-Lock (TRON).
  address = tronAddressString2021Pw;
  t.true(new Address(address, AddressType.ckb).isAcp());

  // CKB full address (pre2021) using OmniLock (TRON).
  address = tronAddressStringPre2021Omni;
  t.true(new Address(address, AddressType.ckb).isAcp());

  // CKB full address (ckb2021) using OmniLock (TRON).
  address = tronAddressString2021Omni;
  t.true(new Address(address, AddressType.ckb).isAcp());

  // ETH Address object.
  t.true(ethAddress.isAcp());

  // EOS Address object.
  t.true(eosAddressPw.isAcp()); // Note: toLockScript(), which is used internally by isAcp(), will use OmniLock.
  t.true(eosAddressOmni.isAcp());

  // TRON Address object.
  t.true(tronAddress.isAcp());
});

test('minimal pay amount', (t) => {
  let address;

  // CKB short address (pre2021) using the default lock.
  address = 'ckt1qyqxpayn272n8km2k08hzldynj992egs0waqnr8zjs';
  t.is(
    new Address(address, AddressType.ckb).minPaymentAmount().toString(),
    '61'
  );

  // CKB full address (pre2021) using the default lock.
  address =
    'ckt1qjda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsc85jdte2v7md2eu7uta5jwg54t9zpam5y9ptgq';
  t.is(
    new Address(address, AddressType.ckb).minPaymentAmount().toString(),
    '61'
  );

  // CKB full address (ckb2021) using the default lock.
  address =
    'ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqtq7jf409fnmd4t8nm30kjfezj4v5g8hwskhal6m';
  t.is(
    new Address(address, AddressType.ckb).minPaymentAmount().toString(),
    '61'
  );

  // CKB full address (pre2021) using an unknown lock and extra args.
  address =
    'ckt1q35y83078t9h7nwzyvpe9qfuh8qjm08d2ktlegc22tcn4fgem6xnxwlwq4vae7nqgpkl6s59znsqmh9jkrtjhwct56efh7uep9y2xr04d4augtnmauya4s2cdvn0s6nxw9m6k7ndhf2l0un2g0tr7f88fegqns00nq';
  t.is(
    new Address(address, AddressType.ckb).minPaymentAmount().toString(),
    '105'
  );

  // CKB full address (ckb2021) using an unknown lock and extra args.
  address =
    'ckt1qp5y83078t9h7nwzyvpe9qfuh8qjm08d2ktlegc22tcn4fgem6xnxqfmacz4nh86vpqxml2zs52wqrwuk2cdw2ampwnt9xlmnyy53gcd74khh3pw00hsnkkptp4jd7r2vech02m6dka9taljdfpav0eyua89q9px9au';
  t.is(
    new Address(address, AddressType.ckb).minPaymentAmount().toString(),
    '105'
  );

  // CKB full address (pre2021) using the ACP lock.
  address =
    'ckt1qjr2r35c0f9vhcdgslx2fjwa9tylevr5qka7mfgmscd33wlhfykykn2zrv2y5rex4nnyfs2tqkde8zmayrls6d3kwa5';
  t.is(
    new Address(address, AddressType.ckb).minPaymentAmount().toString(),
    '0.00000001'
  );

  // CKB full address (ckb2021) using the ACP lock.
  address =
    'ckt1qzr2r35c0f9vhcdgslx2fjwa9tylevr5qka7mfgmscd33wlhfykykq2dggd3gjs0y6kwv3xpfvzehyut05s07rgk2r806';
  t.is(
    new Address(address, AddressType.ckb).minPaymentAmount().toString(),
    '0.00000001'
  );

  // CKB full address (pre2021) using the ACP lock (allowAcp = false).
  address =
    'ckt1qjr2r35c0f9vhcdgslx2fjwa9tylevr5qka7mfgmscd33wlhfykykn2zrv2y5rex4nnyfs2tqkde8zmayrls6d3kwa5';
  t.is(
    new Address(address, AddressType.ckb).minPaymentAmount(false).toString(),
    '61'
  );

  // CKB full address (ckb2021) using the ACP lock (allowAcp = false).
  address =
    'ckt1qzr2r35c0f9vhcdgslx2fjwa9tylevr5qka7mfgmscd33wlhfykykq2dggd3gjs0y6kwv3xpfvzehyut05s07rgk2r806';
  t.is(
    new Address(address, AddressType.ckb).minPaymentAmount(false).toString(),
    '61'
  );

  // CKB full address (pre2021) using PW-Lock.
  address = ethAddressStringPre2021Pw;
  t.is(
    new Address(address, AddressType.ckb).minPaymentAmount().toString(),
    '0.00000001'
  );

  // CKB full address (ckb2021) using PW-Lock.
  address = ethAddressString2021Pw;
  t.is(
    new Address(address, AddressType.ckb).minPaymentAmount().toString(),
    '0.00000001'
  );

  // CKB full address (pre2021) using PW-Lock (allowAcp = false).
  address = ethAddressStringPre2021Pw;
  t.is(
    new Address(address, AddressType.ckb).minPaymentAmount(false).toString(),
    '61'
  );

  // CKB full address (ckb2021) using PW-Lock (allowAcp = false).
  address = ethAddressString2021Pw;
  t.is(
    new Address(address, AddressType.ckb).minPaymentAmount(false).toString(),
    '61'
  );

  // CKB full address (pre2021) using OmniLock.
  address = ethAddressStringPre2021Omni;
  t.is(
    new Address(address, AddressType.ckb).minPaymentAmount().toString(),
    '0.00000001'
  );

  // CKB full address (ckb2021) using OmniLock.
  address = ethAddressString2021Omni;
  t.is(
    new Address(address, AddressType.ckb).minPaymentAmount().toString(),
    '0.00000001'
  );

  // CKB full address (pre2021) using OmniLock (allowAcp = false).
  address = ethAddressStringPre2021Omni;
  t.is(
    new Address(address, AddressType.ckb).minPaymentAmount(false).toString(),
    '63'
  );

  // CKB full address (ckb2021) using OmniLock (allowAcp = false).
  address = ethAddressString2021Omni;
  t.is(
    new Address(address, AddressType.ckb).minPaymentAmount(false).toString(),
    '63'
  );
});
