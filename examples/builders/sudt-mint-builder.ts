import PWCore, {Address, Amount, AmountUnit, Builder, Cell, RawTransaction, SUDT, Transaction, WitnessArgs } from '@lay2/pw-core';

export class SUDTMintBuilder extends Builder {
  public sourceAddress;
  public destinationAddress;
  public amount;

  constructor(destinationAddress: Address, amount: Amount) {
    super();
    this.sourceAddress = PWCore.provider.address; // Get the source address from the current provider.
    this.destinationAddress = destinationAddress;
    this.amount = amount;
  }

  async build(fee: Amount = Amount.ZERO): Promise<Transaction> {

    // Create the SUDT token identifier from the source address.
    const sudt = new SUDT(this.sourceAddress.toLockScript().toHash());

    // Create the output cell on the destination address with the specified amount SUDT tokens.
    // The capacity starts at 1000 CKB as a placeholder and will be reduced to the minimum using resize().
    const outputCell = new Cell(new Amount('1000'), this.destinationAddress.toLockScript(), sudt.toTypeScript(), undefined, this.amount.toUInt128LE());
    outputCell.resize();

    // Collect the input capacity from the source address.
    const neededAmount = Amount.ZERO.add(outputCell.occupiedCapacity()).add(this.sourceAddress.minPaymentAmount()).add(fee); // output cell + change cell + fee
    const inputCells: Cell[] = [];
    let inputSum = new Amount('0');
    const cells = await this.collector.collect(this.sourceAddress, { neededAmount });
    for (const cell of cells) {
      inputCells.push(cell);
      inputSum = inputSum.add(cell.capacity);
      if (inputSum.gt(neededAmount)) break;
    }

    // Throw an error if not enough capacity was found on the source address.
    if (inputSum.lt(neededAmount)) {
      throw new Error(`Not enough input capacity was found. Needed ${neededAmount.toString(AmountUnit.ckb)} CKB, found ${inputSum.toString(AmountUnit.ckb)} CKB.`);
    }

    // Create a change cell back to the source address.
    const changeCell = new Cell(
      inputSum.sub(outputCell.capacity),
      this.sourceAddress.toLockScript()
    );

    // Set the witness args based on the current lock script.
    this.calculateWitnessArgs(this.sourceAddress.toLockScript());

    // Specify the cell deps for the transaction.
    const sudtCellDeps = [
        PWCore.config.defaultLock.cellDep,
        PWCore.config.sudtType.cellDep,
    ];

    // Create a new transaction.
    const tx = new Transaction(
      new RawTransaction(inputCells, [outputCell, changeCell], sudtCellDeps),
      [this.witnessArgs as WitnessArgs]
    );

    // Calculate the fee for the transaction.
    this.fee = Builder.calcFee(tx, this.feeRate);

    // Ensure the change cell has enough to cover the calculated fee.
    if (changeCell.capacity.gte(this.sourceAddress.minPaymentAmount().add(this.fee))) {
      changeCell.capacity = changeCell.capacity.sub(this.fee);
      tx.raw.outputs.pop();
      tx.raw.outputs.push(changeCell);
      return tx;
    }

    // There was not enough capacity with the fee, so rerun the transaction generation with the calculated fee specified.
    return this.build(this.fee);
  }
}
