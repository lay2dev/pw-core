import anyTest, { TestInterface } from 'ava';
import PWCore, { ChainID } from '../core';
import { DummyCollector } from '../collectors/dummy-collector';
import { validators, transformers } from 'ckb-js-toolkit';
import {
  Address,
  AddressType,
  Amount,
  AmountUnit,
  Cell,
  OutPoint,
  Script,
} from '.';
import { HashType } from '../interfaces';
import { DummyProvider } from '../providers/dummy-provider';
import {
  cellOccupiedBytes,
  hexDataOccupiedBytes,
  scriptOccupiedBytes,
} from '../utils';

const test = anyTest as TestInterface<{ pw: PWCore }>;

const address = new Address(
  'ckt1qyqxpayn272n8km2k08hzldynj992egs0waqnr8zjs',
  AddressType.ckb
);

test.before(async (t) => {
  const pw = new PWCore('https://testnet.ckb.dev');
  await pw.init(new DummyProvider(), new DummyCollector(), ChainID.ckb_testnet);

  t.context.pw = pw;
});

// from cell at https://explorer.nervos.org/aggron/transaction/0x79221866125b9aff33c4303a6c35bde25d235e7e10025a86ca2a5d6ad657f51f
const data = 'Hello from Lay2';
const hexData = '0x48656c6c6f2066726f6d204c617932';

test('data actions', (t) => {
  const cell = new Cell(
    new Amount('100', AmountUnit.ckb),
    address.toLockScript()
  );

  t.true(cell.isEmpty());

  // t.is(cell.resize(), 61);

  cell.setData(data);
  t.is(cell.getData(), data);
  t.is(cell.getHexData(), hexData);

  t.false(cell.isEmpty());

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
  const loadedCell = await Cell.loadFromBlockchain(t.context.pw.rpc, outPoint);
  t.notThrows(() =>
    validators.ValidateCellOutput(
      transformers.TransformCellOutput(loadedCell.serializeJson())
    )
  );
  t.true(loadedCell.capacity.eq(new Amount('76', AmountUnit.ckb)));
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

test('space check', (t) => {
  const cellData =
    '0x00e40b5402000000000000000000000081bf212901000000000000000000000000c817a80400000001';
  const cell = new Cell(
    new Amount('102', AmountUnit.ckb),
    address.toLockScript(),
    null,
    null,
    cellData
  );

  // cell.setHexData(cellData);2

  // throw new Error(cell.getData());

  t.is(cell.getHexData(), cellData);
  t.is(hexDataOccupiedBytes(cell.getHexData()), 41);
  t.is(scriptOccupiedBytes(cell.lock), 53);
  t.is(scriptOccupiedBytes(cell.type), 0);
  t.is(cellOccupiedBytes(cell), 102);
});
