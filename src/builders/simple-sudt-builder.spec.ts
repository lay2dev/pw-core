import anyTest, { TestInterface } from 'ava';
import PWCore, { Address, AddressType, Amount, ChainID } from '..';
import { DummyCollector } from '../collectors/dummy-collector';
import { SUDT } from '../models';
import { DummyProvider } from '../providers/dummy-provider';
import { SimpleSUDTACPBuilder } from './simple-sudt-acp-builder';

const test = anyTest as TestInterface<{ builder: SimpleSUDTACPBuilder }>;

test.before(async (t) => {
  const address = new Address(
    'ckt1qjr2r35c0f9vhcdgslx2fjwa9tylevr5qka7mfgmscd33wlhfykykn2zrv2y5rex4nnyfs2tqkde8zmayrls6d3kwa5',
    AddressType.ckb
  );
  const amount = new Amount('100');
  const sudt = new SUDT(
    '0xc369a6fc6f0f907e46de96f668d986b8e4b52ea832da213f864eda805d34c932'
  );

  await new PWCore('https://testnet.ckb.dev').init(
    new DummyProvider(),
    new DummyCollector(),
    ChainID.ckb_testnet
  );

  t.context.builder = new SimpleSUDTACPBuilder(sudt, address, amount);
});

test('build a tx', async (t) => {
  const tx = await t.context.builder.build();
  t.notThrows(() => tx.validate());
});

test.todo('calc fee');
