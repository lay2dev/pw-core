import test from 'ava';
import { Amount } from '../..';

test('mulitply', (c) => {
  const t = (multiplicand, multiplier, expected) => {
    c.is(
      new Amount(expected, 1).toString(1),
      new Amount(multiplicand, 1).mul(new Amount(multiplier, 1)).toString(1)
    );
  };

  t(1, 0, '0');
  t(1, -0, '-0');
  t(-1, 0, '-0');
  t(-1, -0, '0');
  t(0, 1, '0');
  t(0, -1, '-0');
  t(-0, 1, '-0');
  t(-0, -1, '0');
  t(0, 0, '0');
  t(0, -0, '-0');
  t(-0, 0, '-0');
  t(-0, -0, '0');

  //   t(1, '1', '1');
  //   t(1, '-45', '-45');
  //   t(1, '22', '22');
  //   //   t(1, 0144, '100');
  //   t(1, '0144', '144');
  //   t(1, '6.1915', '6.1915');
  //   t(1, '-1.02', '-1.02');
  //   t(1, '0.09', '0.09');
  //   t(1, '-0.0001', '-0.0001');
});
