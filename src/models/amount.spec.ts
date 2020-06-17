import test from 'ava';
import PWCore, { ChainID } from '../core';
import { DummyCollector } from '../collectors/dummy-collector';
import { Amount, AmountUnit } from '.';
import { DummyProvider } from '../providers/dummy-provider';

test.before(async () => {
  await new PWCore('https://aggron.ckb.dev').init(
    new DummyProvider(),
    new DummyCollector(),
    ChainID.ckb_testnet
  );
});

const K = '1000';
const M = '1000000';
const B = '1000000000';
const T = '1000000000000';
const F = '1002003400500';

const ckb1 = new Amount('1', AmountUnit.ckb);
const ckb10000 = new Amount(K + '0', AmountUnit.ckb);

const shannon1 = new Amount('1', AmountUnit.shannon);
const shannon1M = new Amount(M, AmountUnit.shannon);
const shannon1B = new Amount(B, AmountUnit.shannon);
const shannon1T = new Amount(T, AmountUnit.shannon);
const shannonFull = new Amount(F, AmountUnit.shannon);

test('formatting test set', (t) => {
  t.is(ckb1.toString(AmountUnit.shannon), M + '00');
  t.is(ckb1.toString(AmountUnit.ckb), '1');

  t.is(ckb10000.toString(AmountUnit.shannon, { commify: true }), T);
  t.is(ckb10000.toString(AmountUnit.ckb, { commify: true }), '10,000');

  t.is(shannon1.toString(AmountUnit.ckb), '0.00000001');
  t.is(shannon1.toString(AmountUnit.shannon), '1');

  t.is(shannon1M.toString(AmountUnit.shannon), M);
  t.is(shannon1M.toString(AmountUnit.ckb), '0.01');
  t.is(shannon1M.toString(AmountUnit.ckb, { pad: true }), '0.01000000');

  t.is(shannon1B.toString(AmountUnit.shannon), B);
  t.is(shannon1B.toString(AmountUnit.ckb), '10');
  t.is(shannon1B.toString(AmountUnit.ckb, { commify: true }), '10');

  t.is(shannon1T.toString(AmountUnit.shannon), T);
  t.is(shannon1T.toString(AmountUnit.ckb), '10000');
  t.is(shannon1T.toString(AmountUnit.ckb, { commify: true }), '10,000');

  t.is(shannonFull.toString(AmountUnit.ckb), '10020.034005');
  t.is(
    shannonFull.toString(AmountUnit.ckb, { pad: true, commify: true }),
    '10,020.03400500'
  );
  t.is(shannonFull.toString(AmountUnit.ckb, { section: 'whole' }), '10020');
  t.is(
    shannonFull.toString(AmountUnit.ckb, { section: 'whole', commify: true }),
    '10,020'
  );
  t.is(shannonFull.toString(AmountUnit.ckb, { section: 'fraction' }), '034005');
  t.is(
    shannonFull.toString(AmountUnit.ckb, { section: 'fraction', pad: true }),
    '03400500'
  );
});

test('calculation test set', (t) => {
  t.is(shannon1.add(shannon1).toString(AmountUnit.shannon), '2');
  t.is(
    shannon1T.add(shannon1).toString(AmountUnit.shannon),
    T.slice(0, -1) + '1'
  );
  t.is(ckb1.add(shannon1).toString(AmountUnit.shannon), M + '01');
  t.is(ckb10000.add(ckb1).toString(AmountUnit.ckb), '10001');

  // TODO more to go
});

test('to hex string', (t) => {
  t.is(shannon1.toHexString(), '0x1');
  t.is(ckb1.toHexString(), '0x5f5e100');
  t.is(shannonFull.toHexString(), '0xe94c0e8734');
});
