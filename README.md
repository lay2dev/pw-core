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
  /* Address */
  const addressCkb = new Address(
    'ckt1qyqxpayn272n8km2k08hzldynj992egs0waqnr8zjs',
    AddressType.ckb
  );

  const addressEth = new Address(
    '0x32f4c2df50f678a94609e98f8ee7ffb14b6799bc',
    AddressType.eth
  );

  const addressCkbFull = new Address(
    'ckt1qjmk32srs9nx345sgj0xrcq6slzx5ta3vt8azm4py95aalx7qq2agvh5ct04panc49rqn6v03mnllv2tv7vmc2z5pkp',
    AddressType.ckb
  );

  console.log(addressEth.toCKBAddress());
  //'ckt1qjmk32srs9nx345sgj0xrcq6slzx5ta3vt8azm4py95aalx7qq2agvh5ct04panc49rqn6v03mnllv2tv7vmc2z5pkp'

  /* Script */
  const lockScript = addressCkb.toLockScript();
  const lockScriptHash = lockScript.toHash();
  const address1 = Address.fromLockScript(lockScript);
  const address2 = lockScript.toAddress();

  console.log(addressEth.toLockScript().sameWith(addressCkbFull.toLockScript()));
  //true

  /* Amount */
  const ckb100 = new Amount('100');
  const ckb1M = new Amount('1000000');
  const shannon1k = new Amount('1000', AmountUnit.shannon);
  const shannon10B = new Amount('10000000000', AmountUnit.shannon);

  console.log(ckb100.eq(shannon10B)); //true
  console.log(ckb100.lt(shannon1k)); //false

  const result = ckb1M.add(ckb100).sub(shannon1k);
  console.log(result.eq(new Amount('1000099.99999'))); //true

  console.log(ckb100.toString(AmountUnit.shannon)); //'10000000000'
  console.log(ckb100.toHexString()); //'0x2540be400'

  console.log(result.toString(AmountUnit.ckb, {
    pad: true, commify: true
  })); //'1,000,099.99999000'

  console.log(result.toString(Amount), { section: 'integer' })); //'1000099'
  console.log(result.toString(Amount), { section: 'integer', commify: true })); //'1,000,099'
  console.log(result.toString(Amount), { section: 'decimal' })); //'99999'
  console.log(result.toString(Amount), { section: 'decimal', pad: true })); //'99999000'

  /* Cell */
  const cell = new Cell(new Amount('100'), PWCore.provider.address.toLockScript());

  cell.setData('Hello from Lay2');
  console.log(cell.getHexData()); //'0x48656c6c6f2066726f6d204c617932'
  cell.setHexData('0x48656c6c6f204261636b');
  console.log(cell.getData()); //'Hello Back'

  cell.setData('a looooooooooooooooooooooong data');
  cell.resize(); // cell.capacity will be adjusted to the actual space usage.
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
