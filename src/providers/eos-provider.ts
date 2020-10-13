import { Provider, Platform } from './provider';
import { Address, AddressType } from '../models';
import ScatterJS from '@scatterjs/core';
import ScatterEOS from '@scatterjs/eosjs2';
import ecc from 'eosjs-ecc';
import { Reader } from 'ckb-js-toolkit';
import { Keccak256Hasher } from '../hashers';
import { spliceStr } from '../utils';
import axios from 'axios';

export class EosProvider extends Provider {
  onAddressChanged: (newAddress: Address) => void;
  constructor(
    readonly eosNetwork: any,
    onAddressChanged?: (newAddress: Address) => void
  ) {
    super(Platform.eos);
    this.onAddressChanged = onAddressChanged;
  }
  async init(): Promise<Provider> {
    console.log('[eos-provider] try scatterjs');

    const network = ScatterJS.Network.fromJson(this.eosNetwork);
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

    const lockArgs = await this.getCKBLockArgsForEosAccount(name);
    console.log('eos lock args', lockArgs);

    this.address = new Address(name, AddressType.eos, lockArgs);
    window.scatter = scatter;

    return this;
  }

  async getEosPublicKey(account: string) {
    const network = ScatterJS.Network.fromJson(this.eosNetwork);
    const baseUrl = network.fullhost();

    const res = await axios.post(`${baseUrl}/v1/chain/get_account`, {
      account_name: account,
    });
    const data = res.data;

    const pubkey = data.permissions[0].required_auth.keys[0].key;
    return pubkey;
  }

  async getCKBLockArgsForEosAccount(account: string) {
    const pubkey = await this.getEosPublicKey(account);

    const publicKeyHex = ecc.PublicKey(pubkey).toUncompressed().toHex();

    const publicHash = new Keccak256Hasher()
      .hash(new Reader(`0x${publicKeyHex.slice(2)}`))
      .serializeJson();
    const address = '0x' + publicHash.slice(-40);
    return address;
  }

  processEosHash(a) {
    let str = a.replace('0x', '');
    str = spliceStr(str, 12, 0, ' ');
    str = spliceStr(str, 12 * 2 + 1, 0, ' ');
    str = spliceStr(str, 12 * 3 + 2, 0, ' ');
    str = spliceStr(str, 12 * 4 + 3, 0, ' ');
    str = spliceStr(str, 12 * 5 + 4, 0, ' ');
    return str;
  }

  async sign(message: string): Promise<string> {
    const pubkey = await this.getEosPublicKey(this.address.addressString);
    const sig = await window.scatter.getArbitrarySignature(
      pubkey,
      this.processEosHash(message)
    );

    const sigHex = ecc.Signature.from(sig).toHex().replace('0x', '');
    let v = Number.parseInt(sigHex.slice(0, 2), 16);
    if (v >= 27) v = (v - 27) % 4;

    const result =
      '0x' +
      this.platform.toString(16).padStart(2, '0') +
      sigHex.slice(2) +
      v.toString(16).padStart(2, '0');
    return result;
  }

  close() {
    throw new Error('Method not implemented.');
  }
}
