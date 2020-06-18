// import * as ckbUtils from '@nervosnetwork/ckb-sdk-utils';
// import { mergeTypedArraysUnsafe } from '../utils';
import { Transaction } from '..';
import { Hasher, Blake2bHasher } from '../hashers';
import { normalizers, Reader, transformers } from 'ckb-js-toolkit';
import JSBI from 'jsbi';
import {
  SerializeWitnessArgs,
  SerializeRawTransaction,
} from '@ckb-lumos/types/lib/core';
// import { ValidateCollectorCell, serializeBigInt } from '../utils';
// import { SerializeRawTransaction } from 'ckb-js-toolkit-contrib/src/blockchain';

export interface Message {
  index: number;
  message: string;
}

export abstract class Signer {
  protected constructor(private readonly hasher: Hasher) {}

  protected abstract async signMessages(messages: Message[]): Promise<string[]>;

  async sign(tx: Transaction): Promise<Transaction> {
    tx.witnesses[0] = `0x5500000010000000550000005500000041000000${'0'.repeat(
      130
    )}`;
    const messages = this.toMessages(tx);
    const witnesses = await this.signMessages(messages);
    witnesses[0] = new Reader(
      SerializeWitnessArgs(
        normalizers.NormalizeWitnessArgs({ lock: witnesses[0] })
      )
    ).serializeJson();
    FillSignedWitnesses(tx, messages, witnesses);

    console.log('[signer] signed tx: ', tx);
    return tx;
  }

  private toMessages(tx: Transaction): Message[] {
    tx.validate();

    if (tx.raw.inputs.length !== tx.raw.inputCells.length) {
      throw new Error('Input number does not match!');
    }

    const txHash = new Blake2bHasher().hash(
      new Reader(
        SerializeRawTransaction(
          normalizers.NormalizeRawTransaction(
            transformers.TransformRawTransaction(tx.raw)
          )
        )
      )
    );

    const messages = [];
    const used = tx.raw.inputs.map((_input) => false);
    for (let i = 0; i < tx.raw.inputs.length; i++) {
      if (used[i]) {
        continue;
      }
      if (i >= tx.witnesses.length) {
        throw new Error(
          `Input ${i} starts a new script group, but witness is missing!`
        );
      }
      used[i] = true;
      this.hasher.update(txHash);
      const firstWitness = new Reader(tx.witnesses[i]);
      this.hasher.update(serializeBigInt(firstWitness.length()));
      this.hasher.update(firstWitness);
      for (
        let j = i + 1;
        j < tx.raw.inputs.length && j < tx.witnesses.length;
        j++
      ) {
        if (tx.raw.inputCells[i].lock.sameWith(tx.raw.inputCells[j].lock)) {
          used[j] = true;
          const currentWitness = new Reader(tx.witnesses[j]);
          this.hasher.update(serializeBigInt(currentWitness.length()));
          this.hasher.update(currentWitness);
        }
      }
      messages.push({
        index: i,
        message: this.hasher.digest().serializeJson(), // hex string
        lock: tx.raw.inputCells[i].lock,
      });

      this.hasher.reset();
    }
    return messages;
  }
}

function FillSignedWitnesses(
  tx: Transaction,
  messages: Message[],
  witnesses: string[]
) {
  if (messages.length !== witnesses.length) {
    throw new Error('Invalid number of witnesses!');
  }
  for (let i = 0; i < messages.length; i++) {
    tx.witnesses[messages[i].index] = witnesses[i];
  }
  return tx;
}

function serializeBigInt(i: number | JSBI) {
  const view = new DataView(new ArrayBuffer(8));
  view.setBigUint64(0, BigInt(i), true);
  return view.buffer;
}
