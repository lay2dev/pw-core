export {};

declare global {
  interface Window {
    ethereum: any;
    scatter: any;
    tronWeb: any;
    web3: any;
  }
}
