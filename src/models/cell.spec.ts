import test from 'ava';
import PWCore, { ChainID } from '../core';
// import { Address, AddressType } from './address';
// import { AmountUnit } from './amount';
import { DummyCollector } from '../collectors';
import { validators, transformers } from 'ckb-js-toolkit';
import { Cell } from './cell';
import { OutPoint } from './out-point';
import { Amount, AmountUnit } from './amount';
import { Address, AddressType } from './address';
import { Script } from './script';
import { HashType } from '../interfaces';

const address = new Address(
  'ckt1qyqxpayn272n8km2k08hzldynj992egs0waqnr8zjs',
  AddressType.ckb
);

let pw: PWCore;

test.before(async () => {
  pw = new PWCore('https://aggron.ckb.dev');
  await pw.init(new DummyCollector(address), ChainID.ckb_testnet);
});

// from cell at https://explorer.nervos.org/aggron/transaction/0x79221866125b9aff33c4303a6c35bde25d235e7e10025a86ca2a5d6ad657f51f
const data = 'Hello from Lay2';
const hexData = '0x48656c6c6f2066726f6d204c617932';

test('data actions', (t) => {
  const cell = new Cell(
    new Amount('100', AmountUnit.ckb),
    address.toLockScript()
  );
  cell.setData(data);
  t.is(cell.getData(), data);
  t.is(cell.getHexData(), hexData);

  cell.setHexData(hexData);
  t.is(cell.getData(), data);
  t.is(cell.getHexData(), hexData);

  cell.setData(hexData);
  t.not(cell.getData(), data);
  t.not(cell.getHexData(), hexData);

  t.throws(() => cell.setHexData(data));
});

test('loadFromBlockchain and validate', async (t) => {
  const outPoint = new OutPoint(
    '0x79221866125b9aff33c4303a6c35bde25d235e7e10025a86ca2a5d6ad657f51f',
    '0x0'
  );
  const loadedCell = await Cell.loadFromBlockchain(pw.rpc, outPoint);
  t.notThrows(() =>
    validators.ValidateCellOutput(
      transformers.TransformCellOutput(loadedCell.serializeJson())
    )
  );
  t.true(Amount.EQ(loadedCell.capacity, new Amount('76', AmountUnit.ckb)));
  t.true(
    loadedCell.lock.sameWith(
      new Script(
        '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        '0x705ca2e725e9b26e6abb842ed2043ea80197dfd7',
        HashType.type
      )
    )
  );
  t.is(loadedCell.type, null);
  t.true(loadedCell.outPoint.sameWith(outPoint));
  t.is(loadedCell.getHexData(), hexData);
  t.is(loadedCell.getData(), data);
});
