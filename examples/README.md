# PW-Core Examples

## Setup

The following commands will install the necessary dependencies, and build the necessary `js` files. 

```sh
cd pw-core/examples
npm i
npm run build
```

## Using the Examples

The examples available can be run using `nodejs` from the console. Most examples use `RawProvider` so they operate in a console without a browser. When used in a browser environment, switching in another provider is often the only change required.

```typescript
RawProvider(PRIVATE_KEY)
```

becomes

```typescript
EthProvider()
```

## Examples

### Basic Transfer: CKB Address to ETH Address (hello-world.ts) 

This is a basic example using the built-in `PWCore.send()` method to do a transfer of CKB from a native CKB address (Default Lock; CKB2021) to a CKB/ETH address on-chain (Omni Lock; ETH; CKB2021).

```bash
nodejs hello-world.js
```

```txt
Sending from: ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqf8y2wrqq8y3up36e8mqg3tj8wkeyqs8uccxpsdt
Sending to: ckt1qpuljza4azfdsrwjzdpea6442yfqadqhv7yzfu5zknlmtusm45hpuqgp02hlt9k9uhnc3ml6p055vq2t09xdmr23qqx8wz0x
Amount: 100 CKB
Transaction Hash: 0x12de0ec135ff6cac2a0e890aa0bcca3a73fdf454b67e4d2a3193f6deb1fe4fd4
Explorer URL: https://explorer.nervos.org/aggron/transaction/0x12de0ec135ff6cac2a0e890aa0bcca3a73fdf454b67e4d2a3193f6deb1fe4fd4
```

### Basic Transfer: ETH Address to CKB Address Using SimpleBuilder (eth-to-ckb.js)

This example uses the provided `SimpleBuilder` to do a transfer of CKB from an CKB/ETH address (Omni Lock; ETH; CKB2021) to a native CKB address (Default Lock; CKB2021).

```bash
nodejs eth-to-ckb.js
```

```txt
Sending from: ckt1qpuljza4azfdsrwjzdpea6442yfqadqhv7yzfu5zknlmtusm45hpuqgp02hlt9k9uhnc3ml6p055vq2t09xdmr23qqx8wz0x
Sending to: ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqf2kfe0pqg9444u7ct852nhc9cm72gvj3q7u4ynf
Amount: 100 CKB
Transaction Hash: 0x18e184d30e03ffc21540f3ac8e49a56a8fbd3a4574b67d0d7d109022db7ebe94
Explorer URL: https://explorer.nervos.org/aggron/transaction/0x18e184d30e03ffc21540f3ac8e49a56a8fbd3a4574b67d0d7d109022db7ebe94
```

### Migrate funds from a PW-Lock based ETH Address to an Omni Lock based ETH Address (eth-pw-to-eth-omni.js)

This example uses a custom builder `PWLockMigrationBuilder` to do a transfer of CKB from an ETH address (PWLock; ETH; Pre2021) to another ETH address (Omni Lock; ETH; CKB2021).

In this example, both the source and destination share the same private key, meaning they are controlled by the same individual. The source is using the older PW-Lock with the now deprecated pre-2021 address format, and the destination is using the new Omni Lock with the new CKB2021 address format.

```bash
nodejs eth-pw-to-eth-omni.js
```

```txt
Sending from: ckt1q3vvtay34wndv9nckl8hah6fzzcltcqwcrx79apwp2a5lkd07fdxx7407ktvte083rhl5zlfgcq5k72vmkx4zl2ye54
Sending to: ckt1qpuljza4azfdsrwjzdpea6442yfqadqhv7yzfu5zknlmtusm45hpuqgp02hlt9k9uhnc3ml6p055vq2t09xdmr23qqx8wz0x
Amount: 100 CKB
Transaction Hash: 0x7c4fd4792962357ea939ee9864871af1e47d2228a29b88920d26fd565f3e3773
Explorer URL: https://explorer.nervos.org/aggron/transaction/0x7c4fd4792962357ea939ee9864871af1e47d2228a29b88920d26fd565f3e3773
```

### Mint an SUDT Token (mint-sudt-ckb-to-ckb.ts)

This example uses a custom builder `SUDTMintBuilder` to mint SUDT tokens from a native CKB address (Default Lock; CKB2021).

```bash
nodejs mint-sudt-ckb-to-ckb.js
```

```txt
Minting from: ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqf8y2wrqq8y3up36e8mqg3tj8wkeyqs8uccxpsdt
Sending to: ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqf8y2wrqq8y3up36e8mqg3tj8wkeyqs8uccxpsdt
Amount: 100000000 SUDT Tokens
Transaction Hash: 0xd5a4d63fff1d77f834b8947dc3b4c9d36c47237d0f06c7595f6c4506ca39b383
Explorer URL: https://explorer.nervos.org/aggron/transaction/0xd5a4d63fff1d77f834b8947dc3b4c9d36c47237d0f06c7595f6c4506ca39b383
```

### Send an SUDT Token (send-sudt-ckb-to-ckb.ts)

This example uses the built-in `PWCore.sendSUDT()` method to do a transfer of SUDT tokens from a native CKB address (Default Lock; CKB2021) to another native CKB address (Default Lock; Pre2021; Short Format).

```bash
nodejs send-sudt-ckb-to-ckb.js
```

```txt
Sending from: ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqf8y2wrqq8y3up36e8mqg3tj8wkeyqs8uccxpsdt
Sending to: ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqw9ewakfvrp7cs2eqe9gx8e2fd0txhxetqn380ka
Amount: 100 SUDT Tokens
Transaction Hash: 0x6e4085e19aa507d152dd084c943f2fe10fb03c72ff44a0f7afc74aa000bda34c
Explorer URL: https://explorer.nervos.org/aggron/transaction/0x6e4085e19aa507d152dd084c943f2fe10fb03c72ff44a0f7afc74aa000bda34c
```

### Getting a CKB and SUDT Token Balance (ckb-sudt-balance.ts)

This example uses the built-in `PWCore.getBalance()` and `PWCore.getSUDTBalance()` methods to check the CKB and SUDT balance.

```bash
nodejs ckb-sudt-balance.js
```

```txt
Address: ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqf8y2wrqq8y3up36e8mqg3tj8wkeyqs8uccxpsdt
SUDT ID: 0x34c325c9859211a3e2ef9cdc5fe48becbd7d85e600fb408767ed7184763b9c61
CKB Balance: 24,549.99964342 CKB
SUDT Balance: 99,999,970,099,999,400 Tokens
```

### Burning SUDT Tokens (burn-sudt.ts)

This example uses a custom builder `SUDTBurnBuilder` to burn SUDT tokens from a native CKB address (Default Lock; CKB2021).

```bash
nodejs burn-sudt.js
```

```txt
Address: ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqf8y2wrqq8y3up36e8mqg3tj8wkeyqs8uccxpsdt
SUDT ID: 0x34c325c9859211a3e2ef9cdc5fe48becbd7d85e600fb408767ed7184763b9c61
SUDT Balance: 99,999,970,099,999,300 Tokens
Amount to Burn: 100 Tokens
Transaction Hash: 0x9c4487608e4b6783f50c886bcfe7b6adb0be847a00ede43898e2764986f445d9
Explorer URL: https://explorer.nervos.org/aggron/transaction/0x9c4487608e4b6783f50c886bcfe7b6adb0be847a00ede43898e2764986f445d9
```
