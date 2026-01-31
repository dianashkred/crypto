const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const Soulbound = await hre.ethers.getContractFactory("SoulboundVisitCardERC721");
  const soulbound = await Soulbound.deploy("Student Visit Card", "SVC");
  await soulbound.waitForDeployment();

  const ERC1155 = await hre.ethers.getContractFactory("GameCharacterCollectionERC1155");
  const erc1155 = await ERC1155.deploy();
  await erc1155.waitForDeployment();

  console.log("Deployer:", deployer.address);
  console.log("SoulboundVisitCardERC721:", await soulbound.getAddress());
  console.log("GameCharacterCollectionERC1155:", await erc1155.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
