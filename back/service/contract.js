const {ethers} = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const contractAddress = process.env.CONTRACT_ADDRESS;

const abi = [
  "function verifyIntel(string memory _hash) public view returns (bool)",
  "function getIntel(string memory _hash) public view returns (address,uint256)"
];

const contract = new ethers.Contract(contractAddress,abi,provider);
module.exports = contract;