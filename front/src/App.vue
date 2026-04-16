<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="sidebar-title">威胁情报平台</div>

      <div class="menu" @click="currentPage = 'dashboard'">链上概览</div>
      <div class="menu" @click="currentPage = 'submit'">情报提交</div>
      <div class="menu" @click="currentPage = 'records'">数据查询</div>
      <div class="menu" v-if="isAdmin" @click="currentPage = 'management'" >管理</div>
      <!-- <div class="menu" @click="currentPage = 'management'" >管理</div> -->

      <!--连接钱包按钮-->
      <div class="wallet-box">
      <div v-if="account" class="wallet-info" @click="copyAddress">
        <span class="dot"></span>
        <span class="address">
        {{ account.slice(0,6) }}...{{ account.slice(-4) }}
        </span>
        </div>

        <button v-else class="connect-btn" @click="connectWallet">
          连接钱包
        </button>
    </div>
    </aside>

    <main class="main-content">
      <div class="content-inner">
        <Dashboard v-if="currentPage === 'dashboard'" />
        <Submit v-if="currentPage === 'submit'" />
        <Records v-if="currentPage === 'records'" />
        <Management v-if="currentPage === 'management'"></Management>
      </div>
    </main>
  </div>
</template>

<script setup>
import abi from '@/abi/IntelRegistry.json'
import { onMounted, ref} from 'vue'
import Dashboard from './components/Dashboard.vue'
import Submit from './components/Submit.vue'
import Records from './components/Record.vue'
import Management from './components/Management.vue'
import { ethers } from 'ethers'
import config from '@/config/config'

onMounted(async () => {
  if (!window.ethereum) return

  // 等一小下，让 MetaMask 状态稳定
  await new Promise(resolve => setTimeout(resolve, 100))

  let accounts = await window.ethereum.request({
    method: 'eth_accounts'
  })

  if (accounts.length === 0) return

  // ✅ 优先用 selectedAddress（更接近 UI）
  let current = window.ethereum.selectedAddress || accounts[0]

  console.log("初始化账号:", current)

  account.value = current
  isConnected.value = true

  await checkroles(current)

  // 监听切换
  window.ethereum.on('accountsChanged', (accounts) => {
    if (!accounts.length) {
      account.value = ""
      isConnected.value = false
      isAdmin.value = false
      return
    }

    account.value = accounts[0]
    checkroles(accounts[0])
  })
})

const isAdmin = ref(false)
const currentPage = ref('dashboard')
const isConnected = ref(false)
const account = ref("")
//检查角色权限函数，纯检查，无其他功能
async function checkroles(addr) {
  if (!addr) {
    isAdmin.value = false
    isConnected.value = false
    return
  }

  const provider = new ethers.BrowserProvider(window.ethereum)

  console.log("检查地址:", addr)
  console.log("合约地址:", config.contractAddress)

  const code = await provider.getCode(config.contractAddress)
  console.log("合约地址上的字节码:", code)

  if (code === "0x") {
    throw new Error("当前 contractAddress 上没有部署合约")
  }

  const contract = new ethers.Contract(
    config.contractAddress,
    abi.abi,
    provider
  )

  const role = await contract.roles(addr)
  console.log("role:", role)

  isAdmin.value = Number(role) === 1
  isConnected.value = true
}

//连接钱包按钮
async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("请先安装 MetaMask")
      return
    }
    if(account.value){
      alert("钱包已连接");
      isConnected.value=true;
      return
    }
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })
    account.value = accounts[0]
    alert("钱包连接成功");
    await checkroles();
  } catch (err) {
    console.error("连接钱包失败", err)
    alert("连接钱包失败")
  }
}

//复制地址按钮
function copyAddress(){
  navigator.clipboard.writeText(account.value)
  alert("已复制地址")
}

</script>

<style scoped>
* {
  box-sizing: border-box;
}

.app-shell {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #f3f4f6;
}

.sidebar {
  display: flex;
  flex-direction: column;
  width: 240px;
  min-width: 240px;
  height: 100vh;
  background: #111827;
  color: white;
  padding: 24px 16px;
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 28px;
}

.menu {
  padding: 14px 16px;
  margin-bottom: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.2s;
}

.menu:hover {
  background: #1f2937;
}

.main-content {
  flex: 1;
  min-width: 0;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px;
}

.content-inner {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

/* <!--连接钱包按钮--> */
.wallet-box {
  margin-top: auto;
  padding: 12px;
}

/* 已连接状态 */
.wallet-info {
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: #1f2937;
  color: #e5e7eb;

  padding: 10px;
  border-radius: 8px;

  font-size: 14px;
}

/* 绿色状态点 */
.dot {
  width: 8px;
  height: 8px;
  background-color: #22c55e;
  border-radius: 50%;
  margin-right: 8px;
}

/* 地址 */
.address {
  font-family: monospace;
}

/* 按钮 */
.connect-btn {
  width: 100%;
  padding: 10px;

  background-color: #2563eb;
  color: white;

  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.connect-btn:hover {
  background-color: #1d4ed8;
}

.wallet-info:hover {
  background-color: #374151;
  cursor: pointer;
}
</style>
