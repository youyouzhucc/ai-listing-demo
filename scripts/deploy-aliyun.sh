#!/usr/bin/env bash
# 阿里云一键部署：本地 build 后同步到 OSS 或 ECS 目录
# 用法：
#   cp .env.deploy.example .env.deploy   # 填好变量
#   npm run deploy
#
# 依赖：
#   - OSS：安装 ossutil（https://help.aliyun.com/document_detail/120075.html）
#   - SSH：本机 ssh/rsync，服务器已配置密钥登录

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -f .env.deploy ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.deploy
  set +a
fi

DEPLOY_TARGET="${DEPLOY_TARGET:-oss}"

ossutil_bin() {
  if command -v ossutil >/dev/null 2>&1; then
    echo "ossutil"
  elif command -v ossutil64 >/dev/null 2>&1; then
    echo "ossutil64"
  else
    echo ""
  fi
}

echo "==> install & build"
npm install
npm run build

if [[ ! -d dist ]]; then
  echo "dist/ 不存在，build 失败" >&2
  exit 1
fi

case "$DEPLOY_TARGET" in
  oss)
    OU="$(ossutil_bin)"
    if [[ -z "$OU" ]]; then
      echo "未找到 ossutil，请先安装：https://help.aliyun.com/document_detail/120075.html" >&2
      exit 1
    fi
    : "${OSS_BUCKET:?请在 .env.deploy 设置 OSS_BUCKET}"
    : "${OSS_ENDPOINT:?请在 .env.deploy 设置 OSS_ENDPOINT}"
    : "${OSS_ACCESS_KEY_ID:?请在 .env.deploy 设置 OSS_ACCESS_KEY_ID}"
    : "${OSS_ACCESS_KEY_SECRET:?请在 .env.deploy 设置 OSS_ACCESS_KEY_SECRET}"

    PREFIX="${OSS_PREFIX:-}"
    PREFIX="${PREFIX#/}"
    if [[ -n "$PREFIX" && "${PREFIX: -1}" != '/' ]]; then
      PREFIX="${PREFIX}/"
    fi
    DEST="oss://${OSS_BUCKET}/${PREFIX}"

    echo "==> ossutil sync -> ${DEST}"
    "$OU" sync ./dist/ "$DEST" \
      -e "$OSS_ENDPOINT" \
      -i "$OSS_ACCESS_KEY_ID" \
      -k "$OSS_ACCESS_KEY_SECRET" \
      --delete -f
    echo "完成。请在 OSS 控制台开启「静态页面」并设置 index.html；SPA 需把 404 也指向 index.html。"
    ;;
  ssh)
    : "${SSH_USER:?请在 .env.deploy 设置 SSH_USER}"
    : "${SSH_HOST:?请在 .env.deploy 设置 SSH_HOST}"
    REMOTE_DIR="${REMOTE_DIR:?请在 .env.deploy 设置 REMOTE_DIR}"
    SSH_PORT="${SSH_PORT:-22}"
    RSYNC_RSH=(ssh -p "$SSH_PORT" -o StrictHostKeyChecking=accept-new)
    if [[ -n "${SSH_IDENTITY:-}" ]]; then
      RSYNC_RSH+=(-i "$SSH_IDENTITY")
    fi
    printf -v RSYNC_RSH_CMD '%q ' "${RSYNC_RSH[@]}"

    echo "==> rsync dist/ -> ${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}/"
    rsync -avz --delete -e "$RSYNC_RSH_CMD" \
      ./dist/ "${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}/"

    if [[ -n "${NGINX_RELOAD_CMD:-}" ]]; then
      echo "==> reload nginx"
      "${RSYNC_RSH[@]}" "${SSH_USER}@${SSH_HOST}" "bash -lc $(printf '%q' "$NGINX_RELOAD_CMD")"
    fi
    echo "完成。请确认 Nginx 对 SPA 配置了 try_files / 404 回退 index.html。"
    ;;
  *)
    echo "未知 DEPLOY_TARGET=${DEPLOY_TARGET}，请使用 oss 或 ssh" >&2
    exit 1
    ;;
esac
