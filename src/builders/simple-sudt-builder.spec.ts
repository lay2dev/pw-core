import anyTest, { TestInterface } from 'ava';
import PWCore, { Address, AddressType, Amount, ChainID } from '..';
import { DummyCollector } from '../collectors/dummy-collector';
import { SUDT } from '../models';
import { DummyProvider } from '../providers/dummy-provider';
import { SimpleSUDTBuilder } from './simple-sudt-builder';

const test = anyTest as TestInterface<{ builder: SimpleSUDTBuilder }>;

test.before(async (t) => {
  const address = new Address(
    'ckt1qyqv4yga3pgw2h92hcnur7lepdfzmvg8wj7qn44vz8',
    AddressType.ckb
  );
  const amount = new Amount('100');
  const sudt = new SUDT(
    '0xc369a6fc6f0f907e46de96f668d986b8e4b52ea832da213f864eda805d34c932'
  );

  await new PWCore('https://aggron.ckb.dev').init(
    new DummyProvider(),
    new DummyCollector(),
    ChainID.ckb_testnet
  );

  t.context.builder = new SimpleSUDTBuilder(sudt, address, amount);
});

test('build a tx', async (t) => {
  const tx = await t.context.builder.build();
  t.notThrows(() => tx.validate());
});

test.todo('calc fee');
