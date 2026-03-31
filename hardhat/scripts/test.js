import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const contract = await ethers.getContractAt("IntelRegistry", contractAddress);

  const tx = await contract.submitIntel("hello blockchain");

  await tx.wait();

  console.log("tx hash:", tx.hash);
}

main();