<template>
  <div class="submit-page">
    <h1>情报提交</h1>

    <div class="card">
      <h2>JSON 输入</h2>
      <p class="card-desc">
        请输入情报 JSON 数据，提交后将自动计算 hash、调用 MetaMask 上链，并写入后端数据库。
      </p>

      <textarea
        v-model="jsonText"
        class="json-input"
        placeholder='示例：
        {
          "content": "检测到疑似 SQL 注入攻击",
          "attack_type": "sql_injection",
          "severity": "high",
          "source_ip": "192.168.1.10"
        }'
      ></textarea>

      <div class="btn-group">
        <button class="submit-btn" @click="handleSubmit" :disabled="submitting">
          {{ submitting ? "提交中..." : "提交" }}
        </button>

        <button class="secondary-btn" @click="fillDemoData" :disabled="submitting">
          填充示例
        </button>

        <button class="secondary-btn" @click="clearForm" :disabled="submitting">
          清空
        </button>
      </div>
    </div>

    <div class="card">
      <h2>状态信息</h2>
      <p class="status-text" :class="statusClass">
        {{ resultMsg || "等待提交" }}
      </p>
    </div>

    <div class="card" v-if="resultData">
      <h2>提交结果</h2>
      <pre class="result-box">{{ formatResult(resultData) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import calculateHash from "@/utils/hash";
import { submitToChain } from "@/BlockContact/submitToChain";
import { postDataToCenter } from "@/api/postToCenter";

const resultMsg = ref("");
const resultData = ref("");
const jsonText = ref("");
const submitting = ref(false);
const submitStatus = ref(""); // success / error / ""

const statusClass = computed(() => {
  if (submitStatus.value === "success") return "status-success";
  if (submitStatus.value === "error") return "status-error";
  return "status-normal";
});

function fillDemoData() {
  jsonText.value = JSON.stringify(
    {
      content: "检测到疑似 SQL 注入攻击",
      attack_type: "sql_injection",
      severity: "high",
      source_ip: "192.168.1.10"
    },
    null,
    2
  );
}

function clearForm() {
  jsonText.value = "";
  resultMsg.value = "";
  resultData.value = "";
  submitStatus.value = "";
}

function formatResult(data) {
  if (!data) return "";
  return JSON.stringify(data, null, 2);
}

async function handleSubmit() {
  resultMsg.value = "";
  resultData.value = "";
  submitStatus.value = "";
  submitting.value = true;

  try {
    if (!jsonText.value.trim()) {
      throw new Error("请输入 JSON 数据");
    }

    const data = JSON.parse(jsonText.value);

    const normalizedData = {
      content: data.content || "",
      attack_type: data.attack_type || "",
      severity: data.severity || "",
      source_ip: data.source_ip || ""
    };

    const hash = await calculateHash(normalizedData);
    console.log("前端 hash =", hash);

    const chainResult = await submitToChain(hash);
    console.log("链上结果 =", chainResult);

    const payload = {
      ...normalizedData,
      hash,
      sender: chainResult.sender,
      tx_hash: chainResult.txHash
    };

    const centerRes = await postDataToCenter(payload);
    console.log("后端返回 =", centerRes);

    resultMsg.value = "提交成功：已完成上链并写入中心数据库";
    resultData.value = {
      hash,
      sender: chainResult.sender,
      tx_hash: chainResult.txHash,
      receipt: chainResult.receipt,
      centerRes
    };
    submitStatus.value = "success";
  } catch (err) {
    console.error(err);
    resultMsg.value = `提交失败：${err.message || err}`;
    resultData.value = "";
    submitStatus.value = "error";
  } finally {
    submitting.value = false;
  }
}


</script>

<style scoped>
* {
  box-sizing: border-box;
}

.submit-page {
  width: 100%;
  margin: 0;
  padding: 0;
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

.card {
  width: 100%;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 20px;
}

.card-desc {
  margin: 0 0 14px 0;
  color: #6b7280;
  line-height: 1.7;
  font-size: 14px;
}

.json-input {
  width: 100%;
  min-height: 260px;
  margin-top: 8px;
  padding: 14px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background: #ffffff;
  color: #111827;
  font-size: 14px;
  line-height: 1.7;
  resize: vertical;
  outline: none;
  font-family: Consolas, Monaco, monospace;
}

.json-input:focus {
  border-color: #409eff;
}

.btn-group {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.submit-btn,
.secondary-btn {
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;
}

.submit-btn {
  background: #409eff;
  color: #ffffff;
}

.submit-btn:hover {
  background: #2f86db;
}

.secondary-btn {
  background: #6b7280;
  color: #ffffff;
}

.secondary-btn:hover {
  background: #4b5563;
}

.submit-btn:disabled,
.secondary-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.status-text {
  margin: 0;
  line-height: 1.7;
  font-size: 14px;
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

.result-box {
  margin: 0;
  padding: 14px;
  background: #111827;
  color: #22c55e;
  border-radius: 10px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.7;
  font-size: 14px;
}

@media (max-width: 768px) {
  .btn-group {
    flex-direction: column;
  }

  .submit-btn,
  .secondary-btn {
    width: 100%;
  }

  .json-input {
    min-height: 220px;
  }
}
</style>