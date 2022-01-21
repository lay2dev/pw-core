export enum NervosAddressVersion {
  latest,
  pre2021,
  ckb2021,
}

export function getConcreteNervosAddressVersion(
  addressVersion: NervosAddressVersion
) {
  if (addressVersion === NervosAddressVersion.pre2021) {
    return addressVersion;
  }

  return NervosAddressVersion.ckb2021;
}
