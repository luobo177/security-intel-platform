import { network } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const { ethers } = await network.connect();

  const Contract = await ethers.getContractFactory("IntelRegistry");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("部署地址:", address);

  // 假设 back 和 hardhat 同级，都在 SecurityPlat 下
  const envPath = path.resolve("../back/.env");

  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf-8");
  }

  if (/^CONTRACT_ADDRESS=.*/m.test(envContent)) {
    envContent = envContent.replace(
      /^CONTRACT_ADDRESS=.*/m,
      `CONTRACT_ADDRESS=${address}`
    );
  } else {
    envContent += `\nCONTRACT_ADDRESS=${address}\n`;
  }

  fs.writeFileSync(envPath, envContent, "utf-8");
  console.log(".env 已更新 CONTRACT_ADDRESS");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});