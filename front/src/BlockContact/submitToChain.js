import {getSigner} from './wallet'
import config from '@/config/config'
import { ethers } from "ethers"
import abi from '@/abi/IntelRegistry.json'
async function submitToChain(hash) {
  if (!hash) {
    throw new Error('hash 不能为空')
  }
  console.log("🔥 submitToChain 被调用")
  const signer = await getSigner()
  const sender = await signer.getAddress()

  const contract = new ethers.Contract(
    config.contractAddress,
    abi.abi,
    signer
  )

  const tx = await contract.submitIntel(hash)

  if (!tx || !tx.hash) {
    throw new Error('交易发送失败')
  }

  const receipt = await tx.wait()

  if (!receipt) {
    throw new Error('交易失败：未返回回执')
  }

  if (receipt.status !== undefined && receipt.status !== 1) {
    throw new Error('交易执行失败')
  }

  return {
    sender,
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
    status: receipt.status,
    gasUsed: receipt.gasUsed.toString()
  }
}

export {
  submitToChain
}