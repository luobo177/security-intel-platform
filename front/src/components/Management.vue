<template>
  <div class="management-page">
    <div class="page-header">
      <h1>权限管理</h1>
    </div>

    <div class="panel">
      <h2>目标账户</h2>

      <div class="form-grid">
        <label class="field">
          <span class="field-label">钱包地址</span>
          <input
            v-model.trim="targetAddress"
            type="text"
            class="input"
            placeholder="请输入 0x 开头的钱包地址"
          />
        </label>

        <label class="field">
          <span class="field-label">角色</span>
          <select v-model="roleValue" class="input">
            <option value="1">管理员</option>
            <option value="2">普通用户</option>
            <option value="0">未注册</option>
          </select>
        </label>
      </div>

      <div class="action-row">
        <button class="primary-btn" :disabled="submitting" @click="handleSetRole">
          {{ submitting && currentAction === "setRole" ? "提交中..." : "设置角色" }}
        </button>
        <button class="danger-btn" :disabled="submitting" @click="handleBanUser">
          {{ submitting && currentAction === "banUser" ? "提交中..." : "封禁用户" }}
        </button>
        <button class="secondary-btn" :disabled="submitting" @click="handleUnbanUser">
          {{ submitting && currentAction === "unbanUser" ? "提交中..." : "解除封禁" }}
        </button>
        <button class="ghost-btn" :disabled="querying" @click="handleQueryStatus">
          {{ querying ? "查询中..." : "查询状态" }}
        </button>
      </div>
    </div>

    <div class="panel">
      <h2>执行状态</h2>
      <p class="status-text" :class="statusClass">
        {{ statusMessage || "等待操作" }}
      </p>
    </div>

    <div v-if="userStatus" class="panel">
      <h2>用户状态</h2>
      <div class="status-grid">
        <div class="status-card">
          <span class="card-label">角色</span>
          <span class="card-value">{{ roleText(userStatus.role) }}</span>
        </div>
        <div class="status-card">
          <span class="card-label">封禁状态</span>
          <span class="card-value">{{ userStatus.banned ? "已封禁" : "正常" }}</span>
        </div>
        <div class="status-card">
          <span class="card-label">封禁时间戳</span>
          <span class="card-value">{{ userStatus.banTime }}</span>
        </div>
        <div class="status-card">
          <span class="card-label">封禁时间</span>
          <span class="card-value">{{ userStatus.banTimeText }}</span>
        </div>
      </div>
    </div>

    <div v-if="txResult" class="panel">
      <h2>交易结果</h2>
      <pre class="result-box">{{ JSON.stringify(txResult, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ethers } from 'ethers'
import abi from '@/abi/IntelRegistry.json'
import config from '@/config/config'
import { checkWalletInstalled, getProvider, getSigner } from '@/BlockContact/wallet'

const targetAddress = ref('')
const roleValue = ref('2')
const submitting = ref(false)
const querying = ref(false)
const currentAction = ref('')
const statusType = ref('')
const statusMessage = ref('')
const userStatus = ref(null)
const txResult = ref(null)

const statusClass = computed(() => {
  if (statusType.value === 'success') return 'status-success'
  if (statusType.value === 'error') return 'status-error'
  return 'status-normal'
})

function roleText(role) {
  const value = Number(role)
  if (value === 1) return '管理员'
  if (value === 2) return '普通用户'
  return '未注册'
}

function formatBanTime(timestamp) {
  const value = Number(timestamp)
  if (!value) return '未封禁'
  return new Date(value * 1000).toLocaleString('zh-CN', { hour12: false })
}

function validateAddress() {
  checkWalletInstalled()

  if (!targetAddress.value) {
    throw new Error('请输入钱包地址')
  }

  if (!ethers.isAddress(targetAddress.value)) {
    throw new Error('地址格式错误')
  }

  return ethers.getAddress(targetAddress.value)
}

async function getReadContract() {
  const provider = await getProvider()
  return new ethers.Contract(config.contractAddress, abi.abi, provider)
}

async function getWriteContract() {
  const signer = await getSigner()
  return new ethers.Contract(config.contractAddress, abi.abi, signer)
}

async function handleSetRole() {
  await submitTx('setRole', async contract => {
    const address = validateAddress()
    return contract.setRole(address, Number(roleValue.value))
  }, '角色设置成功')
}

async function handleBanUser() {
  await submitTx('banUser', async contract => {
    const address = validateAddress()
    return contract.banUser(address)
  }, '用户封禁成功')
}

async function handleUnbanUser() {
  await submitTx('unbanUser', async contract => {
    const address = validateAddress()
    return contract.unbanUser(address)
  }, '用户解除封禁成功')
}

async function submitTx(action, sendTx, successMessage) {
  if (submitting.value) return

  submitting.value = true
  currentAction.value = action
  statusType.value = 'normal'
  statusMessage.value = '等待钱包确认...'
  txResult.value = null

  try {
    const contract = await getWriteContract()
    const tx = await sendTx(contract)

    statusMessage.value = '交易已发送，等待区块确认...'
    const receipt = await tx.wait()

    txResult.value = {
      action,
      txHash: tx.hash,
      blockNumber: receipt?.blockNumber,
      status: receipt?.status,
      gasUsed: receipt?.gasUsed?.toString?.()
    }

    statusType.value = 'success'
    statusMessage.value = successMessage

    await handleQueryStatus()
  } catch (err) {
    console.error(err)
    statusType.value = 'error'
    statusMessage.value = err.shortMessage || err.reason || err.message || '操作失败'
  } finally {
    submitting.value = false
    currentAction.value = ''
  }
}

async function handleQueryStatus() {
  if (querying.value) return

  querying.value = true

  try {
    const address = validateAddress()
    const contract = await getReadContract()
    const result = await contract.getUserStatus(address)

    const role = Number(result[0])
    const banTime = Number(result[1])

    userStatus.value = {
      address,
      role,
      banTime,
      banned: banTime > 0,
      banTimeText: formatBanTime(banTime)
    }

    if (!submitting.value) {
      statusType.value = 'success'
      statusMessage.value = '用户状态查询成功'
    }
  } catch (err) {
    console.error(err)
    userStatus.value = null
    statusType.value = 'error'
    statusMessage.value = err.shortMessage || err.reason || err.message || '查询失败'
  } finally {
    querying.value = false
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.management-page {
  width: 100%;
  padding: 20px;
  background: #f5f7fb;
  min-height: 100vh;
  color: #1f2937;
}

/* 头部 */
.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 600;
}

/* 卡片 */
.panel {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #eef1f6;
}

.panel h2 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
}

/* 表单 */
.form-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  color: #6b7280;
}

.input {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: #fafafa;
  font-size: 14px;
  transition: all 0.2s;
}

.input:focus {
  border-color: #2563eb;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

/* 按钮 */
.action-row {
  margin-top: 18px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn,
.danger-btn,
.ghost-btn {
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  font-weight: 500;
}

/* 主按钮 */
.primary-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
}

.primary-btn:hover {
  transform: translateY(-1px);
}

/* 次按钮 */
.secondary-btn {
  background: #10b981;
  color: #fff;
}

/* 危险 */
.danger-btn {
  background: #ef4444;
  color: #fff;
}

/* 查询 */
.ghost-btn {
  background: #e5e7eb;
  color: #374151;
}

.primary-btn:disabled,
.secondary-btn:disabled,
.danger-btn:disabled,
.ghost-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 状态 */
.status-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
}

.status-success {
  color: #16a34a;
}

.status-error {
  color: #dc2626;
}

.status-normal {
  color: #6b7280;
}

/* 用户状态卡片 */
.status-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.status-card {
  padding: 16px;
  border-radius: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  transition: 0.2s;
}

.status-card:hover {
  transform: translateY(-2px);
}

.card-label {
  font-size: 12px;
  color: #6b7280;
}

.card-value {
  font-size: 15px;
  margin-top: 6px;
  font-weight: 500;
}

/* 交易结果 */
.result-box {
  background: #111827;
  color: #22c55e;
  padding: 14px;
  border-radius: 10px;
  font-size: 13px;
  overflow-x: auto;
}

/* 响应式 */
@media (max-width: 900px) {
  .form-grid,
  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>