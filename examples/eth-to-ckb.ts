import PWCore, {Address, Amount, AddressType, IndexerCollector, Platform, RawProvider, SimpleBuilder} from '@lay2/pw-core';

// Public RPC servers provided by Lay2.
const CKB_NODE_RPC_URL = 'https://testnet.ckb.dev/rpc';
const CKB_INDEXER_RPC_URL = 'https://testnet.ckb.dev/indexer';

// The following private key corresponds with ETH address 0x7aaff596c5e5e788effa0be946014b794cdd8d51
// and with CKB address (Omni Lock; ETH; CKB2021) ckt1qpuljza4azfdsrwjzdpea6442yfqadqhv7yzfu5zknlmtusm45hpuqgp02hlt9k9uhnc3ml6p055vq2t09xdmr23qqx8wz0x.
const PRIVATE_KEY = '0xcd708059624d8301382972808b3e504b5ea3d94e210edf229f48cadcb8fe0989';

// The following CKB address will be sent to.
const CKB_ADDRESS = 'ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqf2kfe0pqg9444u7ct852nhc9cm72gvj3q7u4ynf';

(async function main()
{
    const provider = new RawProvider(PRIVATE_KEY, Platform.eth); // A built-in Provider for raw private keys. This can be replaced with wallet providers like EthProvider.
    const collector = new IndexerCollector(CKB_INDEXER_RPC_URL); // A Collector to retrive cells from the CKB Indexer RPC.
    const pwcore = await new PWCore(CKB_NODE_RPC_URL).init(provider, collector); // Initialize PWCore.

    const destinationAddress = new Address(CKB_ADDRESS, AddressType.ckb);
    const sendAmount = new Amount('100');
    const builder = new SimpleBuilder(destinationAddress, sendAmount);
    const txHash = await pwcore.sendTransaction(builder);

    console.log(`Sending from: ${provider.address.toCKBAddress()}`);
    console.log(`Sending to: ${destinationAddress.toCKBAddress()}`);
    console.log(`Amount: ${sendAmount.toString()} CKB`);
    console.log(`Transaction Hash: ${txHash}`);
    console.log(`Explorer URL: https://explorer.nervos.org/aggron/transaction/${txHash}`);
})();
