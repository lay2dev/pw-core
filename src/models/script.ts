import { HashType, CKBModel } from '../interfaces';
import { Address, AddressType, getDefaultPrefix } from './address';
import { generateCkbAddressString } from '../utils';
import { validators, transformers, normalizers } from '../ckb-js-toolkit';
import { SerializeScript } from '../ckb-lumos/core';
import { Blake2bHasher } from '../hashers';
import { NervosAddressVersion } from '../helpers/address';

export class Script implements CKBModel {
  static fromRPC(data: any): Script | undefined {
    if (!data) return undefined;
    validators.ValidateScript(data);
    return new Script(data.code_hash, data.args, data.hash_type);
  }

  constructor(
    public codeHash: string,
    public args: string,
    public hashType: HashType
  ) {}

  sameWith(script: Script) {
    validators.ValidateScript(transformers.TransformScript(script));
    return (
      this.args === script.args &&
      this.codeHash === script.codeHash &&
      this.hashType === script.hashType
    );
  }

  validate(): boolean {
    validators.ValidateScript(transformers.TransformScript(this));
    return true;
  }

  serializeJson(): object {
    return {
      code_hash: this.codeHash,
      args: this.args,
      hash_type: this.hashType,
    };
  }

  toHash(): string {
    return new Blake2bHasher()
      .update(
        SerializeScript(
          normalizers.NormalizeScript(transformers.TransformScript(this))
        )
      )
      .digest()
      .serializeJson();
  }

  toAddress(
    prefix = getDefaultPrefix(),
    addressVersion = NervosAddressVersion.latest
  ): Address {
    return new Address(
      generateCkbAddressString(this, prefix, addressVersion),
      AddressType.ckb
    );
  }
}
