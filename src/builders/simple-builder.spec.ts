import test from 'ava';
import PWCore, { Address, AddressType, Amount, ChainID } from '..';
import { SimpleBuilder } from '.';
import { DummyCollector } from '../collectors';

const address = new Address(
  'ckt1qyqxpayn272n8km2k08hzldynj992egs0waqnr8zjs',
  AddressType.ckb
);
const amount = new Amount('100');

let builder: SimpleBuilder;

test.before(async () => {
  await new PWCore('https://aggron.ckb.dev').init(
    new DummyCollector(address),
    ChainID.ckb_testnet
  );
  builder = new SimpleBuilder(address, amount, null, PWCore.defaultCollector);
});

test('build a tx', async (t) => {
  const tx = await builder.build();
  t.notThrows(() => tx.validate());
});

test.todo('calc fee');
