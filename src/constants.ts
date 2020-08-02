import { DepType, HashType } from './interfaces';
import { OutPoint, CellDep, Script } from './models';

export const ECDSA_WITNESS_LEN = 172;
export const DAO_WITHDRAW_2_WITNESS_LEN = 196;

export const DUMMY_ADDRESSES = {
  main: 'ckb1qyqy5vmywpty6p72wpvm0xqys8pdtxqf6cmsr8p2l0',
  ckb_testnet: 'ckt1qyqwknsshmvnj8tj6wnaua53adc0f8jtrrzqz4xcu2',
  ckb_dev: 'ckt1qyqwknsshmvnj8tj6wnaua53adc0f8jtrrzqz4xcu2',
};

export const CHAIN_SPECS = {
  Lina: {
    daoType: {
      cellDep: new CellDep(
        DepType.code,
        new OutPoint(
          '0xe2fb199810d49a4d8beec56718ba2593b665db9d52299a0f9e6e75416d73ff5c',
          '0x2'
        )
      ),
      script: new Script(
        '0x82d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f2e',
        '0x',
        HashType.type
      ),
    },
    defaultLock: {
      cellDep: new CellDep(
        DepType.depGroup,
        new OutPoint(
          '0x71a7ba8fc96349fea0ed3a5c47992e3b4084b031a42264a018e0072e8172e46c',
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
          '0x71a7ba8fc96349fea0ed3a5c47992e3b4084b031a42264a018e0072e8172e46c',
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
          '0xafb4962ca75801340fdf56667e9d7a8e8bd3e56025108c6c76776b96ee68d5ca',
          '0x0'
        )
      ),
      script: new Script(
        '0xbf43c3602455798c1a61a596e0d95278864c552fafe231c063b3fabf97a8febc',
        '0x',
        HashType.type
      ),
    },
  },

  Aggron: {
    daoType: {
      cellDep: new CellDep(
        DepType.code,
        new OutPoint(
          '0x8f8c79eb6671709633fe6a46de93c0fedc9c1b8a6527a18d3983879542635c9f',
          '0x2'
        )
      ),
      script: new Script(
        '0x82d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f2e',
        '0x',
        HashType.type
      ),
    },
    defaultLock: {
      cellDep: new CellDep(
        DepType.depGroup,
        new OutPoint(
          '0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37',
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
          '0x6495cede8d500e4309218ae50bbcadb8f722f24cc7572dd2274f5876cb603e4e',
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
          '0x760a6db1efb79eeed0675c18afa75ecba1f723d48aeb7cca48e7f34843fb5182',
          '0x0'
        )
      ),
      script: new Script(
        '0xb768aa03816668d690449e61e01a87c46a2fb162cfd16ea12169defcde0015d4',
        '0x',
        HashType.type
      ),
    },
  },
  // dev - lay2.ckb.dev
  Lay2: {
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
    defaultLock: {
      cellDep: new CellDep(
        DepType.depGroup,
        new OutPoint(
          '0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708',
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
  },
};
