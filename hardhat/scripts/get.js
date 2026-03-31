import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect("localhost");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const contract = await ethers.getContractAt("IntelRegistry", contractAddress);

  const intel = await contract.getIntel(1);

  console.log("id:", intel[0].toString());
  console.log("content:", intel[1]);
  console.log("sender:", intel[2]);
  console.log("timestamp:", intel[3].toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});