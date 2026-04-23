#!/bin/bash
set -e

# 创建统一的发布目录
rm -rf vercel-dist
mkdir -p vercel-dist

# 拷贝根目录静态资源
cp index.html vercel-dist/
[ -d assets ] && cp -r assets vercel-dist/
[ -d prd ] && cp -r prd vercel-dist/

# 编译子项目 modaoai-0416（Vite base: /app/，产物需落在 vercel-dist/app/）
cd modaoai-0416
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi
npm run build
cd ..

# 将编译后的前端 app 放到 vercel-dist/app 目录下
mkdir -p vercel-dist/app
cp -r modaoai-0416/dist/* vercel-dist/app/

echo "Build complete. Files in vercel-dist:"
ls -la vercel-dist
