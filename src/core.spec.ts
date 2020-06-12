import anyTest, { TestInterface } from 'ava';
import PWCore, { Address, AddressType, Amount, ChainID } from '.';
import { PwCollector } from './collectors/pw-collector';
import { CHAIN_SPECS } from './constants';

const test = anyTest as TestInterface<{ pw: PWCore; address: Address }>;

test.before(async (t) => {
  const address = new Address(
    '0x26C5F390FF2033CbB44377361c63A3Dd2DE3121d',
    AddressType.eth
  );
  const pw = new PWCore('https://lay2.ckb.dev');
  await pw.init(new PwCollector(address), ChainID.ckb_dev, CHAIN_SPECS.Lay2);
  t.context = { pw, address };
});

test.skip('send simple tx', async (t) => {
  const { pw, address } = t.context;
  const amount100 = new Amount('100');
  const txHash = await pw.send(address, amount100);
  t.pass('tx sent: ' + txHash);
});
