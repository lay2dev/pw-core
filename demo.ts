import axios from 'axios';
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
} from './src';

export function asyncSleep(ms = 0) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log('start demo');
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

  const privateKey =
    '0xa800c82df5461756ae99b5c6677d019c98cc98c7786b80d7b2e77256e46ea1fe';
  const provider = new RawProvider(privateKey);
  const indexerUrl = 'http://127.0.0.1:8116';
  const ckbUrl = 'http://127.0.0.1:8114';
  // const ckbUrl = 'https://testnet.ckb.dev';
  // const indexerUrl = 'https://testnet.ckb.dev/indexer';
  // const indexerUrl = 'https://ckb.obsidians.io/indexer/aggron';
  // const ckbUrl = 'https://ckb.obsidians.io/rpc/aggron';
  const collector = new IndexerCollector(indexerUrl);
  const pwcore = await new PWCore(ckbUrl).init(
    provider,
    collector,
    null,
    config
  );
  // console.dir(provider.address, { depth: null });
  // const balance = await collector.getBalance(provider.address);
  // console.dir(balance, { depth: null });
  //
  // const cells = await collector.collect(provider.address, {
  //   neededAmount: new Amount('1', AmountUnit.ckb),
  // });
  // console.dir(cells, { depth: null });
  //
  // const sudt = new SUDT(
  //   '0x2d55f9ce00eb466459c561f9b889abc5b4cdfbfcace0edfa67b68abc4b8cbe4f'
  // );
  // const sudtBalance = await collector.getSUDTBalance(sudt, provider.address);
  // console.dir(sudtBalance, { depth: null });
  //
  // const sudtCells = await collector.collectSUDT(sudt, provider.address, {
  //   neededAmount: new Amount('9', AmountUnit.shannon),
  // });
  // console.dir(sudtCells, { depth: null });

  const toAddr = new Address(
    'ckt1qyq9ed70kzznd7alyjt7dhcq3kvl5sj2sdmsgflp40',
    AddressType.ckb
  );
  // const toAddr = new Address('0x2d55f9ce0061f9b889abc5b4cdfbfcace0edfa67', AddressType.eth);
  const fromBefore = await collector.getBalance(provider.address);
  const toBefore = await collector.getBalance(toAddr);
  // const txHash = await pwcore.sendSUDT(
  //     sudt,
  //     toAddr,
  //     new Amount('10', AmountUnit.shannon),
  //     true,
  // );
  // await ckbSendTx();
  const txHash = await pwcore.send(toAddr, new Amount('100', AmountUnit.ckb));
  console.log({ txHash });
  await asyncSleep(20000);
  const fromAfter = await collector.getBalance(provider.address);
  const toAfter = await collector.getBalance(toAddr);
  console.log({ fromBefore, toBefore, fromAfter, toAfter });
  console.log('end demo');
}

async function ckbSendTx() {
  const privateKey =
    '0xa800c82df5461756ae99b5c6677d019c98cc98c7786b80d7b2e77256e46ea1fe';
  const ckbUrl = 'http://127.0.0.1:8114';
  const CKB = require('@nervosnetwork/ckb-sdk-core').default;
  const ckb = new CKB(ckbUrl);
  const rawTx = {
    version: '0x0',
    cellDeps: [
      {
        outPoint: {
          txHash:
            '0xa777fd1964ffa98a7b0b6c09ff71691705d84d5ed1badfb14271a3a870bdd06b',
          index: '0x0',
        },
        depType: 'depGroup',
      },
    ],
    headerDeps: [],
    inputs: [
      {
        since: '0x0',
        previousOutput: {
          txHash:
            '0xa8d787265c296b412149a96b1c6de0de3b69599f950ab84c1e920653f4eb80fa',
          index: '0x1',
        },
      },
    ],
    outputs: [
      {
        capacity: '0x2540be400',
        lock: {
          codeHash:
            '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
          hashType: 'type',
          args: '0x5cb7cfb08536fbbf2497e6df008d99fa424a8377',
        },
      },
      {
        capacity: '0x1bc16d62a6b0345e',
        lock: {
          codeHash:
            '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
          hashType: 'type',
          args: '0x40dcec2ef1ffc2340ea13ff4dd9671d2f9787e95',
        },
      },
    ],
    outputsData: ['0x', '0x'],
    witnesses: [{ lock: '', inputType: '', outputType: '' }],
  };
  const signedTx = ckb.signTransaction(privateKey)(rawTx);
  // console.dir({signedTx}, { depth: null });
  // const deployTxHash = await ckb.rpc.sendTransaction(signedTx);
  // console.log({deployTxHash});
  // while(true) {
  //   const data = await ckb.rpc.getTransaction(deployTxHash);
  //   console.log({data});
  //   await asyncSleep(1000);
  // }
}

main();
