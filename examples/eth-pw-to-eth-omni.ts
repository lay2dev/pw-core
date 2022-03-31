import PWCore, {Address, Amount, AddressType, IndexerCollector, Platform, RawProvider, Reader, NervosAddressVersion, LockType } from '@lay2/pw-core';
import { PWLockMigrationBuilder } from './builders/pw-lock-migration-builder';
import { arrayBufferToBuffer } from 'arraybuffer-to-buffer';
import ethWallet from 'ethereumjs-wallet';

// Public RPC servers provided by Lay2.
const CKB_NODE_RPC_URL = 'https://testnet.ckb.dev/rpc';
const CKB_INDEXER_RPC_URL = 'https://testnet.ckb.dev/indexer';

// The following private key corresponds with ETH address 0x7aaff596c5e5e788effa0be946014b794cdd8d51,
// and with CKB address (PWLock; ETH; Pre2021) ckt1qjl58smqy32hnrq6vxjedcxe2fugvnz497h7yvwqvwel40uh4rltc7407ktvte083rhl5zlfgcq5k72vmkx4zkge6yj,
// and with CKB address (Omni Lock; ETH; CKB2021) ckt1qpuljza4azfdsrwjzdpea6442yfqadqhv7yzfu5zknlmtusm45hpuqgp02hlt9k9uhnc3ml6p055vq2t09xdmr23qqx8wz0x.
const PRIVATE_KEY = '0xcd708059624d8301382972808b3e504b5ea3d94e210edf229f48cadcb8fe0989';

(async function main()
{
    const provider = new RawProvider(PRIVATE_KEY, Platform.eth); // A built-in Provider for raw private keys. This can be replaced with wallet providers like EthProvider.
    const collector = new IndexerCollector(CKB_INDEXER_RPC_URL); // A Collector to retrive cells from the CKB Indexer RPC.
    const pwcore = await new PWCore(CKB_NODE_RPC_URL).init(provider, collector); // Initialize PWCore.

    const ethAddress = ethWallet.fromPrivateKey(arrayBufferToBuffer(new Reader(PRIVATE_KEY).toArrayBuffer())).getAddressString(); // 0x7aaff596c5e5e788effa0be946014b794cdd8d51
    const address = new Address(ethAddress, AddressType.eth);
    const sourceAddressString = address.toCKBAddress(NervosAddressVersion.pre2021, LockType.pw); // ckt1qjl58smqy32hnrq6vxjedcxe2fugvnz497h7yvwqvwel40uh4rltc7407ktvte083rhl5zlfgcq5k72vmkx4zkge6yj
    const receiverAddressString = address.toCKBAddress(NervosAddressVersion.ckb2021, LockType.omni); // ckt1qpuljza4azfdsrwjzdpea6442yfqadqhv7yzfu5zknlmtusm45hpuqgp02hlt9k9uhnc3ml6p055vq2t09xdmr23qqx8wz0x
    const sendAmount = new Amount('100');

    const builder = new PWLockMigrationBuilder(sourceAddressString, receiverAddressString, sendAmount);
    const txHash = await pwcore.sendTransaction(builder);

    console.log(`Sending from: ${sourceAddressString}`);
    console.log(`Sending to: ${receiverAddressString}`);
    console.log(`Amount: ${sendAmount.toString()} CKB`);
    console.log(`Transaction Hash: ${txHash}`);
    console.log(`Explorer URL: https://explorer.nervos.org/aggron/transaction/${txHash}`);
})();
