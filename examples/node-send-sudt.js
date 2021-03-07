const {
  default: PWCore,
  AddressType,
  Address,
  Amount,
  RawProvider,
  IndexerCollector,
  SUDT,
  AmountUnit,
} = require('../build/main' /* '@lay2/pw-core' */);

const privateKey =
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const sendToAddress = new Address(
  '0x6C8C7f80161485C3e4ADCeDa4C6C425410140054',
  AddressType.eth
);
const sudtIssuerLockHash =
  '0x6fe3733cd9df22d05b8a70f7b505d0fb67fb58fb88693217135ff5079713e902';

async function main() {
  const pw = new PWCore('https://aggron.ckb.dev');
  await pw.init(
    new RawProvider(privateKey),
    new IndexerCollector({ url: 'https://testnet.ckb.dev/indexer' })
  );

  const txHash = await pw.sendSUDT(
    new SUDT(sudtIssuerLockHash),
    sendToAddress,
    new Amount('100', AmountUnit.shannon)
  );
  console.log('Transaction is sent with the txHash: ' + txHash);
  console.log(
    `explore at https://explorer.nervos.org/aggron/transaction/${txHash}`
  );
}

main();
