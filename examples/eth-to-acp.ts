import PWCore, {Address, Amount, AddressType, IndexerCollector, Platform, RawProvider, SUDT} from '@lay2/pw-core';

// Public RPC servers provided by Lay2.
const CKB_NODE_RPC_URL = 'https://testnet.ckb.dev/rpc';
const CKB_INDEXER_RPC_URL = 'https://testnet.ckb.dev/indexer';

// The following private key corresponds with ETH address 0x7aaff596c5e5e788effa0be946014b794cdd8d51,
// and with CKB address (PWLock; ETH; Pre2021) ckt1qjl58smqy32hnrq6vxjedcxe2fugvnz497h7yvwqvwel40uh4rltc7407ktvte083rhl5zlfgcq5k72vmkx4zkge6yj,
// and with CKB address (Omni Lock; ETH; CKB2021) ckt1qpuljza4azfdsrwjzdpea6442yfqadqhv7yzfu5zknlmtusm45hpuqgp02hlt9k9uhnc3ml6p055vq2t09xdmr23qqx8wz0x.
const PRIVATE_KEY = '0xcd708059624d8301382972808b3e504b5ea3d94e210edf229f48cadcb8fe0989';

// The following CKB address will be sent to. (ACP Lock; CKB2021)
const CKB_ADDRESS = 'ckt1qq6pngwqn6e9vlm92th84rk0l4jp2h8lurchjmnwv8kq3rt5psf4vq2jkvdkvfmuc3jesdumyvp44aqwe7qp8ncdg6nrk';

(async function main()
{
    const provider = new RawProvider(PRIVATE_KEY, Platform.eth); // A built-in Provider for raw private keys. This can be replaced with wallet providers like EthProvider.
    const collector = new IndexerCollector(CKB_INDEXER_RPC_URL); // A Collector to retrive cells from the CKB Indexer RPC.
    const pwcore = await new PWCore(CKB_NODE_RPC_URL).init(provider, collector); // Initialize PWCore.

    const receiverAddress = new Address(CKB_ADDRESS, AddressType.ckb);
    const sudt = new SUDT('0x34c325c9859211a3e2ef9cdc5fe48becbd7d85e600fb408767ed7184763b9c61');
    const sendAmount = new Amount('1', 0);
    const txHash = await pwcore.sendSUDT(sudt, receiverAddress, sendAmount, true);
    
    console.log(`Sending from: ${provider.address.toCKBAddress()}`);
    console.log(`Sending to: ${receiverAddress.toCKBAddress()}`);
    console.log(`SUDT ID: ${sudt.issuerLockHash}`);
    console.log(`SUDT Amount: ${sendAmount.toString(0)} Tokens`);
    console.log(`Transaction Hash: ${txHash}`);
    console.log(`Explorer URL: https://explorer.nervos.org/aggron/transaction/${txHash}`);
})();
