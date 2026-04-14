import { ethers } from 'ethers'

function checkWalletInstalled() {
  if (!window.ethereum) {
    throw new Error('未检测到 MetaMask')
  }
}

async function getProvider() {
  checkWalletInstalled()
  return new ethers.BrowserProvider(window.ethereum)
}

async function getAccount() {
  checkWalletInstalled()

  const accounts = await window.ethereum.request({
    method: 'eth_accounts'
  })

  return accounts && accounts.length > 0 ? accounts[0] : ''
}

async function checkWalletConnected() {
  const account = await getAccount()

  if (!account) {
    throw new Error('钱包未连接，请先连接钱包')
  }

  return account
}

async function connectWallet() {
  checkWalletInstalled()

  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  })

  if (!accounts || accounts.length === 0) {
    throw new Error('钱包连接失败')
  }

  return accounts[0]
}

async function getSigner() {
  const account = await checkWalletConnected()
  const provider = await getProvider()
  const signer = await provider.getSigner()
  const signerAddress = await signer.getAddress()

  if (signerAddress.toLowerCase() !== account.toLowerCase()) {
    throw new Error('当前钱包账户与已连接账户不一致')
  }

  return signer
}

export {
  checkWalletInstalled,
  getProvider,
  getAccount,
  checkWalletConnected,
  connectWallet,
  getSigner
}
