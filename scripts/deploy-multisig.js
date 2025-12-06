const { ethers } = require("hardhat");

async function main() {
  const [deployer, owner1, owner2, owner3] = await ethers.getSigners();

  console.log("Deploying MultiSigWallet with deployer:", deployer.address);

  const owners = [owner1.address, owner2.address, owner3.address];
  const numConfirmationsRequired = 2;

  const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
  const wallet = await MultiSigWallet.deploy(owners, numConfirmationsRequired);

  await wallet.waitForDeployment();

  console.log("MultiSigWallet deployed at:", await wallet.getAddress());
  console.log("Owners:", owners);
  console.log("Confirmations required:", numConfirmationsRequired);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
