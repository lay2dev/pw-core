// Run this script:
//
// $ yarn global add ts-node
// $ ts-node scripts/backend-usage-example.ts
import PWCore, {
  RawProvider,
  Address,
  Amount,
  AddressType,
  IndexerCollector,
  CellDep,
  DepType,
  OutPoint,
  Script,
  HashType,
  AmountUnit,
  SUDT,
} from '../src';
import { RPC } from 'ckb-js-toolkit';

async function main() {
  const config = {
    daoType: {
      cellDep: new CellDep(
        DepType.code,
        new OutPoint(
          '0xa563884b3686078ec7e7677a5f86449b15cf2693f3c1241766c6996f206cc541',
          '0x2'
        )
      ),
      script: new Script(
        '0x82d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f2e',
        '0x',
        HashType.type
      ),
    },
    sudtType: {
      cellDep: new CellDep(
        DepType.code,
        new OutPoint(
          '0x1b9015427d92d2ba3986283c7f6777e63673bd9ed67dc73d4e6f607890646a02',
          '0x5'
        )
      ),
      script: new Script(
        '0xe1e354d6d643ad42724d40967e334984534e0367405c5ae42a9d7d63d77df419',
        '0x',
        HashType.data
      ),
    },
    defaultLock: {
      cellDep: new CellDep(
        DepType.depGroup,
        new OutPoint(
          '0xa777fd1964ffa98a7b0b6c09ff71691705d84d5ed1badfb14271a3a870bdd06b',
          '0x0'
        )
      ),
      script: new Script(
        '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        '0x',
        HashType.type
      ),
    },
    multiSigLock: {
      cellDep: new CellDep(
        DepType.depGroup,
        new OutPoint(
          '0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708',
          '0x1'
        )
      ),
      script: new Script(
        '0x5c5069eb0857efc65e1bca0c07df34c31663b3622fd3876c876320fc9634e2a8',
        '0x',
        HashType.type
      ),
    },
    pwLock: {
      cellDep: new CellDep(
        DepType.code,
        new OutPoint(
          '0x7822910729c566c0f8a3f4bb9aee721c5da2808f9a4688e909c0119b0ab820d7',
          '0x0'
        )
      ),
      script: new Script(
        '0xc9eb3097397836e4d5b8fabed3c0cddd14fefe483caf238ca2e3095a111add0b',
        '0x',
        HashType.type
      ),
    },
    acpLockList: [
      new Script(
        '0xc9eb3097397836e4d5b8fabed3c0cddd14fefe483caf238ca2e3095a111add0b',
        '0x',
        HashType.type
      ),
    ],
  };

  const CKB_URL = process.env.CKB_URL || 'http://127.0.0.1:8114';
  const INDEXER_URL = process.env.INDEXER_URL || 'http://127.0.0.1:8116';
  const rpc = new RPC(CKB_URL);

  // init `RawProvider` with private key
  const privateKey =
    process.env.PRI_KEY ||
    '0xa800c82df5461756ae99b5c6677d019c98cc98c7786b80d7b2e77256e46ea1fe';
  const provider = new RawProvider(privateKey);
  const collector = new IndexerCollector(INDEXER_URL);
  const pwcore = await new PWCore(CKB_URL).init(
    provider,
    collector,
    null,
    config
  );

  // get address
  console.dir(provider.address, { depth: null });

  // get balance
  const balance = await collector.getBalance(provider.address);
  console.log(`balance: ${balance}`);
  const sudt = new SUDT(
    '0x2d55f9ce00eb466459c561f9b889abc5b4cdfbfcace0edfa67b68abc4b8cbe4f'
  );
  const sudtBalance = await collector.getSUDTBalance(sudt, provider.address);
  console.log(`sudt balance: ${sudtBalance}`);

  // transfer
  const toAddr = new Address(
    'ckt1qyq9ed70kzznd7alyjt7dhcq3kvl5sj2sdmsgflp40',
    AddressType.ckb
  );
  const fromBefore = await collector.getBalance(provider.address);
  const toBefore = await collector.getBalance(toAddr);
  const txHash = await pwcore.send(toAddr, new Amount('100', AmountUnit.ckb));
  await waitUntilCommitted(txHash, rpc);
  const fromAfter = await collector.getBalance(provider.address);
  const toAfter = await collector.getBalance(toAddr);
  console.log({ fromBefore, toBefore, fromAfter, toAfter });
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
