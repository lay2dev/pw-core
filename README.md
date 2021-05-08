# pw-core: A Friendly and Powerful SDK for CKB dApps

> pw-core is the front-end sdk of [pw-sdk](https://talk.nervos.org/t/lay2-pw-sdk-build-dapps-on-ckb-and-run-them-everywhere/4289)

## Quick Start

### Installation

You can install pw-core to your project with **npm**

```bash
# in your project root
$ npm install @lay2/pw-core --save
```

Or with **yarn**

```bash
# in your project root
$ yarn add @lay2/pw-core
```

### Hello World

Let's see how to send CKB with pw-core.

```javascript
import PWCore, {
  EthProvider,
  PwCollector,
  ChainID,
  Address,
  Amount,
  AddressType,
} from '@lay2/pw-core';

// insdie an async scope

const pwcore = await new PWCore('https://ckb-node-url').init(
  new EthProvider(), // a built-in Provider for Ethereum env.
  new PwCollector() // a custom Collector to retrive cells from cache server.
);

const txHash = await pwcore.send(
  new Address('0x26C5F390FF2033CbB44377361c63A3Dd2DE3121d', AddressType.eth),
  new Amount('100')
);
```

That's it! If CKB transaction (with Ethereum wallets, e.g. MetaMask) is the only thing you need, you can already start your integration with pw-core.

You can also use it in backend scenarios with `RawProvider` and `IndexerCollector`.

```javascript
import PWCore, {
  ChainID,
  Address,
  Amount,
  AddressType,
  IndexerCollector,
  RawProvider,
  Builder,
} from '@lay2/pw-core';

const provider = new RawProvider('your-private-key');
const collector = new IndexerCollector('https://ckb-indexer-url');
const pwcore = await new PWCore('https://ckb-node-url').init(
  provider,
  collector
);

const options = { witnessArgs: Builder.WITNESS_ARGS.RawSecp256k1 };
const txHash = await pwcore.send(
  new Address('0x26C5F390FF2033CbB44377361c63A3Dd2DE3121d', AddressType.eth),
  new Amount('100'),
  options
);
```

### One Step Further

However, if you need more features, such as adding multiple outputs, setting data, or adding custom lock/type scripts, you can always implement you own builder extends the `Builder` class. If you have more requirements with retriving unspent cells, a custom cell collector based on `Collector` is a good choice. The same approach applies to `Signer` / `Hasher` / `Provider`. In fact, you will find that almost every aspect of buiding a transaction can be customized to meet your demands. This is because we have well encapsulated the transaction process as **build -> sign -> send**, and any kind of transaction can be created and sent given a builder and a signer. For example, the basic `send` method used in the Hello World example is implented like this:

```typescript
// code from: https://github.com/lay2dev/pw-core/blob/master/src/core.ts#L80

import { transformers } from 'ckb-js-toolkit'
import { Address, Amount } from './models'
import { SimpleBuilder } from './builders'
import { EthSigner } from './signers'

async send(address: Address, amount: Amount, feeRate?: number): Promise<string> {
  const simpleBuilder = new SimpleBuilder(address, amount, feeRate);
  const = new EthSigner(address.addressString);
  return this.sendTransaction(simpleBuilder, ethSigner);
}

async sendTransaction(builder: Builder, signer: Signer): Promise<string> {
  return this.rpc.send_transaction(
    transformers.TransformTransaction(
      await signer.sign((await builder.build()).validate())
    )
  );
}
```

Finally, here is an [example project](https://github.com/lay2dev/simplestdapp) which shows how to implement custom classes to achieve certain features. The `SDCollector` can collect unspent cells with a [ckb-indexer](https://github.com/quake/ckb-indexer), while the `SDBuilder` can build transactions for creating / updating / deleting cells. More over, the built-in `EthProvider` and `EthSigner` (along with `Keccak256Hasher`) are used to make this dApp runnable in Ethereum enviromment (such as MetaMask).

## Highlights

- ### Concise API

  We only provide two types of interfaces, one is the most commonly used and the other is fully customizable. For example, you can use `pwcore.send` to just send some CKB, and use `pwcore.sendTransaction` to send any type of transactions. More over, you can even use `pwcore.rpc` to get direct access to ckb rpc calls, which enables abilities far beyond sending transactions.

* ### Thoughtful Models

  Talk is cheap, let's show some code.

  ```typescript
  /* ------ Address ------ */
  
  /* create an Address instance from a CKB address */
  const ckbAddress = new Address('ckb1qyqdmeuqrsrnm7e5vnrmruzmsp4m9wacf6vsxasryq', AddressType.ckb);

  /* create an Address instance from an Ethereum address */
  const ethAddress = new Address('0x308f27c8595b2ee9e6a5faa875b4c1f9de6b679a', AddressType.eth);

  /* get the original address string */
  console.log('ckb: ', ckbAddress.addressString)  
  console.log('eth: ', ethAddress.addressString)
  // ckb: ckb1qyqdmeuqrsrnm7e5vnrmruzmsp4m9wacf6vsxasryq
  // eth: 0x308f27c8595b2ee9e6a5faa875b4c1f9de6b679a

  /* get the corresponding CKB address */
  console.log('ckb: ', ckbAddress.toCKBAddress())
  console.log('eth: ', ethAddress.toCKBAddress())
  // ckb: ckb1qyqdmeuqrsrnm7e5vnrmruzmsp4m9wacf6vsxasryq
  // eth: ckt1q3vvtay34wndv9nckl8hah6fzzcltcqwcrx79apwp2a5lkd07fdxxvy0yly9jkewa8n2t74gwk6vr7w7ddne5jrkf6c

  /* get the corresponding lock script hash (with the toHash method of class Script) */
  console.log('ckb: ', ethAddress.toLockScript().toHash())
  console.log('eth: ', ethAddress.toLockScript().toHash())
  // ckb: 0xe9e412caf497c69e9612d305be13f9173752b9e75bc5a9b6d1ca51eb38d07d59
  // eth: 0x0963476f28975bf93da673cd2442bd69c4b2d4e720af5a67ecece8a03b8926b5

  /* check if the address is an ACP address */
  console.log('ckb: ', ckbAddress.isAcp())
  console.log('eth: ', ethAddress.isAcp())
  // false
  // true

  // get the minimal CKB amount (an Amount instance) you can transfer to this address
  console.log('ckb: ', ckbAddress.minPaymentAmount().toString() + ' CKB')
  console.log('eth: ', ethAddress.minPaymentAmount().toString() + ' CKB')
  // 61 CKB
  // 0.00000001 CKB

  /* ------ Script ------ */
  
  const lockScript = addressCkb.toLockScript();
  const lockScriptHash = lockScript.toHash();
  const address1 = Address.fromLockScript(lockScript);
  const address2 = lockScript.toAddress();

  console.log(addressEth.toLockScript().sameWith(addressCkbFull.toLockScript()));
  //true

  /* ------ Amount ------ */
  
  const ckb100 = new Amount('100');
  const shannon100 = new Amount('100', AmountUnit.shannon);
  const usdt = new Amount('1234.5678', 6); // Assume usdt's decimals is 6

  /* format */

  console.log(`${ckb100.toString()} CKB is ${ckb100.toString(AmountUnit.shannon, {commify: true})} Shannon`);
  // 100 CKB is 1,000,000 Shannon

  console.log(`${shannon100.toString(AmountUnit.shannon)} Shannon is ${shannon100.toString()} CKB`)
  // 100 Shannon is 0.000001 CKB

  console.log(`${usdt.toString(6, {fixed: 2, commify: true})} USDT is rounded from ${usdt.toString(6, {pad: true})} USDT`);
  // 1,234.57 USDT is rounded from 1234.567800 USDT

  /* compare */

  console.log('100 CKB is greater than 100 Shannon: ', ckb100.gt(shannon100));
  console.log('100 CKB is less than 100 Shannon: ', ckb100.lt(shannon100));
  // 100 CKB is greater than 100 Shannon: true
  // 100 CKB is less than 100 Shannon: false

  console.log('100 Shannon is equal to 0.000001 CKB: ', shannon100.eq(new Amount('0.000001')));
  // 100 Shannon is equal to 0.000001 CKB: true

  /* calculate */

  console.log(`100 CKB + 100 Shannon = ${ckb100.add(shannon100).toString()} CKB`);
  console.log(`100 CKB - 100 Shannon = ${ckb100.sub(shannon100).toString()} CKB`);
  // 100 CKB + 100 Shannon = 100.000001 CKB
  // 100 CKB - 100 Shannon = 99.999999 CKB

  // Amount is assumed with unit, so if we want to perform multiplication or division, the best way is to convert the Amount instance to JSBI BigInt, and convert  back to Amount instance if necessary.
  const bn = JSBI.mul(ckb100.toBigInt(), JSBI.BigInt(10));
  const amount = new Amount(bn.toString())
  console.log(`100 CKB * 10 = ${amount.toString(AmountUnit.ckb, {commify: true})} CKB`);
  // 100 CKB * 10 = 1,000 CKB

  /* ------ Cell ------ */
  
  /* load from blockchain with a rpc instance and an outpoint */
  const cell1 = Cell.loadFromBlockchain(rpc, outpoint);

  /* convert rpc formated data to a Cell instance */
  const cell2 = Cell.fromRPC(rpcData);

  /* check how many capacity is occupied by scripts and data */
  const occupiedCapacity = cell1.occupiedCapacity();

  /* check if the cell's capacity is enough for the actual size */
  cell1.spaceCheck();

  /* check if the cell is empty (no data is stored) */
  cell2.isEmpty()

  /* adjust the capacity to the minimal value of this cell */
  cell2.resize();

  /* set / get amount of an sUDT cell */
  const cell3 = cell2.clone();
  cell3.setSUDTAmount(new Amount(100));
  console.log('sUDT amount: ', cell3.getSUDTAmount().toString());
  // sUDT amount: 100

  /* playing with data */
  cell1.setData('data');
  cell2.setHexData('0x64617461');
  console.log('data of cell 1: ', cell1.getData());
  console.log('data of cell 2: ', cell1.getData());
  console.log('hex data of cell 1: ', cell1.getHexData());
  // data of cell 1: data
  // data of cell 2: data
  // hex data of cell 1: 0x64617461
  ```

- ### Simple and Clear Structure

CKB dApp development is mostly about manipulating cells. However, when we actually try to design a dApp, it turns out that we are always dealing with transactions. If you ever tried to build a CKB transaction, you'll definitely be impressed (or most likely, confused) by the bunch of fields. Questions may be asked like:

> There are data structures like 'CellInput' and 'CellOutput', but where is 'Cell' ?
>
> How to calculate the transaction fee? How to adjust the change output?
>
> What kind of unit ( CKB or Shannon) and format (mostly hex string) to use?

Things are different with pw-core. Let's see the actual constructor of `RawTransaction`

```typescript
// code from: https://github.com/lay2dev/pw-core/blob/master/src/models/raw-transaction.ts#L7

export class RawTransaction implements CKBModel {
  constructor(
    public inputCells: Cell[],
    public outputs: Cell[],
    public cellDeps: CellDep[] = [
      PWCore.config.defaultLock.cellDep,
      PWCore.config.pwLock.cellDep,
    ],
    public headerDeps: string[] = [],
    public readonly version: string = '0x0'
  ) {
    this.inputs = inputCells.map((i) => i.toCellInput());
    this.outputsData = this.outputs.map((o) => o.getHexData());
  }

  // ...
}
```

It's easy to findout that both inputs and outputs are Array of cells, and the low-level details and transformations are done silently. And yes, we have the 'Cell' structure.

- ### Work With or Without pw-lock

  Although pw-core works closely with pw-lock (both projects are components of pw-sdk), you can still use the default blake2b lock or your own lock, as long as the corresponding builder, signer and hasher are implemented. In fact, the `Blake2bHasher` is already built-in, and a `CkbSigner` is very likely to be added in the near future. With the progress of pw-sdk, more algorithm be added to the built-in collections, such as `Sha256Hasher` and `P256Signer`.

## API Document

You can find a detailed [API Document Here](https://docs.lay2.dev).

## Get Involved

Currently pw-core is still at a very early stage, and all kinds of suggestions and bug reports are very much welcomed. Feel free to open an issue, or join our [Discord](https://discord.gg/ZuFQGCx) server to talk directly to us. And of couse, a **star** is very much appreciated :).
