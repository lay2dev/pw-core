import anyTest, { TestInterface } from 'ava';
import PWCore, { Address, AddressType, Amount, ChainID } from '..';
import { SimpleBuilder } from '.';
import { DummyCollector } from '../collectors/dummy-collector';
import { DummyProvider } from '../providers/dummy-provider';
import { Platform } from '../providers';

const test = anyTest as TestInterface<{ builder: SimpleBuilder }>;

test.before(async (t) => {
  const address = new Address(
    'ckt1qyqxpayn272n8km2k08hzldynj992egs0waqnr8zjs',
    AddressType.ckb
  );
  const amount = new Amount('100');

  await new PWCore('https://aggron.ckb.dev').init(
    new DummyProvider(Platform.eth),
    new DummyCollector(address),
    ChainID.ckb_testnet
  );

  const builder = new SimpleBuilder(
    address,
    amount,
    null,
    PWCore.defaultCollector
  );
  t.context = { builder };
});

test('build a tx', async (t) => {
  const tx = await t.context.builder.build();
  t.notThrows(() => tx.validate());
});

test.todo('calc fee');
