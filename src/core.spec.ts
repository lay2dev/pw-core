import anyTest, { TestInterface } from 'ava';
import PWCore, { Address, AddressType, Amount, ChainID } from '.';
import { PwCollector } from './collectors/pw-collector';
import { CHAIN_SPECS } from './constants';
import { DummyProvider } from './providers/dummy-provider';

const test = anyTest as TestInterface<{ pw: PWCore; address: Address }>;

test.before(async (t) => {
  const address = new Address(
    '0x26C5F390FF2033CbB44377361c63A3Dd2DE3121d',
    AddressType.eth
  );
  const pw = await new PWCore('https://lay2.ckb.dev').init(
    new DummyProvider(),
    new PwCollector('https://cellapi.ckb.pw'),
    ChainID.ckb_dev,
    CHAIN_SPECS.Lay2
  );
  t.context = { pw, address };
});

test.skip('send simple tx', async (t) => {
  // test.serial('send simple tx', async (t) => {
  const { pw, address } = t.context;
  const amount61 = new Amount('61');
  const txHash = await pw.send(address, amount61);
  t.pass('tx sent: ' + txHash);
});

test.serial('chain specs auto select', async (t) => {
  await new PWCore('https://mainnet.ckb.dev').init(
    new DummyProvider(),
    new PwCollector('https://cellapi.ckb.pw')
  );
  t.is(PWCore.chainId, ChainID.ckb);

  await new PWCore('https://testnet.ckb.dev').init(
    new DummyProvider(),
    new PwCollector('https://cellapi.ckb.pw')
  );
  t.is(PWCore.chainId, ChainID.ckb_testnet);
});
