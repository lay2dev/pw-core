import anyTest, { TestInterface } from 'ava';
import PWCore, { ChainID } from '../core';
import { Address, AddressType, Script } from '.';
import { validators } from '../ckb-js-toolkit';
import { DummyProvider } from '../providers/dummy-provider';
import { DummyCollector } from '../collectors/dummy-collector';

const test = anyTest as TestInterface<{
  lockScript: Script;
  ethLockScript: Script;
}>;
const address = new Address(
  'ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqtq7jf409fnmd4t8nm30kjfezj4v5g8hwskhal6m',
  AddressType.ckb
);
const defaultLockscriptHash =
  '0xece2a204369183d34393c4cbffbe872ddb6666066667c7955234ce37f94288b7';

const ethAddress = new Address(
  '0x26C5F390FF2033CbB44377361c63A3Dd2DE3121d',
  AddressType.eth
);
const ethLockscriptHash =
  '0x0ed227f99c630514b8f3147012377f59b0dd6b9a29a2dbae137870aefa98f1bc';

test.before(async (t) => {
  await new PWCore('https://aggron.ckb.dev').init(
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

test('toHash', (t) => {
  t.is(t.context.lockScript.toHash(), defaultLockscriptHash);
  t.is(t.context.ethLockScript.toHash(), ethLockscriptHash);
});
