NGINX_BIN="${1:-nginx}"

if ! command -v "$NGINX_BIN" >/dev/null 2>&1; then
  echo "[自愈] ✗ 找不到 nginx：${NGINX_BIN}" >&2
  exit 1
fi

echo "===== 1. 配置语法校验 ====="
if ! "$NGINX_BIN" -t 2>&1; then
  echo "[自愈] ✗ 配置有语法错误，已中止 reload（保持当前配置运行）" >&2
  exit 1
fi
echo "[自愈] ✓ 配置校验通过"

echo
echo "===== 2. reload 前 worker 数 ====="
BEFORE="$(pgrep -c -f 'nginx: worker' 2>/dev/null || echo 0)"
echo "worker=${BEFORE}"

echo
echo "===== 3. 执行 reload ====="
if ! "$NGINX_BIN" -s reload 2>&1; then
  echo "[自愈] ✗ reload 失败" >&2
  exit 1
fi

sleep 3

AFTER="$(pgrep -c -f 'nginx: worker' 2>/dev/null || echo 0)"
echo "[自愈] reload 后 worker=${AFTER}"

if [ "$AFTER" -gt 0 ]; then
  echo "[自愈] ✓ reload 成功"
  exit 0
else
  echo "[自愈] ✗ reload 后无 worker 进程，需人工介入" >&2
  exit 1
fi
