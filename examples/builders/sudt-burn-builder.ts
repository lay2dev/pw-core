import PWCore, {
  Amount,
  AmountUnit,
  Builder,
  Cell,
  IndexerCollector,
  RawTransaction,
  SUDT,
  Transaction,
  WitnessArgs,
} from '@lay2/pw-core';

export class SUDTBurnBuilder extends Builder {
  public amount;
  public senderAddress;
  public sudt;

  constructor(sudt: SUDT, amount: Amount) {
    super();
    this.amount = amount;
    this.senderAddress = PWCore.provider.address; // Get the source address from the current provider.
    this.sudt = sudt;
  }

  async build(fee: Amount = Amount.ZERO): Promise<Transaction> {
    // Arrays for our input cells, output cells, and cell deps, which will be used in the final transaction.
    const inputCells = [];
    const outputCells = [];
    const cellDeps = [];

    // Add the SUDT input cells.
    const sudtCells = await (this.collector as IndexerCollector).collectSUDT(
      this.sudt,
      this.senderAddress,
      { neededAmount: this.amount }
    );
    for (const cell of sudtCells) inputCells.push(cell);

    // Add an SUDT change cell, if needed.
    const inputSUDTAmount = inputCells.reduce(
      (a, c) => a.add(c.getSUDTAmount()),
      Amount.ZERO
    );
    if (inputSUDTAmount.sub(this.amount).gt(Amount.ZERO)) {
      const typeScript = this.sudt.toTypeScript();
      const lockScript = this.senderAddress.toLockScript();
      const sudtCell = new Cell(
        new Amount('999', AmountUnit.ckb),
        lockScript,
        typeScript,
        undefined,
        inputSUDTAmount.sub(this.amount).toUInt128LE()
      );
      sudtCell.resize();
      outputCells.push(sudtCell);
    }

    // Calculate the capacity amounts.
    let inputCapacity = inputCells.reduce(
      (a, c) => a.add(c.capacity),
      Amount.ZERO
    );
    let outputCapacity = outputCells.reduce(
      (a, c) => a.add(c.capacity),
      Amount.ZERO
    );

    // Determine if more capacity is needed. (Input capacity - output capacity - change cell (61) - tx fee)
    if (
      inputCapacity
        .sub(outputCapacity)
        .sub(new Amount('61', AmountUnit.ckb))
        .sub(fee)
        .lt(Amount.ZERO)
    ) {
      const requiredCapacity = outputCapacity
        .add(new Amount('61', AmountUnit.ckb))
        .add(fee)
        .sub(inputCapacity);
      const capacityCells = await this.collector.collect(this.senderAddress, {
        neededAmount: requiredCapacity,
      });
      for (const cell of capacityCells) inputCells.push(cell);
    }

    // Recalculate the input/output capacity amounts and the change cell amount.
    inputCapacity = inputCells.reduce((a, c) => a.add(c.capacity), Amount.ZERO);
    outputCapacity = outputCells.reduce(
      (a, c) => a.add(c.capacity),
      Amount.ZERO
    );
    const changeCapacity = inputCapacity.sub(outputCapacity).sub(fee);

    // Add the change cell.
    const changeCell = new Cell(
      changeCapacity,
      this.senderAddress.toLockScript()
    );
    outputCells.push(changeCell);

    // Add the required cell deps.
    cellDeps.push(
      PWCore.config.defaultLock.cellDep,
      PWCore.config.omniLock!.cellDep,
      PWCore.config.sudtType.cellDep
    );

    // Set the witness args based on the current lock script.
    this.calculateWitnessArgs(this.senderAddress.toLockScript());

    // Generate a transaction and calculate the fee.
    const tx = new Transaction(
      new RawTransaction(inputCells, outputCells, cellDeps),
      [this.witnessArgs as WitnessArgs]
    );
    this.fee = Builder.calcFee(tx);

    // Ensure the change cell has enough to cover the calculated fee.
    if (
      changeCell.capacity.gte(
        this.senderAddress.minPaymentAmount().add(this.fee)
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
