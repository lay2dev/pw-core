import PWCore, {Address, Amount, AddressType, IndexerCollector, Platform, RawProvider, SUDT } from '@lay2/pw-core';
import { SUDTMintBuilder } from './builders/sudt-mint-builder';

// Public RPC servers provided by Lay2.
const CKB_NODE_RPC_URL = 'https://testnet.ckb.dev/rpc';
const CKB_INDEXER_RPC_URL = 'https://testnet.ckb.dev/indexer';

// The following private key corresponds with native CKB address ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqf8y2wrqq8y3up36e8mqg3tj8wkeyqs8uccxpsdt (Default Lock; CKB2021).
const PRIVATE_KEY = '0xcd708059624d8301382972808b3e504b5ea3d94e210edf229f48cadcb8fe0989';

(async function main()
{
    const provider = new RawProvider(PRIVATE_KEY); // A built-in Provider for raw private keys. This can be replaced with wallet providers like EthProvider.
    const collector = new IndexerCollector(CKB_INDEXER_RPC_URL); // A Collector to retrive cells from the CKB Indexer RPC.
    const pwcore = await new PWCore(CKB_NODE_RPC_URL).init(provider, collector); // Initialize PWCore.

    const receiverAddress = provider.address; // This will sent the SUDT tokens to the same address they were minted from.
    const sendAmount = new Amount('100', 0); // The number of SUDT tokens to mint. (Decimals "0" must be specified for SUDT.)

    const builder = new SUDTMintBuilder(receiverAddress, sendAmount);
    const txHash = await pwcore.sendTransaction(builder);

    console.log(`Minting from: ${provider.address.toCKBAddress()}`);
    console.log(`Sending to: ${receiverAddress.toCKBAddress()}`);
    console.log(`Amount: ${sendAmount.toString(0)} SUDT Tokens`); // Decimals specified as 0 to print properly.
    console.log(`Transaction Hash: ${txHash}`);
    console.log(`Explorer URL: https://explorer.nervos.org/aggron/transaction/${txHash}`);
})();
