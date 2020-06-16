# pw-core

The front-end SDK of pw-sdk

> There will be a big update on this document soon.

---

# Classes

## PWCore

### constructor

Create a PWCore instance.

> @params

- **nodeUrl**: string, the CKB node url.

> @return

- A `PWCore` instance.

```typescript
const pwcore = new PWCore('https://lina.ckb.dev');
```

### init

Initialize the needed ckb environment for pw-core.

> @params

- **_chainId_**: [ChainID](#chainid), optional, id of the ckb network. If not provided, the chainId will be decided by a rpc call to the node provided in the constructor.
- **_config_**: [Config](#config), optional if `chainId` is `ChainID.ckb` or `ChainID.ckb_testnet`, otherwise this field is required, and an exception will be thrown if not provided.

> @return

- A `Promise<void>` object.

### rpc

Get a RPC handler to communate with the ckb blockchain. Check the full list of [avaliable RPC methods](https://github.com/nervosnetwork/ckb/tree/develop/rpc).

> @return

A readonly [RPC](https://github.com/xxuejie/ckb-js-toolkit#rpc) (from package '[ckb-js-toolkit](https://www.npmjs.com/package/ckb-js-toolkit)') instance.

```typescript
const info = await rpc.get_blockchain_info();
// info:
// {
//   alerts: [],
//   chain: 'ckb',
//   difficulty: '0x5bb23548f6795',
//   epoch: '0x708047900028b',
//   is_initial_block_download: true,
//   median_time: '0x170aee25ea5'
// }
```

### send

Send ckb to some address.

> @params

- **address**: Address, the reciever's address.
- **amount**: Amount, the amount (capacity) of ckb to be sent.
- **_feeRate_**: string, optional, a string of decimal feeRate value in unit **Shannons / KB**. The minium value is '1000'.

> @return

- A `Promise<string>` object. If succeed the transaction hash will be resolved.

### sendTransaction

Send a fully customizable ckb transaction.

> @params

- **builder**: [Builder](#builder), the builder used to build the raw transaction.
- **signer**: [Signer](#signer), the signer used to sign the raw transaction.

> @return

- A `Promise<string>` object. If succeed the transaction hash will be resolved.

### getBalance

Get balance of any address.

> @params

- **address**: [Address](#address), the address to be checked.
- **_collector_**: [Collector](#collector), optional, the cell collector to be used. If not provided, the RPC collector will be applied.

> @return

- An [Amount](#amount) object, the balance of the above address.

## Builder

An abstract class to build raw transaction.

### constructor

> @params

- **outputs**: [ReceivePair](#receivepair)[], an array contains the output information.
- **feeRate**: string, a string of decimal feeRate value in unit **Shannons / KB**. The minium value is '1000'.
- **collector**: [Collector](#collector), the cell collector used to get unspent cells for inputs.

### build

An abstract method which actually builds the raw transaction.

> @return

- A `Promise<RawTransaction>` object. If succeed, the built [RawTransaction](#rawtransaction) instance will be resolved.

Below is a sample builder implementation to help you start easier.

```typescript
 class SimpleBuilder extends Builder {
  constructor(
    address: Address,
    amount: Amount,
    collector: CellCollector,
    feeRate?: string
  ) {
    super([{ address, amount }], feeRate, collector);
  }

  async build(): Promise<RawTransaction> {
    const rawTx: RawTransaction = {
      version: '0x0',
      cell_deps: [PWCore.config.pwLock.cell_dep],
      header_deps: [],
      inputs: [],
      outputs: [],
      outputs_data: ['0x'],
    };

    const output: CellOutput = {
      capacity: this.outputs[0].amount.toHexString(),
      lock: this.outputs[0].address.toLockScript(),
    };
    rawTx.outputs.push(output);

    const neededAmount = Amount.ADD(this.outputs[0].amount, MIN_CHANGE);

    let inputSum = new Amount('0');
    for await (const cell of this.collector.collect()) {
      rawTx.inputs.push(cell.out_point as CellInput);
      inputSum = Amount.ADD(
        inputSum,
        new Amount((cell.cell_output as CellOutput).capacity)
      );
      if (Amount.GTE(inputSum, neededAmount)) break;
    }

    if (Amount.LT(inputSum, this.outputs[0].amount)) {
      throw new Error(
        `input capacity not enough, need ${this.outputs[0].amount.toString(
          AmountUnit.ckb
        )}, got ${inputSum.toString(AmountUnit.ckb)}`
      );
    }

    const fee = Builder.calcFee(
      { raw: rawTx, witness: dummyWitness },
      this.feeRate
    ).toHexString();

    return rawTx;
  }
```

## Signer

An abstract class to sign a raw transaction and return the sendable transaction.

### constructor

> @params

- **fromAddress**: [Address](#address), the sender's address.

### toBytes

A method helps you to transform raw transaction to signable byte array. You can use it in your sign function.

> @return

- An `Uint8Array` which contains the serialized and transformed raw transaction data.

### sign

A abstract method to sign the raw transaction.

> @params

- **rawTx**: [RawTransaction](#rawtransaction), the raw transaction built by a builder.

> @return

- A `Promise <Transaction>` object. If succeed, the signed Transaction instance will be resolved.

## Collector

An abstract class to retrieval unspent cells for inputs.

### constructor

> @params

- **amount**: [Amount](#amount), the total capacity of unspent cells needed.

### collect

An abstract method which collects the needed unspent cells.

> @return

- A `Promise<Cell[] | undefined>` object. If the requirements are all met, the collected [Cell](#cell) instances will be resolved.

## Cell

### constructor

> @params

- **capacity**: [Amount](#amount), capacity of the cell.
- **_lock_**: [Script](#script), optional, lock script of the cell. If not provided, pw-lock will be applied.
- **_type_**: [Script](#script), optional, type script of the cell.
- **_outPoint_**: [OutPoint](#outpoint), optional, info to locate the cell.
- **_data_**: string, optional, data of the cell.

### loadFromBlockchain [static]

Load a cell by out point with rpc call.

> @params

- **outPoint**: [OutPoint](#outpoint), info to locate the cell.

> @return

- A `Promise<Cell | undefined>` object. If the out point exists on the blockchain, a [Cell](#cell) instance filled with on-chain data will be resolved.

### setData

Set the content of cell's `data` field. You can pass the raw string content and leave the hex tranformation to be done by this method.

> @params

- data: string, the content of the data, will be transformed into hex format automatically.

> @return

- The actual content set in the `data` field.

## Address

### constructor

> @params

- **address**: string, the address string.
- **type**: [AddressType](#addresstype), the format of the address above, such as ckb, eth, etc.

> @return

- An `Address` instance.

### fromLockScript [static]

Create an Address instance from a lock script.

> @params

- **lockScript**: [Script](#script), the lock script used to create a ckb address.

> @return

- An `Address` instance.

### toCKBAddress

Get a ckb format address.

> @return

- A ckb address string. If `type` of the instance is `AddressType.ckb`, the original string will be returned; Otherwise a [full-payload address](https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0021-ckb-address-format/0021-ckb-address-format.md#full-payload-format) string will be returned.

```typescript
const address1 = new Address(
  '0x90C132C127916B458d096D429477e108B4180D1D',
  AddressType.eth
);

const ckbAddress1 = address1.toCKBAddress();

// ckbAddress1 (testnet): ckt1qsp6sv9mzzjlx3r9g0yxjthn83qe7pxwx8ppfcta3jg9ejrt8fwanyxpxtqj0yttgkxsjm2zj3m7zz95rqx36m858ne

const address2 = new Address(
  'ckb1qyqv5sdzfnfcy4rstumjvqgsfcrecem70ers7a0frk',
  AddressType.ckb
);

const ckbAddress2 = address2.toCKBAddress();

// ckbAddress2 (main-net): ckb1qyqv5sdzfnfcy4rstumjvqgsfcrecem70ers7a0frk
```

### toLockScript

Get a lock script object.

> @return

- A [Script](#script) object which represents the lock script corresponding to this address.

```typescript
const address = new Address('0x90C132C127916B458d096D429477e108B4180D1D');

const lockScript = address.toLockScript();

//	lockScript: {
//		code_hash: '0xac8a4bc065...f8bb58682f', // truncated
//		args: '0x90C132C127916B458d096D429477e108B4180D1D',
//		hash_type: 'type'
//	}
```

### toLockScriptHash

Get the hash string of the LockScript object provided above.

> @return

- A blake2b hash string of the lock script corresponding to this address.

```typescript
const address = new Address('0x90C132C127916B458d096D429477e108B4180D1D');

const lockHash = address.toLockScriptHash();

// lockHash:
```

## Amount

### constructor

> @params

- **amount**: string, decimal value in string format.
- **unit:** [AmountUnit](#amountunit), optional, default value is `AmountUnit.ckb`.

> @return

- An `Amount` instance.

### toString

> @params

- **unit**: [AmountUnit](@amountunit), indicates which unit will be used when generating the string.
- **options**: [FormatOptions](@formatoptions), optional, indicates additional format options when generating the string.

> @return

- A string of the amount value according to requirements of unit and options.

```typescript
const ckb1 = new Amount('1', AmountUnit.ckb);
const shannon1 = new Amount('1', AmountUnit.shannon);
const shannon1M = new Amount('1000000', AmountUnit.shannon);
const shannon1T = new Amount('1000000000000', AmountUnit.shannon);

const ckb1String = ckb1.toString(AmountUnit.shannon);
// ckb1String: '1000000000'

const shannon1String = shannon1.toString(AmountUnit.ckb);
// shannon1String: '1'

const shannon1MString = shannon1M.toString(AmountUnit.ckb);
// shannon1MString: '0.01'

const shannon1MPaddedString = shannon1M.toString(AmountUnit.ckb, { pad: true });
// shannon1MPaddedString: '0.01000000'

const shannon1TString = shannon1T.toString(AmountUnit.ckb, { commify: true });
// shannon1TString = '10,000'
```

### toBigInt

> @return

- A `JSBI.BigInt` instance, with the shannon value.

```typescript
const amount = new Amount('1', AmountUnit.ckb);
const amountBN = amount.toBigInt();
const result = JSBI.EQ(amountBN, JSBI.BigInt('100000000'));
// result: true
```

### toHexString

> @return

- A hex string of the shannon value, with '0x' prefix.

```typescript
const amount = new Amount('1', A);
const amountHexString = amount.toHexString();
// amountHexString: '0x5f5e100'
```

### static functions for calculation and comparison

A bunch of functions for calculation and comparison between Amount instances, including:

- **ADD** / **SUB**, for add and substract calculations. They all take two Amount instances as parameters and will return an Amount instance with value of the calculation result.
- **GT** / **GTE** / **LT** / **LTE** / **EQ**, for comparison actions. They all take two Amount instances as parameters and will return a boolean value which indicates the comparison result.

```typescript
const amount1 = new Amount('1', AmountUnit.ckb);
const amount2 = new Amount('2', AmountUnit.ckb);

const sum = Amount.ADD(amount1, amount2).toString(AmountUnit.ckb);
// sum: '3'

const sub = Amount.SUB(amount2, amount1).toString(AmountUnit.ckb);
// sub: '1'

const gt = Amount.GT(amount1, amount2);
// gt: false

const lte = Amount.LTE(amount1, amount1);
// lte: true
```

---

# Interfaces

## Config

Config object which contains need environment variables, such as the type script of Nervos DAO, the default lock script, etc. The content is defined in [ConfigItem](#configitem) interface.

```typescript
interface Config {
  daoType: ConfigItem;
  defaultLock: ConfigItem;
  multiSigLock: ConfigItem;
  pwLock: ConfigItem;
}
```

The sdk will preset the Config object of ckb main-net (Lina) and testnet (Aggron). If you are using a self-ran dev-chain, you should provide your own Config object in the [init](#init) function.

## ConfigItem

Content item object of Config. For example, if we have a ConfigItem object named `pwLock`, which represents the information we needed to use pw-lock, then `pwLock.cell_dep` tells which cell should we refer in `cell_deps` field of the transaction, and `pwLock.script` will give you the `code_hash` and `hash_type` of pw-lock, while you can replace the default '0x' value of `args` with your actual value.

```typescript
interface ConfigItem {
  cell_dep: CellDep;
  script: Script;
}
```

A sample ConfigItem object for pwLock:

```typescript
pwLock: {
	cell_dep: {
  	dep_type: DepType.code,
  	out_point: {
    	index: '0x0',
      tx_hash: '0x07a824df04...7b57c05856', // truncated
  	},
	},
  script: {
    args: '0x',
    code_hash: '0xac8a4bc065...f8bb58682f', // truncated
    hash_type: HashType.type,
  },
}
```

## CellDep

```typescript
interface CellDep {
  dep_type: DepType;
  out_point: OutPoint;
}
```

## Script

```typescript
interface Script {
  code_hash: string;
  args: string;
  hash_type: HashType;
}
```

## OutPoint

```typescript
interface OutPoint {
  tx_hash: string;
  index: string;
}
```

## FormatOptions

```typescript
interface FormatOptions {
  section?: 'full' | 'whole' | 'fraction';
  pad?: boolean;
  commify?: boolean;
}
```

---

# Enums

## ChainID

Defines the valid chainId values.

```typescript
enum ChainID {
  ckb = 'ckb',
  ckb_testnet = 'ckb_testnet',
  ckb_dev = 'ckb_dev',
}
```

## DepType

```typescript
enum DepType {
  code = 'code',
  depGroup = 'depGroup',
}
```

## HashType

```typescript
enum HashType {
  data = 'data',
  type = 'type',
}
```

## AddressType

```typescript
enum AddressType {
  ckb,
  btc,
  eth,
  eos,
}
```

## AmountUnit

```typescript
enum AmountUnit {
  ckb,
  shannon,
}
```

## ReceivePair

```typescript
interface ReceivePair {
  address: Address;
  amount: Amount;
}
```

## RawTransaction

```typescript
interface RawTransaction {
  version: string;
  cell_deps: CellDep[];
  header_deps: string[];
  inputs: CellInput[];
  outputs: CellOutput[];
  outputs_data: string[];
}
```

## Transaction

```typescript
interface Transaction {
  raw: RawTransaction;
  witness: string[];
}
```

## CellInput

```typescript
interface CellInput {
  since: string;
  previous_output: OutPoint;
}
```

## CellOutput

```typescript
interface CellOutput {
  capacity: string;
  lock: Script;
  type?: Script;
}
```

## OutPoint

```typescript
interface OutPoint {
  tx_hash: string;
  index: string;
}
```
