import test from 'ava';
import { Keccak256Hasher } from '.';

test('hello', (t) => {
  const hasher = new Keccak256Hasher();
  const res = hasher.hash('hello').serializeJson();
  t.is(
    res,
    '0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8'
  );
});
