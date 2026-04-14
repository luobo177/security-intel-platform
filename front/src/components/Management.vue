<template>
  <div class="management-page">
    <div class="page-header">
      <h1>Ȩ�޹���</h1>
      <p class="page-desc">����Ա�����������ý�ɫ������û�������������ѯ�˻�״̬��</p>
    </div>

    <div class="panel">
      <h2>Ŀ���˻�</h2>
      <p class="panel-desc">����Ҫ������Ǯ����ַ������д��������ͨ����ǰ MetaMask �˻��������Ͻ��ס�</p>

      <div class="form-grid">
        <label class="field">
          <span class="field-label">Ǯ����ַ</span>
          <input
            v-model.trim="targetAddress"
            type="text"
            class="input"
            placeholder="������ 0x ��ͷ��Ǯ����ַ"
          />
        </label>

        <label class="field">
          <span class="field-label">��ɫ</span>
          <select v-model="roleValue" class="input">
            <option value="1">����Ա</option>
            <option value="2">��ͨ��Ա</option>
            <option value="0">δע��</option>
          </select>
        </label>
      </div>

      <div class="action-row">
        <button type="button" class="primary-btn" :disabled="submitting" @click="handleSetRole">
          {{ submitting && currentAction === "setRole" ? "�ύ��..." : "���ý�ɫ" }}
        </button>
        <button type="button" class="danger-btn" :disabled="submitting" @click="handleBanUser">
          {{ submitting && currentAction === "banUser" ? "�ύ��..." : "����û�" }}
        </button>
        <button type="button" class="secondary-btn" :disabled="submitting" @click="handleUnbanUser">
          {{ submitting && currentAction === "unbanUser" ? "�ύ��..." : "������" }}
        </button>
        <button type="button" class="ghost-btn" :disabled="querying" @click="handleQueryStatus">
          {{ querying ? "��ѯ��..." : "��ѯ״̬" }}
        </button>
      </div>
    </div>

    <div class="panel">
      <h2>ִ��״̬</h2>
      <p class="status-text" :class="statusClass">
        {{ statusMessage || "�ȴ�����" }}
      </p>
    </div>

    <div v-if="userStatus" class="panel">
      <h2>�û�״̬</h2>
      <div class="status-grid">
        <div class="status-card">
          <span class="card-label">��ɫ</span>
          <span class="card-value">{{ roleText(userStatus.role) }}</span>
        </div>
        <div class="status-card">
          <span class="card-label">���״̬</span>
          <span class="card-value">{{ userStatus.banned ? "�ѷ��" : "����" }}</span>
        </div>
        <div class="status-card">
          <span class="card-label">���ʱ���</span>
          <span class="card-value">{{ userStatus.banTime }}</span>
        </div>
        <div class="status-card">
          <span class="card-label">���ʱ��</span>
          <span class="card-value">{{ userStatus.banTimeText }}</span>
        </div>
      </div>
    </div>

    <div v-if="txResult" class="panel">
      <h2>���׽��</h2>
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
  if (value === 1) return '����Ա'
  if (value === 2) return '��ͨ��Ա'
  return 'δע��'
}

function formatBanTime(timestamp) {
  const value = Number(timestamp)
  if (!value) return 'δ���'
  return new Date(value * 1000).toLocaleString('zh-CN', { hour12: false })
}

function validateAddress() {
  checkWalletInstalled()

  if (!targetAddress.value) {
    throw new Error('������Ǯ����ַ')
  }

  if (!ethers.isAddress(targetAddress.value)) {
    throw new Error('��ַ��ʽ����')
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
  await submitTx(
    'setRole',
    async contract => {
      const address = validateAddress()
      return contract.setRole(address, Number(roleValue.value))
    },
    '��ɫ���óɹ�'
  )
}

async function handleBanUser() {
  await submitTx(
    'banUser',
    async contract => {
      const address = validateAddress()
      return contract.banUser(address)
    },
    '�û�����ɹ�'
  )
}

async function handleUnbanUser() {
  await submitTx(
    'unbanUser',
    async contract => {
      const address = validateAddress()
      return contract.unbanUser(address)
    },
    '�û��������ɹ�'
  )
}

async function submitTx(action, sendTx, successMessage) {
  if (submitting.value) return

  submitting.value = true
  currentAction.value = action
  statusType.value = 'normal'
  statusMessage.value = '�ȴ�Ǯ��ȷ��...'
  txResult.value = null

  try {
    const contract = await getWriteContract()
    const tx = await sendTx(contract)
    statusMessage.value = '�����ѷ��ͣ��ȴ�����ȷ��...'
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
    statusMessage.value = err.shortMessage || err.reason || err.message || '����ʧ��'
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
      statusMessage.value = '�û�״̬��ѯ�ɹ�'
    }
  } catch (err) {
    console.error(err)
    userStatus.value = null
    statusType.value = 'error'
    statusMessage.value = err.shortMessage || err.reason || err.message || '��ѯʧ��'
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
  padding: 0;
  color: #111827;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
}

.page-desc {
  margin: 8px 0 0 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.7;
}

.panel {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 20px;
}

.panel h2 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #1f2937;
}

.panel-desc {
  margin: 0 0 14px 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.7;
}

.form-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 13px;
  color: #374151;
}

.input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #ffffff;
  color: #111827;
  font-size: 14px;
  outline: none;
}

.input:focus {
  border-color: #2563eb;
}

.action-row {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.primary-btn,
.secondary-btn,
.danger-btn,
.ghost-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  color: #ffffff;
}

.primary-btn {
  background: #2563eb;
}

.secondary-btn {
  background: #0f766e;
}

.danger-btn {
  background: #dc2626;
}

.ghost-btn {
  background: #6b7280;
}

.primary-btn:disabled,
.secondary-btn:disabled,
.danger-btn:disabled,
.ghost-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.status-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-all;
}

.status-normal {
  color: #374151;
}

.status-success {
  color: #16a34a;
}

.status-error {
  color: #dc2626;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.status-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
}

.card-label {
  font-size: 12px;
  color: #6b7280;
}

.card-value {
  font-size: 15px;
  color: #111827;
  word-break: break-word;
}

.result-box {
  margin: 0;
  padding: 14px;
  border-radius: 10px;
  background: #111827;
  color: #22c55e;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 14px;
  line-height: 1.7;
}

@media (max-width: 960px) {
  .form-grid,
  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>
