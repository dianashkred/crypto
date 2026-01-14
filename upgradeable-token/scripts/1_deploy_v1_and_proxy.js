import { ethers } from "hardhat";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);

  const deployer = new ethers.Wallet(
    process.env.PRIVATE_KEY,
    provider
  );

  console.log("Deployer address:", await deployer.getAddress());

  // Deploy V1 Logic
  const V1 = await ethers.getContractFactory("MyTokenV1", deployer);
  const v1 = await V1.deploy();
  await v1.waitForDeployment();
  console.log("V1 deployed at:", v1.target);

  // Deploy Proxy
  const Proxy = await ethers.getContractFactory("UUPSProxy", deployer);
  const proxy = await Proxy.deploy(
    v1.target,
    "0x" // no initializer data
  );
  await proxy.waitForDeployment();
  console.log("Proxy deployed at:", proxy.target);

  // Connect proxy as V1
  const proxiedV1 = V1.attach(proxy.target);

  // Mint some tokens via proxy
  const tx = await proxiedV1.mint(await deployer.getAddress(), 1000);
  await tx.wait();

  console.log("Minted 1000 tokens to deployer via proxy.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
