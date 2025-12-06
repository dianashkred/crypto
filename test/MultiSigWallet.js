const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MultiSigWallet", function () {
  let wallet;
  let owner1;
  let owner2;
  let owner3;
  let nonOwner;

  const confirmationsRequired = 2;

  beforeEach(async function () {
    [owner1, owner2, owner3, nonOwner] = await ethers.getSigners();

    const owners = [owner1.address, owner2.address, owner3.address];

    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    wallet = await MultiSigWallet.deploy(owners, confirmationsRequired);
    await wallet.waitForDeployment();
  });

  async function getWalletAddress() {
    if (wallet.getAddress) {
      return await wallet.getAddress();
    }

    return wallet.address || wallet.target;
  }

  it("deploys with correct owners and confirmation threshold", async function () {
    const ownersFromContract = await wallet.getOwners();
    const required = await wallet.numConfirmationsRequired();

    expect(ownersFromContract).to.have.lengthOf(3);
    expect(ownersFromContract).to.include.members([
      owner1.address,
      owner2.address,
      owner3.address
    ]);

    expect(required).to.equal(2n);
    expect(await wallet.isOwner(owner1.address)).to.be.true;
    expect(await wallet.isOwner(owner2.address)).to.be.true;
    expect(await wallet.isOwner(owner3.address)).to.be.true;
    expect(await wallet.isOwner(nonOwner.address)).to.be.false;
  });

  it("allows only owners to submit transactions", async function () {
    const value = ethers.parseEther("1");

    await expect(
      wallet
        .connect(owner1)
        .submitTransaction(nonOwner.address, value, "0x")
    )
      .to.emit(wallet, "SubmitTransaction")
      .withArgs(owner1.address, 0n, nonOwner.address, value, "0x");

    await expect(
      wallet
        .connect(nonOwner)
        .submitTransaction(nonOwner.address, value, "0x")
    ).to.be.revertedWith("not owner");
  });

  it("stores submitted transaction correctly", async function () {
    const value = ethers.parseEther("0.5");

    await wallet
      .connect(owner1)
      .submitTransaction(nonOwner.address, value, "0x");

    const txCount = await wallet.getTransactionCount();
    expect(txCount).to.equal(1n);

    const [to, storedValue, data, executed, numConfirmations] =
      await wallet.getTransaction(0);

    expect(to).to.equal(nonOwner.address);
    expect(storedValue).to.equal(value);
    expect(data).to.equal("0x");
    expect(executed).to.equal(false);
    expect(numConfirmations).to.equal(0n);
  });

  it("allows owners to confirm a transaction and prevents duplicate confirmations", async function () {
    const value = ethers.parseEther("1");

    await wallet
      .connect(owner1)
      .submitTransaction(nonOwner.address, value, "0x");

    await expect(wallet.connect(owner1).confirmTransaction(0))
      .to.emit(wallet, "ConfirmTransaction")
      .withArgs(owner1.address, 0n);

    await expect(
      wallet.connect(owner1).confirmTransaction(0)
    ).to.be.revertedWith("tx already confirmed");

    await expect(wallet.connect(owner2).confirmTransaction(0))
      .to.emit(wallet, "ConfirmTransaction")
      .withArgs(owner2.address, 0n);

    const [, , , , numConfirmations] = await wallet.getTransaction(0);
    expect(numConfirmations).to.equal(2n);

    expect(await wallet.isConfirmed(0, owner1.address)).to.be.true;
    expect(await wallet.isConfirmed(0, owner2.address)).to.be.true;
  });

  it("allows owners to revoke confirmation before execution", async function () {
    const value = ethers.parseEther("1");

    await wallet
      .connect(owner1)
      .submitTransaction(nonOwner.address, value, "0x");

    await wallet.connect(owner1).confirmTransaction(0);

    await expect(wallet.connect(owner1).revokeConfirmation(0))
      .to.emit(wallet, "RevokeConfirmation")
      .withArgs(owner1.address, 0n);

    const [, , , , numConfirmations] = await wallet.getTransaction(0);
    expect(numConfirmations).to.equal(0n);
    expect(await wallet.isConfirmed(0, owner1.address)).to.be.false;

    await expect(
      wallet.connect(owner1).revokeConfirmation(0)
    ).to.be.revertedWith("tx not confirmed");
  });

  it("does not allow execution before reaching required confirmations", async function () {
    const value = ethers.parseEther("1");

    const walletAddress = await getWalletAddress();

    await owner1.sendTransaction({
      to: walletAddress,
      value
    });

    await wallet
      .connect(owner1)
      .submitTransaction(nonOwner.address, value, "0x");

    await wallet.connect(owner1).confirmTransaction(0);

    await expect(
      wallet.connect(owner1).executeTransaction(0)
    ).to.be.revertedWith("cannot execute tx");
  });

  it("executes transaction after enough confirmations and updates balances", async function () {
    const value = ethers.parseEther("1");

    const walletAddress = await getWalletAddress();

    await owner1.sendTransaction({
      to: walletAddress,
      value
    });

    const initialBalance = await ethers.provider.getBalance(nonOwner.address);

    await wallet
      .connect(owner1)
      .submitTransaction(nonOwner.address, value, "0x");

    await wallet.connect(owner1).confirmTransaction(0);
    await wallet.connect(owner2).confirmTransaction(0);

    await expect(wallet.connect(owner1).executeTransaction(0))
      .to.emit(wallet, "ExecuteTransaction")
      .withArgs(owner1.address, 0n);

    const [, , , executed, numConfirmations] =
      await wallet.getTransaction(0);

    expect(executed).to.equal(true);
    expect(numConfirmations).to.equal(2n);

    const finalBalance = await ethers.provider.getBalance(nonOwner.address);
    expect(finalBalance - initialBalance).to.equal(value);

    await expect(
      wallet.connect(owner1).executeTransaction(0)
    ).to.be.revertedWith("tx already executed");
  });

  it("reverts on non-existent transaction index", async function () {
    await expect(
      wallet.connect(owner1).confirmTransaction(999)
    ).to.be.revertedWith("tx does not exist");

    await expect(
      wallet.connect(owner1).revokeConfirmation(999)
    ).to.be.revertedWith("tx does not exist");

    await expect(
      wallet.connect(owner1).executeTransaction(999)
    ).to.be.revertedWith("tx does not exist");
  });
});
