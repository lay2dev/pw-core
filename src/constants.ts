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
    sudtType: {
      cellDep: new CellDep(
        DepType.code,
        new OutPoint(
          '0xc7813f6a415144643970c2e88e0bb6ca6a8edc5dd7c1022746f628284a9936d5',
          '0x0'
        )
      ),
      script: new Script(
        '0x5e7a36a77e68eecc013dfa2fe6a23f3b6c344b04005808694ae6dd45eea4cfd5',
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
          '0x1d60cb8f4666e039f418ea94730b1a8c5aa0bf2f7781474406387462924d15d4',
          '0x0'
        )
      ),
      script: new Script(
        '0xbf43c3602455798c1a61a596e0d95278864c552fafe231c063b3fabf97a8febc',
        '0x',
        HashType.type
      ),
    },
    acpLockList: [
      new Script(
        '0xbf43c3602455798c1a61a596e0d95278864c552fafe231c063b3fabf97a8febc',
        '0x',
        HashType.type
      ),
      new Script(
        '0x0fb343953ee78c9986b091defb6252154e0bb51044fd2879fde5b27314506111',
        '0x',
        HashType.data
      ),
    ],
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
    sudtType: {
      cellDep: new CellDep(
        DepType.code,
        new OutPoint(
          '0xe12877ebd2c3c364dc46c5c992bcfaf4fee33fa13eebdf82c591fc9825aab769',
          '0x0'
        )
      ),
      script: new Script(
        '0xc5e5dcf215925f7ef4dfaf5f4b4f105bc321c02776d6e7d52a1db3fcd9d011a4',
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
          '0x57a62003daeab9d54aa29b944fc3b451213a5ebdf2e232216a3cfed0dde61b38',
          '0x0'
        )
      ),
      script: new Script(
        '0x58c5f491aba6d61678b7cf7edf4910b1f5e00ec0cde2f42e0abb4fd9aff25a63',
        '0x',
        HashType.type
      ),
    },
    acpLockList: [
      new Script(
        '0x58c5f491aba6d61678b7cf7edf4910b1f5e00ec0cde2f42e0abb4fd9aff25a63',
        '0x',
        HashType.type
      ),
      new Script(
        '0x86a1c6987a4acbe1a887cca4c9dd2ac9fcb07405bbeda51b861b18bbf7492c4b',
        '0x',
        HashType.type
      ),
    ],
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
    sudtType: {
      cellDep: new CellDep(
        DepType.code,
        new OutPoint(
          '0xc1b2ae129fad7465aaa9acc9785f842ba3e6e8b8051d899defa89f5508a77958',
          '0x0'
        )
      ),
      script: new Script(
        '0x48dbf59b4c7ee1547238021b4869bceedf4eea6b43772e5d66ef8865b6ae7212',
        '0x',
        HashType.data
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
    acpLockList: [
      new Script(
        '0xc9eb3097397836e4d5b8fabed3c0cddd14fefe483caf238ca2e3095a111add0b',
        '0x',
        HashType.type
      ),
    ],
  },
};
