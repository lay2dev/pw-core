import PWCore, {Address, AddressType, Amount, IndexerCollector, RawProvider, SUDT} from '@lay2/pw-core';
import { SUDTBurnBuilder } from './builders/sudt-burn-builder';

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
    
    const sudt = new SUDT('0x34c325c9859211a3e2ef9cdc5fe48becbd7d85e600fb408767ed7184763b9c61');
    const senderAddress = new Address('ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqf8y2wrqq8y3up36e8mqg3tj8wkeyqs8uccxpsdt', AddressType.ckb);
    const burnAmount = new Amount('100', 0);

    const sudtBalance = await collector.getSUDTBalance(sudt, senderAddress);
    const builder = new SUDTBurnBuilder(sudt, burnAmount);
    const txHash = await pwcore.sendTransaction(builder);

    console.log(`Address: ${senderAddress.toCKBAddress()}`);
    console.log(`SUDT ID: ${sudt.issuerLockHash}`);
    console.log(`SUDT Balance: ${sudtBalance.toString(0, {commify: true})} Tokens`);
    console.log(`Amount to Burn: ${burnAmount.toString(0, {commify: true})} Tokens`);
    console.log(`Transaction Hash: ${txHash}`);
    console.log(`Explorer URL: https://explorer.nervos.org/aggron/transaction/${txHash}`);
})();
