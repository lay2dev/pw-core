import { HashType, CKBModel } from '../interfaces';
import { Address, AddressPrefix, AddressType, getDefaultPrefix, LockType } from './address';
import { generateCkbAddressString } from '../utils';
import { validators, transformers, normalizers } from '../ckb-js-toolkit';
import { SerializeScript } from '../ckb-lumos/core';
import { Blake2bHasher } from '../hashers';
import { NervosAddressVersion } from '../helpers/address';
import { CHAIN_SPECS } from '../constants';

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

  identifyLockType(): LockType | null {
    for (const config of Object.values(CHAIN_SPECS)) {
      // Default Lock
      if (this.sameCodeTypeWith(config.defaultLock.script)) {
        return LockType.default;
      }
      // MultiSig Lock
      else if (this.sameCodeTypeWith(config.multiSigLock.script)) {
        return LockType.multisig;
      }
      // PW-Lock
      else if (this.sameCodeTypeWith(config.pwLock.script)) {
        return LockType.pw;
      }
      // Omni Lock
      else if (
        Object.prototype.hasOwnProperty.call(config, 'omniLock') &&
        this.sameCodeTypeWith((config as any).omniLock.script)
      ) {
        return LockType.omni;
      }
      // ACP Lock
      else if (
        Object.prototype.hasOwnProperty.call(config, 'acpLock') &&
        this.sameCodeTypeWith((config as any).acpLock.script)
      ) {
        return LockType.acp;
      }
    }

    // No match was found. Unknown Lock.
    return null;
  }

  /**
   * Checks if the code hash and hash type match in the specified script.
   *
   * Note: This ignores the args during the comparison.
   *
   * @param script The script to compare against.
   * @returns True if the codeHash and hashType match.
   */
  sameCodeTypeWith(script: Script): boolean {
    validators.ValidateScript(transformers.TransformScript(script));
    return (
      this.codeHash === script.codeHash && this.hashType === script.hashType
    );
  }

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
    prefix: AddressPrefix = getDefaultPrefix(),
    addressVersion = NervosAddressVersion.latest
  ): Address {
    return new Address(
      generateCkbAddressString(this, prefix, addressVersion),
      AddressType.ckb
    );
  }
}
