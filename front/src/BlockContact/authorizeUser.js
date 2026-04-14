async function authorizeUser() {
  try {
    if (!window.ethereum) {
      alert("请先安装 MetaMask")
      return
    }

    const addr = authorizeAddress.value.trim()

    if (!addr) {
      alert("请输入授权地址")
      return
    }

    if (!ethers.isAddress(addr)) {
      alert("地址格式错误，必须是 0x 开头的钱包地址")
      return
    }

    const provider = new ethers.BrowserProvider(window.ethereum)

    const accounts = await window.ethereum.request({
      method: 'eth_accounts'
    })

    if (!accounts || accounts.length === 0) {
      alert("请先连接钱包")
      return
    }

    const signer = await provider.getSigner()
    const contract = new ethers.Contract(
      config.contractAddress,
      abi.abi,
      signer
    )

    const tx = await contract.setRole(addr, Number(level.value))
    await tx.wait()

    console.log("授权成功")
    alert("授权成功")
  } catch (err) {
    console.error("授权失败", err)
    alert("授权失败")
  }
}
export{
    authorizeUser
}