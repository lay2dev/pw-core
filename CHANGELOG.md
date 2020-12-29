# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.3.22-beta.0](https://github.com/lay2dev/pw-core/compare/v0.3.21-beta.0...v0.3.22-beta.0) (2020-12-29)


### Bug Fixes

* **config:** re-update sudt config of constants ([90df82e](https://github.com/lay2dev/pw-core/commit/90df82e1b1e8875086c54ad6125442eaca5ae880))

### [0.3.21-beta.0](https://github.com/lay2dev/pw-core/compare/v0.2.2...v0.3.21-beta.0) (2020-12-10)


### ⚠ BREAKING CHANGES

* **transaction, signer:** required parameter 'witnessArgs' is added to Transaction's contructor. the default
values can be found in static attribute WITNESS_ARGS of Builder.

### Features

* **acp:** add acp builder for simple builder ([6b11497](https://github.com/lay2dev/pw-core/commit/6b1149746c9e0e6b30049da1ae76c410dc83b3ab))
* **address:** add 2 api for address. isAcp & minPaymentAmount ([f7ae547](https://github.com/lay2dev/pw-core/commit/f7ae547f92f58b797c269a77b4bf0b8f49c96807))
* **amount:** add 'fixed' to FormatOptions, which enables toFixed style format ([93439ea](https://github.com/lay2dev/pw-core/commit/93439ea31ea3b0656b0e8c93add33047fcf88b81))
* **config:** update sudt config on aggron ([0c81e17](https://github.com/lay2dev/pw-core/commit/0c81e179c39a17b8d0ef2bdcb1e6af1612063102))
* **provider:** create a new provider to support wallet connect ([07d7df8](https://github.com/lay2dev/pw-core/commit/07d7df8665f273f89709b0279ee53478c5b0ef79))
* **pw-collector:** now we can pass the api base url to PwCollector in constructor ([80cf09c](https://github.com/lay2dev/pw-core/commit/80cf09c5a5b0f1b22468b35143bcc16ce942af96))
* **sudt:** finish sudt create acp builder ([55863d9](https://github.com/lay2dev/pw-core/commit/55863d9b10bcacd039722afc9090e6668a12e136))
* **sudt-builder:** add simple sudt create acp ([31f54ec](https://github.com/lay2dev/pw-core/commit/31f54ec459052dab6765466078bc04aa259c783b))


### Bug Fixes

* **amount:** change all BigInto to JSBI.BigInt in utils.ts ([777bba9](https://github.com/lay2dev/pw-core/commit/777bba9db6daeb4ad3501e8a7beb627333f73a1e))
* **eth-signer:** remove test privkeys and ecsign, use sendAsync ([129deba](https://github.com/lay2dev/pw-core/commit/129deba2f1c2ad31df4910b24cfdb11f4e752b11))
* **package.json:** bump version to 0.2.5 ([e7ee1d8](https://github.com/lay2dev/pw-core/commit/e7ee1d86bec850ca198664395e0c3cdc28f6b6eb))
* **sudt:** fix tx build bugs: sudt amount not change ([838fbcd](https://github.com/lay2dev/pw-core/commit/838fbcd1f862b8ac5fcd1d8ab9e8d0d598fdbc37))
* **sudtcollector:** make pwcollecotr extends from sudtcollector ([065bc5d](https://github.com/lay2dev/pw-core/commit/065bc5d897052b9961325bbf9b56497b1cf6f87b))
* **utils, script:** fix generateAddress and parseAddress, more test for script.toAddress ([7509e0a](https://github.com/lay2dev/pw-core/commit/7509e0a155f59094ea6f1c63b5c0275851cee93c))


* **transaction, signer:** add WitnessArgs to transaction ([e42d02d](https://github.com/lay2dev/pw-core/commit/e42d02d25c8d605b318ce28147acbb82bb33a1d6))

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
