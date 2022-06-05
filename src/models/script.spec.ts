import anyTest, { TestInterface } from 'ava';
import PWCore, { ChainID } from '../core';
import { Address, AddressType, Script } from '.';
import { validators } from 'ckb-js-toolkit';
import { DummyProvider } from '../providers/dummy-provider';
import { DummyCollector } from '../collectors/dummy-collector';

const test = anyTest as TestInterface<{
  lockScript: Script;
  ethLockScript: Script;
}>;
const address = new Address(
  'ckt1qyqxpayn272n8km2k08hzldynj992egs0waqnr8zjs',
  AddressType.ckb
);

const ethAddress = new Address(
  '0x26C5F390FF2033CbB44377361c63A3Dd2DE3121d',
  AddressType.eth
);

test.before(async (t) => {
  await new PWCore('https://testnet.ckb.dev').init(
    new DummyProvider(),
    new DummyCollector(),
    ChainID.ckb_testnet
  );

  t.context.lockScript = new Script(
    PWCore.config.defaultLock.script.codeHash,
    '0x60f493579533db6ab3cf717da49c8a5565107bba',
    PWCore.config.defaultLock.script.hashType
  );

  t.context.ethLockScript = new Script(
    PWCore.config.pwLock.script.codeHash,
    '0x26C5F390FF2033CbB44377361c63A3Dd2DE3121d',
    PWCore.config.pwLock.script.hashType
  );
});

test('validate', (t) => {
  t.notThrows(() =>
    validators.ValidateScript(t.context.lockScript.serializeJson())
  );
});

test('sameWith', (t) => {
  t.true(
    t.context.lockScript.sameWith(t.context.lockScript),
    'the t.context.two lock scripts are the same'
  );
});

test('toAddress', (t) => {
  t.is(t.context.lockScript.toAddress().toCKBAddress(), address.toCKBAddress());
  t.is(
    t.context.ethLockScript.toAddress().toCKBAddress(),
    ethAddress.toCKBAddress()
  );
});

test.todo('toHash');
