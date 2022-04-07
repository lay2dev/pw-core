import {
  Address,
  Amount,
  AmountUnit,
  AddressType,
  Builder,
  Cell,
  RawTransaction,
  Transaction,
  WitnessArgs,
} from '@lay2/pw-core';

export class PWLockMigrationBuilder extends Builder {
  public sourceAddress;
  public sourceAddressString;
  public destinationAddress;
  public destinationAddressString;
  public amount;

  constructor(
    sourceAddressString: string,
    destinationAddressString: string,
    amount: Amount
  ) {
    super();
    this.sourceAddress = new Address(sourceAddressString, AddressType.ckb);
    this.sourceAddressString = sourceAddressString;
    this.destinationAddress = new Address(
      destinationAddressString,
      AddressType.ckb
    );
    this.destinationAddressString = destinationAddressString;
    this.amount = amount;
  }

  async build(fee: Amount = Amount.ZERO): Promise<Transaction> {
    // Create the output cell for the destination address.
    const outputCell = new Cell(
      this.amount,
      this.destinationAddress.toLockScript()
    );

    // Collect the input cells from the source address.
    const neededAmount = this.amount
      .add(this.sourceAddress.minPaymentAmount())
      .add(fee); // send amount + minimum change cell capacity + transaction fee
    const inputCells: Cell[] = [];
    let inputSum = new Amount('0');
    const cells = await this.collector.collect(this.sourceAddress, {
      neededAmount,
    });
    for (const cell of cells) {
      inputCells.push(cell);
      inputSum = inputSum.add(cell.capacity);
      if (inputSum.gt(neededAmount)) break;
    }

    // Throw an error if not enough capacity was found on the source address.
    if (inputSum.lt(neededAmount)) {
      throw new Error(
        `Not enough input capacity was found. Needed ${neededAmount.toString(
          AmountUnit.ckb
        )} CKB, found ${inputSum.toString(AmountUnit.ckb)} CKB.`
      );
    }

    // Create a change cell back to the source address.
    const changeCell = new Cell(
      inputSum.sub(outputCell.capacity),
      this.sourceAddress.toLockScript()
    );

    // Set the witness args based on the current lock script.
    this.calculateWitnessArgs(this.sourceAddress.toLockScript());

    // Create a new transaction.
    const tx = new Transaction(
      new RawTransaction(inputCells, [outputCell, changeCell]),
      [this.witnessArgs as WitnessArgs]
    );

    // Calculate the fee for the transaction.
    this.fee = Builder.calcFee(tx, this.feeRate);

    // Ensure the change cell has enough to cover the calculated fee.
    if (
      changeCell.capacity.gte(
        this.sourceAddress.minPaymentAmount().add(this.fee)
      )
    ) {
      changeCell.capacity = changeCell.capacity.sub(this.fee);
      tx.raw.outputs.pop();
      tx.raw.outputs.push(changeCell);
      return tx;
    }

    // There was not enough capacity with the fee, so rerun the transaction generation with the calculated fee specified.
    return this.build(this.fee);
  }
}
