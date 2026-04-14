<template>
  <div class="page">
    <h1>情报数据查询</h1>

    <div class="toolbar-grid">
      <div class="card">
        <h2>查询全部数据</h2>
        <button @click="handleGetAll" :disabled="loading">查询全部</button>
      </div>

      <div class="card">
        <h2>按 hash 查询</h2>
        <input
          v-model="hashValue"
          type="text"
          placeholder="请输入 hash"
        />
        <div class="btn-group">
          <button @click="handleGetByHash" :disabled="loading">按 hash 查询</button>
        </div>
      </div>

      <div class="card">
        <h2>按 tx_hash 查询</h2>
        <input
          v-model="txHashValue"
          type="text"
          placeholder="请输入 tx_hash"
        />
        <div class="btn-group">
          <button @click="handleGetByTxHash" :disabled="loading">按 tx_hash 查询</button>
        </div>
      </div>

      <div class="card">
        <h2>操作</h2>
        <div class="btn-group">
          <button class="btn-secondary" @click="clearResult">清空结果</button>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>状态信息</h2>
      <p class="status-text">{{ resultMsg }}</p>
    </div>

    <div class="card result-card">
      <div class="result-header">
        <h2>查询结果</h2>
        <div class="result-count" v-if="resultData.length > 0">
          共 {{ resultData.length }} 条
        </div>
      </div>

      <div v-if="loading" class="loading-box">加载中...</div>

      <div v-else-if="resultData.length > 0" class="result-list">
        <div
          v-for="item in resultData"
          :key="item.id || item.hash || item.tx_hash"
          class="result-item"
        >
          <div class="field">
            <div class="label">ID</div>
            <div class="value">{{ item.id ?? "无" }}</div>
          </div>

          <div class="field">
            <div class="label">攻击类型</div>
            <div class="value">{{ item.attack_type || "无" }}</div>
          </div>

          <div class="field">
            <div class="label">危险等级</div>
            <div class="value">{{ item.severity || "无" }}</div>
          </div>

          <div class="field">
            <div class="label">来源 IP</div>
            <div class="value">{{ item.source_ip || "无" }}</div>
          </div>

          <div class="field">
            <div class="label">创建时间</div>
            <div class="value">{{ item.created_at || "无" }}</div>
          </div>

          <div class="field">
            <div class="label">提交者</div>
            <div class="scroll-box">{{ item.sender || "无" }}</div>
          </div>

          <div class="field field-full">
            <div class="label">内容</div>
            <pre class="content-box">{{ item.content || "无" }}</pre>
          </div>

          <div class="field field-full">
            <div class="label">Hash</div>
            <div class="scroll-box">{{ item.hash || "无" }}</div>
          </div>

          <div class="field field-full">
            <div class="label">交易 Hash</div>
            <div class="scroll-box">{{ item.tx_hash || "无" }}</div>
          </div>
        </div>
      </div>

      <pre v-else class="raw-box">{{ rawResult || "暂无结果" }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { getAllData, getByHash, getByTxHash } from "@/api/getFromCenter";

const hashValue = ref("");
const txHashValue = ref("");
const resultMsg = ref("等待查询");
const rawResult = ref("");
const resultData = ref([]);
const loading = ref(false);

function clearResult() {
  resultMsg.value = "结果已清空";
  rawResult.value = "";
  resultData.value = [];
  hashValue.value = "";
  txHashValue.value = "";
}

async function handleGetAll() {
  loading.value = true;
  resultMsg.value = "正在查询全部数据...";
  rawResult.value = "";
  resultData.value = [];

  try {
    const data = await getAllData();

    resultMsg.value = data.message || "查询成功";
    rawResult.value = JSON.stringify(data, null, 2);

    if (Array.isArray(data.data)) {
      resultData.value = data.data;
    } else {
      resultData.value = [];
    }
  } catch (err) {
    resultMsg.value = `查询失败：${err.message}`;
    rawResult.value = "";
    resultData.value = [];
  } finally {
    loading.value = false;
  }
}

async function handleGetByHash() {
  if (!hashValue.value.trim()) {
    resultMsg.value = "请先输入 hash";
    return;
  }

  loading.value = true;
  resultMsg.value = "正在按 hash 查询...";
  rawResult.value = "";
  resultData.value = [];

  try {
    const data = await getByHash(hashValue.value);

    resultMsg.value = data.message || "查询成功";
    rawResult.value = JSON.stringify(data, null, 2);

    if (Array.isArray(data.data)) {
      resultData.value = data.data;
    } else if (data.data) {
      resultData.value = [data.data];
    } else if (data.hash || data.tx_hash || data.content) {
      resultData.value = [data];
    } else {
      resultData.value = [];
    }
  } catch (err) {
    resultMsg.value = `查询失败：${err.message}`;
    rawResult.value = "";
    resultData.value = [];
  } finally {
    loading.value = false;
  }
}

async function handleGetByTxHash() {
  if (!txHashValue.value.trim()) {
    resultMsg.value = "请先输入 tx_hash";
    return;
  }

  loading.value = true;
  resultMsg.value = "正在按 tx_hash 查询...";
  rawResult.value = "";
  resultData.value = [];

  try {
    const data = await getByTxHash(txHashValue.value);

    resultMsg.value = data.message || "查询成功";
    rawResult.value = JSON.stringify(data, null, 2);

    if (Array.isArray(data.data)) {
      resultData.value = data.data;
    } else if (data.data) {
      resultData.value = [data.data];
    } else if (data.hash || data.tx_hash || data.content) {
      resultData.value = [data];
    } else {
      resultData.value = [];
    }
  } catch (err) {
    resultMsg.value = `查询失败：${err.message}`;
    rawResult.value = "";
    resultData.value = [];
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.page {
  width: 100%;
  padding: 0;
  margin: 0;
  color: #111827;
  font-family: Arial, sans-serif;
}

h1 {
  margin: 0 0 20px 0;
  font-size: 28px;
  color: #111827;
}

h2 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #1f2937;
}

.toolbar-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 20px;
}

.card {
  width: 100%;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 20px;
}

.toolbar-grid .card {
  margin-bottom: 0;
}

input {
  width: 100%;
  padding: 11px 12px;
  margin-top: 6px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #fff;
  font-size: 14px;
  outline: none;
}

input:focus {
  border-color: #409eff;
}

button {
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  background: #409eff;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;
}

button:hover {
  background: #2f86db;
}

button:disabled {
  background: #9bbfe7;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6b7280;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-group {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.status-text {
  margin: 0;
  color: #374151;
  line-height: 1.7;
  word-break: break-all;
}

.result-card {
  overflow: visible;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.result-count {
  font-size: 13px;
  color: #6b7280;
}

.loading-box {
  padding: 20px 0;
  color: #374151;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-item {
  width: 100%;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 18px;
}

.field {
  min-width: 0;
}

.field-full {
  grid-column: 1 / -1;
}

.label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
}

.value {
  color: #111827;
  line-height: 1.6;
  word-break: break-word;
}

.scroll-box {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  color: #111827;
  line-height: 1.6;
}

.content-box {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: pre;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  margin: 0;
  color: #111827;
  font-size: 14px;
  line-height: 1.6;
}

.raw-box {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  background: #111827;
  color: #22c55e;
  padding: 12px;
  border-radius: 8px;
  white-space: pre;
  margin: 0;
}

@media (max-width: 900px) {
  .toolbar-grid {
    grid-template-columns: 1fr;
  }

  .result-item {
    grid-template-columns: 1fr;
  }

  .field-full {
    grid-column: auto;
  }
}

@media (max-width: 768px) {
  button {
    width: 100%;
  }

  .result-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>