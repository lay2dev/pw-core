import { Collector } from '../collectors/collector';
import { Amount, AmountUnit, Transaction, Script } from '../models';
import { WitnessArgs } from '../interfaces';
import PWCore, { ChainID } from '..';
import { SUDTCollector } from '../collectors/sudt-collector';

const FEE_BASE = 1000;

export interface BuilderOption {
  feeRate?: number;
  collector?: Collector;
  witnessArgs?: WitnessArgs;
  data?: string;
}

export abstract class Builder {
  static readonly MIN_FEE_RATE = 1000;
  static readonly MIN_CHANGE = new Amount('61', AmountUnit.ckb);
  static readonly WITNESS_ARGS = {
    Secp256k1Pw: {
      lock: '0x' + '0'.repeat(132),
      input_type: '',
      output_type: '',
    },
    // Omni Lock Witness Structure: https://github.com/XuJiandong/docs-bank/blob/master/omni_lock.md#omni-lock-witness
    Secp256k1Omni: {
      lock: '0x' + '0'.repeat(170), // 0x + 20 bytes for RcLockWitnessLock Molecule table + 65 bytes for signature.
      input_type: '',
      output_type: '',
    },
    Secp256k1: {
      lock: '0x' + '0'.repeat(130),
      input_type: '',
      output_type: '',
    },
    Secp256r1: {
      lock: '0x' + '0'.repeat(600),
      input_type: '',
      output_type: '',
    },
  };

  static calcFee(
    tx: Transaction,
    feeRate: number = Builder.MIN_FEE_RATE
  ): Amount {
    if (feeRate < Builder.MIN_FEE_RATE) {
      feeRate = Builder.MIN_FEE_RATE;
    }
    const txSize = tx.getSize();
    const fee = (feeRate / FEE_BASE) * txSize;
    return new Amount(fee.toString(), AmountUnit.shannon);
  }

  // TODO: Need more lock support here.
  static determineWitnessArgs(lockScript: Script): WitnessArgs {
    if (
      lockScript.codeHash === PWCore.config.defaultLock.script.codeHash &&
      lockScript.hashType === PWCore.config.defaultLock.script.hashType
    )
      return Builder.WITNESS_ARGS.Secp256k1;
    else if (
      lockScript.codeHash === PWCore.config.pwLock.script.codeHash &&
      lockScript.hashType === PWCore.config.pwLock.script.hashType
    )
      return PWCore.chainId === ChainID.ckb
        ? Builder.WITNESS_ARGS.Secp256k1
        : Builder.WITNESS_ARGS.Secp256k1Pw;
    else if (
      Object.prototype.hasOwnProperty.call(PWCore.config, 'omniLock') &&
      lockScript.codeHash === PWCore.config.omniLock.script.codeHash &&
      lockScript.hashType === PWCore.config.omniLock.script.hashType
    )
      return Builder.WITNESS_ARGS.Secp256k1Omni;
    else
      throw new Error(
        'A lock script was specified that has not been implemented.'
      );
  }

  protected fee: Amount;

  protected constructor(
    protected feeRate: number = Builder.MIN_FEE_RATE,
    protected collector: Collector | SUDTCollector = PWCore.defaultCollector,
    protected witnessArgs: WitnessArgs | null = null
  ) {}

  // Set the witness args based on the provided lock script.
  calculateWitnessArgs(lockScript: Script) {
    // If witness args were provided in the options, then do not change them.
    if (this.witnessArgs !== null) return;

    this.witnessArgs = Builder.determineWitnessArgs(lockScript);
  }

  getFee(): Amount {
    return this.fee;
  }

  abstract build(): Promise<Transaction>;
}
