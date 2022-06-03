import PWCore, {Address, AddressType, IndexerCollector, NullProvider, SUDT} from '@lay2/pw-core';

// Public RPC servers provided by Lay2.
const CKB_NODE_RPC_URL = 'https://testnet.ckb.dev/rpc';
const CKB_INDEXER_RPC_URL = 'https://testnet.ckb.dev/indexer';

(async function main()
{
    const provider = new NullProvider();
    const collector = new IndexerCollector(CKB_INDEXER_RPC_URL);
    const _pwcore = await new PWCore(CKB_NODE_RPC_URL).init(provider, collector);

    const address = new Address('ckt1qzda0cr08m85hc8jlnfp3zer7xulejywt49kt2rr0vthywaa50xwsqf8y2wrqq8y3up36e8mqg3tj8wkeyqs8uccxpsdt', AddressType.ckb);
    const sudt = new SUDT('0x34c325c9859211a3e2ef9cdc5fe48becbd7d85e600fb408767ed7184763b9c61');

    const ckbBalance = await collector.getBalance(address);
    const sudtBalance = await collector.getSUDTBalance(sudt, address);

    console.log(`Address: ${address.toCKBAddress()}`);
    console.log(`SUDT ID: ${sudt.issuerLockHash}`);
    console.log(`CKB Balance: ${ckbBalance.toString(undefined, {commify: true})} CKB`);
    console.log(`SUDT Balance: ${sudtBalance.toString(0, {commify: true})} Tokens`);
})();
