# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.4.0-alpha.6](https://github.com/lay2dev/pw-core/compare/v0.2.2...v0.4.0-alpha.6) (2021-03-08)


### ⚠ BREAKING CHANGES

* **core:** When you call API pwcore.sendTransaction/pwcore.sendUSDT/pwcore.send, you need wrap
feeRate to a Object if it is included in the parameter list.
* **transaction, signer:** required parameter 'witnessArgs' is added to Transaction's contructor. the default
values can be found in static attribute WITNESS_ARGS of Builder.

### Features

* **core:** change parameters for pwcore.send ([7b59b79](https://github.com/lay2dev/pw-core/commit/7b59b79959fa5a128b8aebe3d140e5fa70f879bf))
* impl raw-provider and indexer-collector ([989a4f9](https://github.com/lay2dev/pw-core/commit/989a4f973a65c4202b625dd69d1ed1a4502673a2))
* **acp:** add acp builder for simple builder ([6b11497](https://github.com/lay2dev/pw-core/commit/6b1149746c9e0e6b30049da1ae76c410dc83b3ab))
* **address:** add 2 api for address. isAcp & minPaymentAmount ([f7ae547](https://github.com/lay2dev/pw-core/commit/f7ae547f92f58b797c269a77b4bf0b8f49c96807))
* **address:** add getEosPublicKey api for address ([576ac4f](https://github.com/lay2dev/pw-core/commit/576ac4ffe641eddb2ea6b9cd1a0baa1cfeffacde))
* **address:** fix typo err ([a5b3c39](https://github.com/lay2dev/pw-core/commit/a5b3c39f02a2e8030294b568013b1f1e073799ad))
* **address:** merge sudt branch, implemented address interface: isAcp, minPaymentAmount ([919f3eb](https://github.com/lay2dev/pw-core/commit/919f3ebdc45c9e3189c8655158fe16eb02a4f764))
* **amount:** add 'fixed' to FormatOptions, which enables toFixed style format ([93439ea](https://github.com/lay2dev/pw-core/commit/93439ea31ea3b0656b0e8c93add33047fcf88b81))
* **config:** update sudt config on aggron ([0c81e17](https://github.com/lay2dev/pw-core/commit/0c81e179c39a17b8d0ef2bdcb1e6af1612063102))
* **merge master:** merge master branch ([2623a4e](https://github.com/lay2dev/pw-core/commit/2623a4ee8e097ddf1201888f7671d8f538337290))
* **provider:** create a new provider to support wallet connect ([07d7df8](https://github.com/lay2dev/pw-core/commit/07d7df8665f273f89709b0279ee53478c5b0ef79))
* **pw-collector:** now we can pass the api base url to PwCollector in constructor ([80cf09c](https://github.com/lay2dev/pw-core/commit/80cf09c5a5b0f1b22468b35143bcc16ce942af96))
* **signer:** remove eos & tron signer ([bec6924](https://github.com/lay2dev/pw-core/commit/bec69247686f45078f60a968264619c696b9744a))
* **sudt:** finish sudt create acp builder ([55863d9](https://github.com/lay2dev/pw-core/commit/55863d9b10bcacd039722afc9090e6668a12e136))
* **sudt:** merge sudt ([ca40a0b](https://github.com/lay2dev/pw-core/commit/ca40a0b22cf96a8911386a07a8d6726bf587277a))
* **sudt-builder:** add simple sudt create acp ([31f54ec](https://github.com/lay2dev/pw-core/commit/31f54ec459052dab6765466078bc04aa259c783b))
* **utils:** implement verifyEosAddress and verifyTronAddress ([58d9fdf](https://github.com/lay2dev/pw-core/commit/58d9fdf9c056013de1acb907eef83bdab6b815e6))
* add eos&tron support ([c28110f](https://github.com/lay2dev/pw-core/commit/c28110ff1e3bd44b7672ef2c984a892ae7447f84))


### Bug Fixes

* sign error ([9e3820a](https://github.com/lay2dev/pw-core/commit/9e3820a5a60f1ddcfbc79b75404c62425eb4b6a5))
* sudt-builder bug ([430d60d](https://github.com/lay2dev/pw-core/commit/430d60d40b15ad23c66675f702f2d9547963bd0e))
* **amount:** change all BigInto to JSBI.BigInt in utils.ts ([777bba9](https://github.com/lay2dev/pw-core/commit/777bba9db6daeb4ad3501e8a7beb627333f73a1e))
* **eth-provider:** add platform byte for witness lock of eth type ([69d99fa](https://github.com/lay2dev/pw-core/commit/69d99faeb89b846aabcd83cac057ac871a6d4e38))
* **eth-signer:** remove test privkeys and ecsign, use sendAsync ([129deba](https://github.com/lay2dev/pw-core/commit/129deba2f1c2ad31df4910b24cfdb11f4e752b11))
* **package.json:** bump version to 0.2.5 ([e7ee1d8](https://github.com/lay2dev/pw-core/commit/e7ee1d86bec850ca198664395e0c3cdc28f6b6eb))
* **sudt:** fix tx build bugs: sudt amount not change ([838fbcd](https://github.com/lay2dev/pw-core/commit/838fbcd1f862b8ac5fcd1d8ab9e8d0d598fdbc37))
* **sudtcollector:** make pwcollecotr extends from sudtcollector ([065bc5d](https://github.com/lay2dev/pw-core/commit/065bc5d897052b9961325bbf9b56497b1cf6f87b))
* **utils, script:** fix generateAddress and parseAddress, more test for script.toAddress ([7509e0a](https://github.com/lay2dev/pw-core/commit/7509e0a155f59094ea6f1c63b5c0275851cee93c))
* **web3modalprovider:** add platform byte to witness lock ([d0177c0](https://github.com/lay2dev/pw-core/commit/d0177c0b67c03320e224c7b0380eed51a3940e08))


* **transaction, signer:** add WitnessArgs to transaction ([e42d02d](https://github.com/lay2dev/pw-core/commit/e42d02d25c8d605b318ce28147acbb82bb33a1d6))

## [0.4.0-alpha.5](https://github.com/lay2dev/pw-core/compare/v0.4.0-beta.0...v0.4.0-alpha.5) (2020-12-10)

### Features

- **address:** add getEosPublicKey api for address ([576ac4f](https://github.com/lay2dev/pw-core/commit/576ac4ffe641eddb2ea6b9cd1a0baa1cfeffacde))
- **address:** merge sudt branch, implemented address interface: isAcp, minPaymentAmount ([919f3eb](https://github.com/lay2dev/pw-core/commit/919f3ebdc45c9e3189c8655158fe16eb02a4f764))
- **merge master:** merge master branch ([2623a4e](https://github.com/lay2dev/pw-core/commit/2623a4ee8e097ddf1201888f7671d8f538337290))
- **signer:** remove eos & tron signer ([bec6924](https://github.com/lay2dev/pw-core/commit/bec69247686f45078f60a968264619c696b9744a))
- **sudt:** merge sudt ([ca40a0b](https://github.com/lay2dev/pw-core/commit/ca40a0b22cf96a8911386a07a8d6726bf587277a))
- **utils:** implement verifyEosAddress and verifyTronAddress ([58d9fdf](https://github.com/lay2dev/pw-core/commit/58d9fdf9c056013de1acb907eef83bdab6b815e6))
- add eos&tron support ([c28110f](https://github.com/lay2dev/pw-core/commit/c28110ff1e3bd44b7672ef2c984a892ae7447f84))

### Bug Fixes

- **eth-provider:** add platform byte for witness lock of eth type ([69d99fa](https://github.com/lay2dev/pw-core/commit/69d99faeb89b846aabcd83cac057ac871a6d4e38))
- **web3modalprovider:** add platform byte to witness lock ([d0177c0](https://github.com/lay2dev/pw-core/commit/d0177c0b67c03320e224c7b0380eed51a3940e08))

## [0.4.0](https://github.com/lay2dev/pw-core/compare/v0.2.2...v0.4.0) (2020-10-04)

### ⚠ BREAKING CHANGES

- **transaction, signer:** required parameter 'witnessArgs' is added to Transaction's contructor. the default
  values can be found in static attribute WITNESS_ARGS of Builder.

### Features

- add eos&tron support ([c28110f](https://github.com/lay2dev/pw-core/commit/c28110ff1e3bd44b7672ef2c984a892ae7447f84))
- **amount:** add 'fixed' to FormatOptions, which enables toFixed style format ([93439ea](https://github.com/lay2dev/pw-core/commit/93439ea31ea3b0656b0e8c93add33047fcf88b81))
- **pw-collector:** now we can pass the api base url to PwCollector in constructor ([80cf09c](https://github.com/lay2dev/pw-core/commit/80cf09c5a5b0f1b22468b35143bcc16ce942af96))

### Bug Fixes

- **eth-signer:** remove test privkeys and ecsign, use sendAsync ([129deba](https://github.com/lay2dev/pw-core/commit/129deba2f1c2ad31df4910b24cfdb11f4e752b11))
- **package.json:** bump version to 0.2.5 ([e7ee1d8](https://github.com/lay2dev/pw-core/commit/e7ee1d86bec850ca198664395e0c3cdc28f6b6eb))
- **utils, script:** fix generateAddress and parseAddress, more test for script.toAddress ([7509e0a](https://github.com/lay2dev/pw-core/commit/7509e0a155f59094ea6f1c63b5c0275851cee93c))

- **transaction, signer:** add WitnessArgs to transaction ([e42d02d](https://github.com/lay2dev/pw-core/commit/e42d02d25c8d605b318ce28147acbb82bb33a1d6))

### [0.2.1](https://github.com/lay2dev/pw-core/compare/v0.2.0...v0.2.1) (2020-06-21)

Update docs

## [0.2.0](https://github.com/lay2dev/pw-core/compare/v0.1.4...v0.2.0) (2020-06-17)

### ⚠ BREAKING CHANGES

- **eth-signer:** Now sendAsync is on and wallets like MetaMask can be used to sign transactions.

### Bug Fixes

- **eth-signer:** change from ecsign to sendAsync for prod ([3a91746](https://github.com/lay2dev/pw-core/commit/3a917469d3b8594ac64446ab912af700ea6ec960))

### [0.1.4](https://github.com/lay2dev/pw-core/compare/v0.1.1...v0.1.4) (2020-06-16)

### Features

- **release 0.1.0:** release alpha ([8814bdc](https://github.com/lay2dev/pw-core/commit/8814bdc4f33b3966c539cce632d34339ff6ddca7))

### 0.1.1 (2020-06-15)

### Features

- **models:** add more methods to CKBModel ([0c0669a](https://github.com/lay2dev/ckb-pw-core/commit/0c0669a15fd41027c943fd6caae0b7d1b89d7065))
