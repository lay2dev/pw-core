import anyTest, { TestInterface } from 'ava';
import PWCore, { Address, AddressType, Amount, ChainID } from '..';
import { SimpleBuilder } from '.';
import { DummyCollector } from '../collectors/dummy-collector';
import { DummyProvider } from '../providers/dummy-provider';

const test = anyTest as TestInterface<{ builder: SimpleBuilder }>;

test.before(async (t) => {
  const address = new Address(
    'ckt1qyqxpayn272n8km2k08hzldynj992egs0waqnr8zjs',
    AddressType.ckb
  );
  const amount = new Amount('100');

  await new PWCore('https://aggron.ckb.dev').init(
    new DummyProvider(),
    new DummyCollector(),
    ChainID.ckb_testnet
  );

  t.context.builder = new SimpleBuilder(address, amount);
});

test('build a tx', async (t) => {
  const tx = await t.context.builder.build();
  t.notThrows(() => tx.validate());
});

test.todo('calc fee');
