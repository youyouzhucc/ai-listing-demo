#!/usr/bin/env bash
# ECS 上一键部署（对齐 deploy-curabot 流程：备份 .env → pull → 依赖 → 构建 → PM2 → 探测）
# 在服务器项目根执行：bash scripts/deploy-ecs.sh
# 或：npm run deploy:ecs

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PM2_APP_NAME="${PM2_APP_NAME:-ai-listing-demo}"
GIT_BRANCH="${GIT_BRANCH:-main}"
PORT="${PORT:-4173}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1:${PORT}/}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  AI Listing Demo 一键部署 (ECS + PM2)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 目录: $ROOT"

ENV_BACKUP=""
if [[ -f .env ]]; then
  ENV_BACKUP=".env.deploy-backup.$(date +%Y%m%d%H%M%S)"
  cp .env "$ENV_BACKUP"
  echo "✅ .env 已备份 -> $ENV_BACKUP"
fi

echo "📥 拉取代码 (origin ${GIT_BRANCH})..."
git fetch origin
git pull origin "$GIT_BRANCH"
echo "✅ 代码已更新"

if [[ -n "${ENV_BACKUP}" ]]; then
  if [[ ! -f .env ]]; then
    cp "$ENV_BACKUP" .env
    echo "✅ .env 已恢复"
  else
    echo "✅ .env 保持本地版本（如需用备份覆盖: cp $ENV_BACKUP .env）"
  fi
fi

echo "📦 安装依赖..."
npm install
echo "✅ 依赖已安装"

echo "🔨 构建..."
npm run build
if [[ ! -f dist/index.html ]]; then
  echo "❌ dist/index.html 不存在，构建失败" >&2
  exit 1
fi
echo "✅ dist 已生成"

echo "🔄 PM2 重启 ${PM2_APP_NAME}..."
export PORT
export PM2_APP_NAME
if command -v pm2 >/dev/null 2>&1 && pm2 describe "$PM2_APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_APP_NAME" --update-env
else
  echo "（首次：按 ecosystem 启动）"
  if ! command -v pm2 >/dev/null 2>&1; then
    echo "❌ 未找到 pm2，请先: npm i -g pm2" >&2
    exit 1
  fi
  pm2 start ecosystem.config.cjs --update-env
fi
pm2 save
echo "✅ PM2 已保存"

echo "🔍 验证服务..."
sleep 1
if curl -sf "$HEALTHCHECK_URL" >/dev/null; then
  echo "✅ 服务正常: $HEALTHCHECK_URL"
else
  echo "❌ 服务可能异常，请检查日志: pm2 logs ${PM2_APP_NAME}"
fi

echo ""
echo "部署完成！"
