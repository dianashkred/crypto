const hre = require("hardhat");

function buildCharacterData() {
  const ids = [];
  const tokenUris = [];
  const images = [];
  const attr1Names = [];
  const attr1Values = [];
  const attr2Names = [];
  const attr2Values = [];

  for (let i = 1; i <= 10; i++) {
    ids.push(i);

    tokenUris.push(`ipfs://CID_GAME_METADATA/${i}.json`);
    images.push(`ipfs://CID_GAME_IMAGES/${i}.png`);

    attr1Names.push("rarity");
    attr1Values.push(i <= 3 ? "common" : i <= 7 ? "rare" : "epic");

    attr2Names.push("speed");
    attr2Values.push(String(10 + i));
  }

  return { ids, tokenUris, images, attr1Names, attr1Values, attr2Names, attr2Values };
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const soulboundAddress = process.env.SOULBOUND_ERC721;
  const erc1155Address = process.env.GAME_ERC1155;
  const studentWallet = process.env.STUDENT_WALLET;

  if (!soulboundAddress || !erc1155Address || !studentWallet) {
    throw new Error("Set env: SOULBOUND_ERC721, GAME_ERC1155, STUDENT_WALLET");
  }

  const soulbound = await hre.ethers.getContractAt("SoulboundVisitCardERC721", soulboundAddress, deployer);
  const erc1155 = await hre.ethers.getContractAt("GameCharacterCollectionERC1155", erc1155Address, deployer);

  const visitCardUri = "ipfs://CID_VISITCARD_METADATA/visitcard.json";
  const mintTx = await soulbound.mintToStudent(studentWallet, visitCardUri);
  await mintTx.wait();

  const { ids, tokenUris, images, attr1Names, attr1Values, attr2Names, attr2Values } = buildCharacterData();

  const setupTx = await erc1155.batchSetupCharacters(
    ids,
    tokenUris,
    images,
    attr1Names,
    attr1Values,
    attr2Names,
    attr2Values
  );
  await setupTx.wait();

  const amounts = ids.map(() => 1);
  const mintBatchTx = await erc1155.mintBatchTo(deployer.address, ids, amounts, "0x");
  await mintBatchTx.wait();

  const transferIds = [1, 2];
  const transferAmounts = [1, 1];
  const transferTx = await erc1155.safeBatchTransferFrom(
    deployer.address,
    studentWallet,
    transferIds,
    transferAmounts,
    "0x"
  );
  await transferTx.wait();

  console.log("Visit card minted to:", studentWallet);
  console.log("ERC1155 batch minted to deployer:", deployer.address);
  console.log("Transferred IDs to student:", transferIds.join(", "));
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
