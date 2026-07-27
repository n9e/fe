PROC_KEY="${1:-}"
PORT="${2:-}"

RC=0

if [ -n "$PROC_KEY" ]; then
  echo "===== 进程检查：${PROC_KEY} ====="
  if pgrep -af "$PROC_KEY" 2>/dev/null; then
    echo "[自愈] 进程存活，实例数：$(pgrep -cf "$PROC_KEY")"
  else
    echo "[自愈] ✗ 未找到进程：${PROC_KEY}" >&2
    RC=1
  fi
  echo
fi

if [ -n "$PORT" ]; then
  echo "===== 端口检查：${PORT} ====="
  if ss -tlnp 2>/dev/null | grep -q ":${PORT}\b" || netstat -tlnp 2>/dev/null | grep -q ":${PORT}\b"; then
    ss -tlnp 2>/dev/null | grep ":${PORT}\b" || netstat -tlnp 2>/dev/null | grep ":${PORT}\b"
    echo "[自愈] 端口监听正常"
  else
    echo "[自愈] ✗ 端口未监听：${PORT}" >&2
    RC=1
  fi
fi

if [ -z "$PROC_KEY" ] && [ -z "$PORT" ]; then
  echo "[自愈] 未传入参数。用法：进程关键字,,端口" >&2
  exit 2
fi

exit $RC
