<template>
  <div class="dashboard-page">
    <div class="dashboard-container">
      <div class="page-header">
        <h1 class="page-title">Blockchain Dashboard</h1>
        <p class="page-desc">链上存证总览与最新区块记录</p>
      </div>

      <section class="panel overview-panel">
        <div class="panel-header">
          <h2>区块链总览</h2>
          <span class="panel-subtitle">当前系统链上存证运行状态</span>
        </div>

        <div class="overview-grid">
          <div class="stat-card">
            <div class="stat-label">总数据数</div>
            <div class="stat-value">{{ totalRecords }}</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">合约地址</div>
            <div class="stat-value stat-value-address" :title="contractAddress">
              {{ shortMiddle(contractAddress, 10, 8) }}
            </div>
            <div class="stat-extra">{{ contractAddress }}</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">网络</div>
            <div class="stat-value stat-value-small">{{ networkName }}</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">最近更新时间</div>
            <div class="stat-value stat-value-small">{{ latestUpdateText }}</div>
          </div>
        </div>
      </section>

      <section class="panel blocks-panel">
        <div class="panel-header">
          <h2>最新 8 个块</h2>
          <span class="panel-subtitle">最近上链存证记录可视化展示</span>
        </div>

        <div v-if="latestBlocks.length === 0" class="empty-box">
          暂无数据
        </div>

        <div v-else class="blocks-grid">
          <div
            v-for="(block, index) in latestBlocks"
            :key="block.id || block.hash || index"
            class="block-card"
          >
            <div class="block-top">
              <div class="block-badge">Block #{{ block.id ?? index + 1 }}</div>
              <div class="status-badge" :class="getStatusClass(block)">
                {{ getStatusText(block) }}
              </div>
            </div>

            <div class="block-content">
              <div class="info-row">
                <span class="info-label">Hash</span>
                <span class="info-value mono" :title="block.hash">
                  {{ shortMiddle(block.hash, 8, 6) }}
                </span>
              </div>

              <div class="info-row">
                <span class="info-label">Tx Hash</span>
                <span class="info-value mono" :title="block.tx_hash">
                  {{ shortMiddle(block.tx_hash, 8, 6) }}
                </span>
              </div>

              <div class="info-row">
                <span class="info-label">Sender</span>
                <span class="info-value mono" :title="block.sender">
                  {{ shortMiddle(block.sender, 8, 6) }}
                </span>
              </div>

              <div class="info-row">
                <span class="info-label">Time</span>
                <span class="info-value">
                  {{ formatTime(block.created_at) }}
                </span>
              </div>

              <div class="info-row info-row-last">
                <span class="info-label">Severity</span>
                <span
                  class="severity-badge"
                  :class="getSeverityClass(block.severity)"
                >
                  {{ block.severity || "unknown" }}
                </span>
              </div>
            </div>

            <div class="block-footer">
              <div class="footer-line"></div>
              <span class="footer-text">On-chain Record</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { shortMiddle, formatTime } from "@/utils/format"
import config from "@/config/config"

const networkName = "Hardhat Local"
const contractAddress = config.contractAddress

const records = ref([])
const loading = ref(false)
const errorMsg = ref("")
const totalRecords = computed(() => records.value.length)

const sortedRecords = computed(() => {
  return [...records.value].sort((a, b) => {
    const ta = new Date(a.created_at || 0).getTime()
    const tb = new Date(b.created_at || 0).getTime()
    return tb - ta
  })
})

const latestBlocks = computed(() => sortedRecords.value.slice(0, 8))

const latestUpdateText = computed(() => {
  if (!sortedRecords.value.length) return "-"
  return formatTime(sortedRecords.value[0].created_at)
})

onMounted(() => {
  fetchAllData()
})

async function getAllData() {
  const res = await fetch(`${config.baseUrl}/getAllData`)
  const result = await res.json()

  if (!res.ok) {
    throw new Error(result.error || result.message || "获取数据失败")
  }

  // 适配你的后端返回格式
  return Array.isArray(result.data) ? result.data : []
}

async function fetchAllData() {
  loading.value = true
  errorMsg.value = ""

  try {
    const data = await getAllData()
    records.value = data
    console.log("dashboard records:", data)
  } catch (err) {
    errorMsg.value = err.message
    records.value = []
    console.error("Dashboard 获取数据失败:", err)
  } finally {
    loading.value = false
  }
}

function getStatusText(block) {
  if (block.verify === true) return "Verified"
  if (block.verify === false) return "Tampered"
  return "Unknown"
}

function getStatusClass(block) {
  if (block.verify === true) return "status-ok"
  if (block.verify === false) return "status-error"
  return "status-unknown"
}

function getSeverityClass(severity) {
  if (!severity) return "severity-unknown"

  const value = String(severity).toLowerCase()
  if (value === "high") return "severity-high"
  if (value === "medium") return "severity-medium"
  if (value === "low") return "severity-low"
  return "severity-unknown"
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.dashboard-page {
  height: 100vh;
  overflow: hidden;
  padding: 12px 16px;
  background: #f3f6fb;
  color: #1f2937;
}

.dashboard-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.page-header {
  flex: 0 0 auto;
}

.page-title {
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
  color: #111827;
}

.page-desc {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #6b7280;
}

.panel {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 14px 16px;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
}

.overview-panel {
  flex: 0 0 auto;
}

.blocks-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.panel-header h2 {
  margin: 0;
  font-size: 20px;
  color: #111827;
}

.panel-subtitle {
  font-size: 12px;
  color: #6b7280;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.stat-card {
  min-height: 92px;
  padding: 14px;
  border-radius: 14px;
  background: linear-gradient(180deg, #f8fbff 0%, #f3f7fd 100%);
  border: 1px solid #dbe7f5;
  overflow: hidden;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  color: #0f172a;
  word-break: break-word;
}

.stat-value-small {
  font-size: 18px;
}

.stat-value-address {
  font-size: 18px;
}

.stat-extra {
  margin-top: 6px;
  font-size: 11px;
  color: #94a3b8;
  word-break: break-all;
}

.blocks-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 12px;
  overflow: hidden;
}

.block-card {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 14px;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #dbe4ee;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.block-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}

.block-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.block-badge {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: #e8f1ff;
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.status-ok {
  background: #eaf8ef;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.status-error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.status-unknown {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.block-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-bottom: 6px;
  border-bottom: 1px solid #eef2f7;
  min-width: 0;
}

.info-row-last {
  border-bottom: none;
  padding-bottom: 0;
}

.info-label {
  font-size: 11px;
  color: #6b7280;
  letter-spacing: 0.2px;
}

.info-value {
  font-size: 13px;
  color: #1f2937;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mono {
  font-family: Consolas, Menlo, Monaco, monospace;
}

.severity-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 24px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.severity-high {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.severity-medium {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fde68a;
}

.severity-low {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.severity-unknown {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.block-footer {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, #93c5fd, transparent);
}

.footer-text {
  font-size: 11px;
  color: #3b82f6;
  white-space: nowrap;
}

.empty-box {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 15px;
  border-radius: 14px;
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
}

@media (max-width: 1200px) {
  .dashboard-page {
    height: auto;
    overflow: auto;
  }

  .dashboard-container {
    height: auto;
  }

  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .blocks-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: auto;
    overflow: auto;
  }
}

@media (max-width: 768px) {
  .overview-grid,
  .blocks-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 24px;
  }
}
</style>