SERVICE="${1:-}"
WAIT_SEC="${2:-5}"

if [ -z "$SERVICE" ]; then
  echo "[自愈] ✗ 未指定服务名。用法：服务名,,重启后等待秒数" >&2
  exit 2
fi

if ! command -v systemctl >/dev/null 2>&1; then
  echo "[自愈] ✗ 本机无 systemctl" >&2
  exit 1
fi

echo "===== 重启前状态 ====="
systemctl status "$SERVICE" --no-pager -l 2>&1 | head -n 20

echo
echo "===== 重启前最近日志 ====="
journalctl -u "$SERVICE" -n 30 --no-pager 2>/dev/null || echo "(journalctl 不可用)"

echo
echo "[自愈] 正在重启 ${SERVICE} ..."
if ! systemctl restart "$SERVICE"; then
  echo "[自愈] ✗ restart 命令失败" >&2
  systemctl status "$SERVICE" --no-pager -l 2>&1 | head -n 20
  exit 1
fi

sleep "$WAIT_SEC"

if systemctl is-active --quiet "$SERVICE"; then
  echo "[自愈] ✓ ${SERVICE} 已恢复运行"
  systemctl status "$SERVICE" --no-pager -l 2>&1 | head -n 10
  exit 0
else
  echo "[自愈] ✗ ${SERVICE} 重启后仍未运行，需人工介入" >&2
  systemctl status "$SERVICE" --no-pager -l 2>&1 | head -n 20
  journalctl -u "$SERVICE" -n 50 --no-pager 2>/dev/null
  exit 1
fi
