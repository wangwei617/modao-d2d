#!/bin/bash
set -e

# 创建统一的发布目录
rm -rf vercel-dist
mkdir -p vercel-dist

# 拷贝根目录静态资源
cp index.html vercel-dist/
cp -r assets vercel-dist/ || true
cp -r prd vercel-dist/ || true

# 编译子项目
cd modao-d2d-app
npm install
npm run build
cd ..

# 将编译后的前端 app 放到 vercel-dist/app 目录下
mkdir -p vercel-dist/app
cp -r modao-d2d-app/dist/* vercel-dist/app/

echo "Build complete. Files in vercel-dist:"
ls -la vercel-dist
