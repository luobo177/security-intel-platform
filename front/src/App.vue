<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="sidebar-title">威胁情报平台</div>

      <div class="menu" @click="currentPage = 'dashboard'">链上概览</div>
      <div class="menu" @click="currentPage = 'submit'">情报提交</div>
      <div class="menu" @click="currentPage = 'records'">数据查询</div>
    </aside>

    <main class="main-content">
      <div class="content-inner">
        <Dashboard v-if="currentPage === 'dashboard'" />
        <Submit v-if="currentPage === 'submit'" />
        <Records v-if="currentPage === 'records'" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Dashboard from './components/Dashboard.vue'
import Submit from './components/Submit.vue'
import Records from './components/Record.vue'

const currentPage = ref('dashboard')
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
</style>