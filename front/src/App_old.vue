<script setup>
import { ref } from 'vue'
import { ethers } from 'ethers'

const API_BASE = 'http://localhost:3000'
const CONTRACT_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3'
const CONTRACT_ABI = [
  'function submitIntel(string _hash)'
]

// 提交区
const content = ref(`{
  "content": "检测到疑似SQL注入攻击",
  "attack_type": "sql_injection",
  "payload": "select * from users",
  "source_ip": "192.168.1.10",
  "severity": "high"
}`)
const submitResult = ref('')
const submitLoading = ref(false)

// 查询区
const hashQuery = ref('')
const txHashQuery = ref('')
const queryResult = ref('')
const queryLoading = ref(false)

async function calculateHash(dataObj) {
  const normalized = JSON.stringify({
    content: dataObj.content || "",
    attack_type: dataObj.attack_type || "",
    severity: dataObj.severity || "",
    source_ip: dataObj.source_ip || ""
  })

  const encoder = new TextEncoder()
  const data = encoder.encode(normalized)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
}


////////
async function submitData() {
  submitLoading.value = true
  submitResult.value = ''

  try {
    if (!window.ethereum) {
      throw new Error('未检测到 MetaMask')
    }

    const rawContent = content.value.trim()
    if (!rawContent) {
      throw new Error('内容不能为空')
    }

    const intelData = JSON.parse(rawContent)
    const hash = await calculateHash(intelData);

    await window.ethereum.request({ method: 'eth_requestAccounts' })
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const sender = await signer.getAddress()

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    )

    const tx = await contract.submitIntel(hash)
    const receipt = await tx.wait()

    const saveRes = await fetch(`${API_BASE}/saveIntel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...intelData,
        hash,
        tx_hash: tx.hash,
        sender,
        status: 'chained'
      })
    })

    const saveData = await saveRes.json()

    submitResult.value = JSON.stringify({
      message: '提交成功',
      sender,
      hash,
      tx_hash: tx.hash,
      blockNumber: receipt.blockNumber,
      backend: saveData
    }, null, 2)
  } catch (err) {
    submitResult.value = `提交失败：${err.message}`
    console.error(err)
  } finally {
    submitLoading.value = false
  }
}
///////

async function getAllData() {
  queryLoading.value = true
  queryResult.value = ''

  try {
    const res = await fetch(`${API_BASE}/getAllData`)
    const data = await res.json()
    queryResult.value = JSON.stringify(data, null, 2)
  } catch (err) {
    queryResult.value = `查询失败：${err.message}`
    console.error(err)
  } finally {
    queryLoading.value = false
  }
}

async function getByHash() {
  queryLoading.value = true
  queryResult.value = ''

  try {
    if (!hashQuery.value.trim()) {
      throw new Error('请输入 hash')
    }

    const res = await fetch(
      `${API_BASE}/getTxByHash?hash=${encodeURIComponent(hashQuery.value.trim())}`
    )
    const data = await res.json()
    queryResult.value = JSON.stringify(data, null, 2)
  } catch (err) {
    queryResult.value = `按 hash 查询失败：${err.message}`
    console.error(err)
  } finally {
    queryLoading.value = false
  }
}

async function getByTxHash() {
  queryLoading.value = true
  queryResult.value = ''

  try {
    if (!txHashQuery.value.trim()) {
      throw new Error('请输入 tx_hash')
    }

    const res = await fetch(
      `${API_BASE}/getByTxHash?tx_hash=${encodeURIComponent(txHashQuery.value.trim())}`
    )
    const data = await res.json()
    queryResult.value = JSON.stringify(data, null, 2)
  } catch (err) {
    queryResult.value = `按 tx_hash 查询失败：${err.message}`
    console.error(err)
  } finally {
    queryLoading.value = false
  }
}

function fillHashFromSubmitResult() {
  try {
    const data = JSON.parse(submitResult.value)
    if (data.hash) hashQuery.value = data.hash
    if (data.tx_hash) txHashQuery.value = data.tx_hash
  } catch {
  }
}
</script>

<template>
  <div class="page">
    <h1>网络安全情报共享平台</h1>

    <div class="card">
      <h2>1. 情报提交</h2>
      <textarea
        v-model="content"
        rows="12"
        placeholder="请输入 JSON 格式情报内容"
      ></textarea>

      <div class="btn-row">
        <button @click="submitData" :disabled="submitLoading">
          {{ submitLoading ? '提交中...' : '计算 hash + 上链 + 保存' }}
        </button>
        <button @click="fillHashFromSubmitResult" class="secondary">
          将提交结果填入查询框
        </button>
      </div>

      <pre>{{ submitResult }}</pre>
    </div>

    <div class="card">
      <h2>2. 数据查询</h2>

      <div class="query-block">
        <label>按 hash 查询</label>
        <div class="row">
          <input v-model="hashQuery" placeholder="请输入 hash" />
          <button @click="getByHash" :disabled="queryLoading">查询</button>
        </div>
      </div>

      <div class="query-block">
        <label>按 tx_hash 查询</label>
        <div class="row">
          <input v-model="txHashQuery" placeholder="请输入 tx_hash" />
          <button @click="getByTxHash" :disabled="queryLoading">查询</button>
        </div>
      </div>

      <div class="query-block">
        <label>查询全部数据</label>
        <div class="row">
          <button @click="getAllData" :disabled="queryLoading">
            {{ queryLoading ? '查询中...' : '查询全部' }}
          </button>
        </div>
      </div>

      <pre>{{ queryResult }}</pre>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 1000px;
  margin: 30px auto;
  font-family: Arial, sans-serif;
  color: #222;
}

h1 {
  margin-bottom: 20px;
  text-align: center;
}

.card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

h2 {
  margin-bottom: 14px;
  font-size: 20px;
}

textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  resize: vertical;
}

.query-block {
  margin-bottom: 18px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
}

.row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

input {
  flex: 1;
  min-width: 260px;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.btn-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 14px;
}

button {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: #222;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

button.secondary {
  background: #666;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

pre {
  margin-top: 16px;
  background: #f6f6f6;
  border-radius: 8px;
  padding: 12px;
  white-space: pre-wrap;
  word-break: break-all;
  min-height: 120px;
  overflow-x: auto;
}
</style>