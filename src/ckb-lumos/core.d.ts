export interface CastToArrayBuffer {
  toArrayBuffer(): ArrayBuffer;
}

export type CanCastToArrayBuffer = ArrayBuffer | CastToArrayBuffer;

export interface CreateOptions {
  validate?: boolean;
}

export interface UnionType {
  type: string;
  value: any;
}

export function SerializeUint32(value: CanCastToArrayBuffer): ArrayBuffer;

export function SerializeUint64(value: CanCastToArrayBuffer): ArrayBuffer;

export function SerializeUint128(value: CanCastToArrayBuffer): ArrayBuffer;

export function SerializeByte32(value: CanCastToArrayBuffer): ArrayBuffer;

export function SerializeUint256(value: CanCastToArrayBuffer): ArrayBuffer;

export function SerializeBytes(value: CanCastToArrayBuffer): ArrayBuffer;

export function SerializeBytesOpt(
  value: CanCastToArrayBuffer | null
): ArrayBuffer;

export function SerializeBytesVec(
  value: Array<CanCastToArrayBuffer>
): ArrayBuffer;

export function SerializeByte32Vec(
  value: Array<CanCastToArrayBuffer>
): ArrayBuffer;

export function SerializeScriptOpt(value: object | null): ArrayBuffer;

export function SerializeProposalShortId(
  value: CanCastToArrayBuffer
): ArrayBuffer;

export function SerializeUncleBlockVec(value: Array<object>): ArrayBuffer;

export function SerializeTransactionVec(value: Array<object>): ArrayBuffer;

export function SerializeProposalShortIdVec(
  value: Array<CanCastToArrayBuffer>
): ArrayBuffer;

export function SerializeCellDepVec(value: Array<object>): ArrayBuffer;

export function SerializeCellInputVec(value: Array<object>): ArrayBuffer;

export function SerializeCellOutputVec(value: Array<object>): ArrayBuffer;

export function SerializeScript(value: object): ArrayBuffer;

export function SerializeOutPoint(value: object): ArrayBuffer;

export function SerializeCellInput(value: object): ArrayBuffer;

export function SerializeCellOutput(value: object): ArrayBuffer;

export function SerializeCellDep(value: object): ArrayBuffer;

export function SerializeRawTransaction(value: object): ArrayBuffer;

export function SerializeTransaction(value: object): ArrayBuffer;

export function SerializeRawHeader(value: object): ArrayBuffer;

export function SerializeHeader(value: object): ArrayBuffer;

export function SerializeUncleBlock(value: object): ArrayBuffer;

export function SerializeBlock(value: object): ArrayBuffer;

export function SerializeCellbaseWitness(value: object): ArrayBuffer;

export function SerializeWitnessArgs(value: object): ArrayBuffer;
