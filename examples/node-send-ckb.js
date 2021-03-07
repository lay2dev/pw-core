const {
  default: PWCore,
  AddressType,
  Address,
  Amount,
  RawProvider,
  IndexerCollector,
} = require('../build/main' /* '@lay2/pw-core' */);

const privateKey =
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const sendToAddress = new Address(
  'ckt1qyqdqgfznjq86kasp0t5vn7vq7wt8hfenexs2e7uq6',
  AddressType.ckb
);

async function main() {
  const pw = new PWCore('https://aggron.ckb.dev');
  await pw.init(
    new RawProvider(privateKey),
    new IndexerCollector({ url: 'https://testnet.ckb.dev/indexer' })
  );

  const txHash = await pw.send(sendToAddress, new Amount('100'));
  console.log('Transaction is sent with the txHash: ' + txHash);
  console.log(
    `explore at https://explorer.nervos.org/aggron/transaction/${txHash}`
  );
}

main();
