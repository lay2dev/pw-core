// Run this script:
//
// $ yarn global add ts-node
// $ PRI_KEY=0x0000000000000000000000000000000000000000000000000000000000000000 ts-node scripts/backend-usage-example.ts
import PWCore, {
  RawProvider,
  Address,
  Amount,
  AddressType,
  IndexerCollector,
  AmountUnit,
  SUDT,
  Builder,
} from '../src';
import { RPC } from 'ckb-js-toolkit';

async function main() {
  const CKB_URL = 'https://testnet.ckb.dev';
  const INDEXER_URL = 'https://testnet.ckb.dev/indexer';
  const rpc = new RPC(CKB_URL);

  // init `RawProvider` with private key
  const privateKey = process.env.PRI_KEY;
  const provider = new RawProvider(privateKey);
  const collector = new IndexerCollector(INDEXER_URL);
  const pwcore = await new PWCore(CKB_URL).init(provider, collector);

  // get address
  console.dir(provider.address, { depth: null });

  // get balance
  const balance = await collector.getBalance(provider.address);
  console.log(`balance: ${balance}`);
  const sudt = new SUDT(
    // '0x8462b20277bcbaa30d821790b852fb322d55c2b12e750ea91ad7059bc98dda4b'
    '0xacaa8f78be29c93a76146cf015a5af75e7aa2f401d0836b406a56f6d3c91b0f3'
  );
  const sudtBalance = await collector.getSUDTBalance(sudt, provider.address);
  console.log(`sudt balance: ${sudtBalance}`);

  // for ckb system lock script, its length of witness lock is 65 bytes, use RawScep256K1 here.
  const options = { witnessArgs: Builder.WITNESS_ARGS.RawSecp256k1 };
  // transfer
  const toAddr = new Address(
    '0x7Ad9ec46A9c2910b446148728aCEd0C7E2B50048',
    AddressType.eth
  );
  const fromBefore = await collector.getBalance(provider.address);
  const toBefore = await collector.getBalance(toAddr);
  // The amount should be more than 61 CKB, unless the toAddr is acp address and there is already cell to receive CKB
  const txHash = await pwcore.send(
    toAddr,
    new Amount('1', AmountUnit.shannon),
    options
  );
  await waitUntilCommitted(txHash, rpc);
  const fromAfter = await collector.getBalance(provider.address);
  const toAfter = await collector.getBalance(toAddr);
  console.log({ fromBefore, toBefore, fromAfter, toAfter });

  // transfer sudt
  const fromSudtBefore = await collector.getSUDTBalance(sudt, provider.address);
  const toSudtBefore = await collector.getSUDTBalance(sudt, toAddr);
  // If the recipient address is acp address and there is already sudt cell, you can specify the `createAcp` parameter
  // as `false`. Otherwise, set it to `true`.
  const txSudtHash = await pwcore.sendSUDT(
    sudt,
    toAddr,
    new Amount('1', AmountUnit.shannon),
    false,
    null,
    options
  );
  await waitUntilCommitted(txSudtHash, rpc);
  const fromSudtAfter = await collector.getSUDTBalance(sudt, provider.address);
  const toSudtAfter = await collector.getSUDTBalance(sudt, toAddr);
  console.log({ fromSudtBefore, toSudtBefore, fromSudtAfter, toSudtAfter });
}

function asyncSleep(ms = 1000) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitUntilCommitted(
  txHash: string,
  rpc: RPC,
  timeout: number = 180
) {
  for (let index = 0; index < timeout; index++) {
    const data = await rpc.get_transaction(txHash);
    const status = data.tx_status.status;
    console.log(`tx ${txHash} is ${status}, waited for ${index} seconds`);
    await asyncSleep(1000);
    if (status === 'committed') {
      return;
    }
  }
  throw new Error(`tx ${txHash} not committed in ${timeout} seconds`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
