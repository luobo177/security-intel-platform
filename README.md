# 区块链威胁情报共享平台

## 项目简介
本项目实现了一个基于区块链的网络威胁情报共享系统。

## 技术栈
- 前端：Vue3
- 后端：Node.js + Express
- 区块链：Ethereum（Hardhat）
- 数据库：MySQL

## 核心功能
- 情报提交（JSON）
- SHA256 hash 上链存证
- 数据库存储全文
- 链上 + 本地校验
- 数据查询与验证

## 系统架构
前端 → 后端 → 区块链 + 数据库

## 运行方式
前端：
npm install
npm run dev

后端：
npm install
node app.js