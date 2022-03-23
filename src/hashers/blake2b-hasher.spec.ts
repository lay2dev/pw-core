import test from 'ava';
import { Blake2bHasher } from '.';

test('hello', (t) => {
  const hasher = new Blake2bHasher();
  const result = hasher.hash('hello').serializeJson();
  t.is(
    result,
    '0x2da1289373a9f6b7ed21db948f4dc5d942cf4023eaef1d5a2b1a45b9d12d1036'
  );
});

// CKB blake2b uses a personalization: 'ckb-default-hash'
