import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { ethers } from "ethers";
import fs from "fs";

chai.use(chaiAsPromised);
const { expect } = chai;

// Load ABI & bytecode from Hardhat artifacts
const artifact = JSON.parse(
  fs.readFileSync("./artifacts/contracts/MyToken.sol/MyToken.json", "utf8")
);

describe("MyToken", function () {
  let provider;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Connect to Hardhat network
    provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    owner = await provider.getSigner(0);
    addr1 = await provider.getSigner(1);
    addr2 = await provider.getSigner(2);

    const factory = new ethers.ContractFactory(
      artifact.abi,
      artifact.bytecode,
      owner
    );

    // Deploy with 1,000,000 tokens
    this.token = await factory.deploy(ethers.parseEther("1000000"));
    await this.token.waitForDeployment();
  });

  it("Should deploy with correct supply", async function () {
    const balance = await this.token.balanceOf(await owner.getAddress());
    expect(balance).to.equal(ethers.parseEther("1000000"));
  });

  it("Should allow owner to mint", async function () {
    await this.token.mint(
      await owner.getAddress(),
      ethers.parseEther("100"),
      { gasLimit: 5_000_000 }
    );

    const balance = await this.token.balanceOf(await owner.getAddress());
    expect(balance).to.equal(ethers.parseEther("1000100"));
  });

  it("Should fail if non-owner tries to mint", async function () {
    // Connect contract to addr1 signer
    const tokenAsAddr1 = this.token.connect(addr1);

    await expect(
      tokenAsAddr1.mint(
        await addr1.getAddress(),
        ethers.parseEther("1"),
        { gasLimit: 5_000_000 }
      )
    ).to.be.rejected;
  });

  it("Should transfer tokens", async function () {
    await this.token.transfer(
      await addr1.getAddress(),
      1000,
      { gasLimit: 5_000_000 }
    );

    const newBalance = await this.token.balanceOf(await addr1.getAddress());
    expect(newBalance).to.equal(1000n);
  });

  it("Should fail on insufficient balance", async function () {
    const tokenAsAddr1 = this.token.connect(addr1);

    await expect(
      tokenAsAddr1.transfer(
        await owner.getAddress(),
        1,
        { gasLimit: 5_000_000 }
      )
    ).to.be.rejected;
  });
});
