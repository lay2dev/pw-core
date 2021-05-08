import { CKBModel, HashType } from '../interfaces';
import { Script } from './script';
import { OutPoint } from './out-point';
import { CellInput } from './cell-input';
// import { minimalCellCapacity } from '../utils';
import { AmountUnit, Amount } from './amount';
import { RPC, validators, transformers } from '../ckb-js-toolkit';
import { byteArrayToHex, cellOccupiedBytes, hexToByteArray } from '../utils';

export class Cell implements CKBModel {
  static fromRPC(data: any): Cell {
    if (!data) {
      throw new Error('Cannot create cell from empty data');
    }
    validators.ValidateCellOutput(data);
    return new Cell(
      data.capacity,
      Script.fromRPC(data.lock),
      Script.fromRPC(data.type),
      OutPoint.fromRPC(data.out_point),
      data.data
    );
  }

  static async loadFromBlockchain(rpc: RPC, outPoint: OutPoint): Promise<Cell> {
    const index = Number(outPoint.index);
    const {
      transaction: { outputs, outputs_data },
    } = await rpc.get_transaction(outPoint.txHash);
    const { capacity, lock, type } = outputs[index];
    return new Cell(
      new Amount(capacity, AmountUnit.shannon),
      new Script(lock.code_hash, lock.args, HashType[lock.hash_type as string]),
      type
        ? new Script(
            type.code_hash,
            type.args,
            HashType[type.hash_type as string]
          )
        : null,
      outPoint,
      outputs_data[index]
    );
  }

  constructor(
    public capacity: Amount,
    public lock: Script,
    public type?: Script,
    public outPoint?: OutPoint,
    private data: string = '0x'
  ) {
    this.spaceCheck();
  }

  clone() {
    return new Cell(
      this.capacity,
      this.lock,
      this.type,
      this.outPoint,
      this.data
    );
  }

  sameWith(cell: Cell): boolean {
    if (!cell || !cell.outPoint || !this.outPoint) {
      throw new Error('to be compared, cells must have outPoint value');
    }
    return cell.outPoint.sameWith(this.outPoint);
  }

  resize() {
    // const base = SerializeCellOutput(
    //   normalizers.NormalizeCellOutput(transformers.TransformCellOutput(this))
    // ).byteLength;
    const base = this.type ? 102 : 61;
    const extra = new Buffer(this.data.replace('0x', ''), 'hex').byteLength;
    const size = base + extra;
    this.capacity = new Amount(size.toString());
    return size;
  }

  spaceCheck() {
    if (this.capacity.lt(this.occupiedCapacity())) {
      throw new Error(
        `cell capacity ${this.capacity.toString(
          AmountUnit.ckb
        )} less than the min capacity ${this.occupiedCapacity().toString(
          AmountUnit.ckb
        )}`
      );
    }

    return true;
  }

  occupiedCapacity(): Amount {
    return new Amount(cellOccupiedBytes(this).toString(), AmountUnit.ckb);
  }

  availableFee(): Amount {
    return this.capacity.sub(this.occupiedCapacity());
  }

  toCellInput(since: string = '0x0'): CellInput | undefined {
    return this.outPoint ? new CellInput(this.outPoint, since) : undefined;
  }

  validate(): Cell {
    validators.ValidateCellOutput(transformers.TransformCellOutput(this));
    if (this.outPoint) {
      validators.ValidateCellInput(
        transformers.TransformCellInput(this.toCellInput())
      );
    }
    return this;
  }

  // CellOutput format
  serializeJson(): object {
    return {
      capacity: this.capacity.toHexString(),
      lock: this.lock,
      type: this.type,
    };
  }

  setData(data: string) {
    data = data.trim();
    const bytes = [];
    for (let i = 0; i < data.length; i++) {
      bytes.push(data.charCodeAt(i));
    }
    this.data = byteArrayToHex(bytes);
    this.spaceCheck();
  }

  setHexData(data: string) {
    data = data.trim();
    if (!data.startsWith('0x')) {
      throw new Error('Hex data should start with 0x');
    }
    this.data = data;
    this.spaceCheck();
  }

  getData(): string {
    return hexToByteArray(this.data.trim())
      .map((char) => String.fromCharCode(char))
      .join('');
  }

  getHexData(): string {
    return this.data.trim();
  }

  setSUDTAmount(amount: Amount) {
    this.data = amount.toUInt128LE() + this.data.slice(34);
  }

  getSUDTAmount(): Amount {
    const sudtAmountData = this.data.slice(0, 34);
    return Amount.fromUInt128LE(sudtAmountData);
  }

  isEmpty(): boolean {
    return this.data.trim() === '0x';
  }
}
