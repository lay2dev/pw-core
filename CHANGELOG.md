# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.4.0](https://github.com/lay2dev/pw-core/compare/v0.2.2...v0.4.0) (2020-10-04)


### ⚠ BREAKING CHANGES

* **transaction, signer:** required parameter 'witnessArgs' is added to Transaction's contructor. the default
values can be found in static attribute WITNESS_ARGS of Builder.

### Features

* add eos&tron support ([c28110f](https://github.com/lay2dev/pw-core/commit/c28110ff1e3bd44b7672ef2c984a892ae7447f84))
* **amount:** add 'fixed' to FormatOptions, which enables toFixed style format ([93439ea](https://github.com/lay2dev/pw-core/commit/93439ea31ea3b0656b0e8c93add33047fcf88b81))
* **pw-collector:** now we can pass the api base url to PwCollector in constructor ([80cf09c](https://github.com/lay2dev/pw-core/commit/80cf09c5a5b0f1b22468b35143bcc16ce942af96))


### Bug Fixes

* **eth-signer:** remove test privkeys and ecsign, use sendAsync ([129deba](https://github.com/lay2dev/pw-core/commit/129deba2f1c2ad31df4910b24cfdb11f4e752b11))
* **package.json:** bump version to 0.2.5 ([e7ee1d8](https://github.com/lay2dev/pw-core/commit/e7ee1d86bec850ca198664395e0c3cdc28f6b6eb))
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
