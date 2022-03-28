import PWCore, {Address, Amount, AddressType, IndexerCollector, RawProvider} from '@lay2/pw-core';

// Public RPC servers provided by Lay2.
const CKB_NODE_RPC_URL = 'https://testnet.ckb.dev/rpc';
const CKB_INDEXER_RPC_URL = 'https://testnet.ckb.dev/indexer';

// The following private key corresponds with CKB native address ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqf8y2wrqq8y3up36e8mqg3tj8wkeyqs8uccxpsdt.
const PRIVATE_KEY = '0xcd708059624d8301382972808b3e504b5ea3d94e210edf229f48cadcb8fe0989';

// The following Ethereum address is the destination, which will be mapped to a CKB address on-chain.
const ETH_ADDRESS = '0x7aaff596c5e5e788effa0be946014b794cdd8d51';

(async function main()
{
    const provider = new RawProvider(PRIVATE_KEY); // A built-in Provider for raw private keys. This can be replaced with wallet providers like EthProvider.
    const collector = new IndexerCollector(CKB_INDEXER_RPC_URL); // A Collector to retrive cells from the CKB Indexer RPC.
    const pwcore = await new PWCore(CKB_NODE_RPC_URL).init(provider, collector); // Initialize PWCore.

    const destinationAddress = new Address(ETH_ADDRESS, AddressType.eth); // This will map the ETH address to it's corresponding CKB address using Omni Lock.
    const sendAmount = new Amount('100');
    const txHash = await pwcore.send(destinationAddress, sendAmount);

    console.log(`Sending from: ${provider.address.toCKBAddress()}`);
    console.log(`Sending to: ${destinationAddress.toCKBAddress()}`);
    console.log(`Amount: ${sendAmount.toString()} CKB`);
    console.log(`Transaction Hash: ${txHash}`);
    console.log(`Explorer URL: https://explorer.nervos.org/aggron/transaction/${txHash}`);
})();
