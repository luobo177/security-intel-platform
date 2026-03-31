import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect("localhost");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const contract = await ethers.getContractAt("IntelRegistry", contractAddress);

  const tx = await contract.submitIntel("这是一条测试情报");
  await tx.wait();

  console.log("提交成功");
  const count = await contract.intelCount();
  console.log("当前情报总数:", count.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});