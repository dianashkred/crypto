const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const proxyAddress = process.env.PROXY_ADDRESS;
  if (!proxyAddress) throw new Error("Add PROXY_ADDRESS to .env");

  const MyTokenV2 = await ethers.getContractFactory("MyTokenV2");
  const implV2 = await MyTokenV2.deploy();
  await implV2.deployed();
  console.log("Impl V2:", implV2.address);

  const proxy = await ethers.getContractAt("UUPSProxy", proxyAddress);
  await proxy.upgradeTo(implV2.address);

  const upgraded = await ethers.getContractAt("MyTokenV2", proxyAddress);
  console.log("Version:", await upgraded.version());
}

main();
