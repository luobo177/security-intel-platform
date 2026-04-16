#!/bin/bash

echo "🚀 启动项目..."

# 开一个新窗口跑 Hardhat
osascript -e 'tell application "Terminal" to do script "cd '$(pwd)'/hardhat && npx hardhat node"'

sleep 3

# 部署合约
osascript -e 'tell application "Terminal" to do script "cd '$(pwd)'/hardhat && npx hardhat run scripts/deploy.js --network localhost"'

sleep 3

# 启动后端
osascript -e 'tell application "Terminal" to do script "cd '$(pwd)'/back && node app.js"'

sleep 2

# 启动前端
osascript -e 'tell application "Terminal" to do script "cd '$(pwd)'/front && npm run dev"'

echo "✅ 全部启动完成"