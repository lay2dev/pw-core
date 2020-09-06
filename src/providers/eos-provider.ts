import { Provider, Platform } from './provider';
import { Address, AddressType } from '..';
import ScatterJS from '@scatterjs/core';
import ScatterEOS from '@scatterjs/eosjs2';
import { getCKBLockArgsForEosAccount } from '../utils';

export class EosProvider extends Provider {
  onAddressChanged: (newAddress: Address) => void;
  constructor(onAddressChanged?: (newAddress: Address) => void) {
    super(Platform.eos);
    this.onAddressChanged = onAddressChanged;
  }
  async init(): Promise<Provider> {
    console.log('[eos-provider] try scatterjs');
    const network = ScatterJS.Network.fromJson({
      blockchain: 'eos',
      chainId:
        'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
      host: 'nodes.get-scatter.com',
      port: 443,
      protocol: 'https',
    });

    ScatterJS.plugins(new ScatterEOS());
    const connected = await ScatterJS.scatter.connect('pwcore-app', {
      network,
    });
    if (!connected) {
      throw new Error('eos not connected');
    }
    console.log('[eos-provider] scatter connected');

    const scatter = ScatterJS.scatter;

    await scatter.login();
    console.log('[eos-provider] scatter login');
    const account = scatter.identity.accounts.find(
      (x) => x.blockchain === 'eos'
    );
    const { name } = account;
    console.log('eos account', name);

    const lockArgs = await getCKBLockArgsForEosAccount(name);
    console.log('eos lock args', lockArgs);

    this.address = new Address(name, AddressType.eos, lockArgs);
    window.scatter = scatter;

    return this;
  }
}
