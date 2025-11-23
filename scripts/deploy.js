import { ethers } from "ethers";
import fs from "fs";

// 1. Загружаем ABI и bytecode из артефактов Hardhat
const artifact = JSON.parse(
  fs.readFileSync("./artifacts/contracts/MyToken.sol/MyToken.json", "utf8")
);

async function main() {
  // 2. Подключаемся к локальной Hardhat node
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  // 3. Берём первый аккаунт Hardhat
  const signer = await provider.getSigner(0);
  console.log("Deploying contract with account:", await signer.getAddress());

  // 4. Создаём контракт-фабрику вручную
  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    signer
  );

  // 5. Деплой
  const contract = await factory.deploy(ethers.parseEther("1000000"));
  await contract.waitForDeployment();

  console.log("MyToken deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
