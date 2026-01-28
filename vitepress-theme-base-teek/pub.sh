#!/bin/bash

set -e

echo "🌐 切换到 npm 官方源..."
npm config set registry https://registry.npmjs.org/

echo "🛠️ 构建项目..."
npm run config:build



echo "📦 发布中..."
npm publish


# npm config set registry https://registry.npmmirror.com


echo "✅ 发布成功!"

# npm config set registry https://registry.npmmirror.com/

