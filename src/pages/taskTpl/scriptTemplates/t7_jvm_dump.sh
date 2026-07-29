PROC_KEY="${1:-}"
DUMP_DIR="${2:-/tmp}"

if [ -z "$PROC_KEY" ]; then
  echo "[自愈] ✗ 未指定进程关键字。用法：进程关键字,,dump输出目录" >&2
  exit 2
fi

PID="$(pgrep -f "$PROC_KEY" 2>/dev/null | head -n1)"
if [ -z "$PID" ]; then
  echo "[自愈] ✗ 未找到匹配进程：${PROC_KEY}" >&2
  exit 1
fi
echo "[自愈] 目标进程 PID=${PID}"

mkdir -p "$DUMP_DIR" 2>/dev/null
STAMP="$(date +%Y%m%d-%H%M%S)"

# 用 mktemp -d 在 DUMP_DIR 下原子创建一个带随机后缀、0700 的专属目录：
# 既保证产物可在已知位置找到，又避免攻击者预置同名软链劫持 root 的写入
RUN_DIR="$(mktemp -d "${DUMP_DIR%/}/selfheal-${PID}.XXXXXX")" || {
  echo "[自愈] ✗ 无法创建 dump 目录：${DUMP_DIR}" >&2
  exit 1
}
echo "[自愈] 产物目录：${RUN_DIR}"

echo "===== 1. 保留现场：线程栈 ====="
if command -v jstack >/dev/null 2>&1; then
  jstack -l "$PID" > "${RUN_DIR}/jstack-${PID}-${STAMP}.txt" 2>&1 \
    && echo "[自愈] ✓ ${RUN_DIR}/jstack-${PID}-${STAMP}.txt"
else
  echo "[自愈] ! 无 jstack，跳过"
fi

echo "===== 2. 保留现场：堆内存直方图 ====="
if command -v jmap >/dev/null 2>&1; then
  jmap -histo:live "$PID" > "${RUN_DIR}/jmap-histo-${PID}-${STAMP}.txt" 2>&1 \
    && echo "[自愈] ✓ ${RUN_DIR}/jmap-histo-${PID}-${STAMP}.txt"

  # 堆 dump 体积大且会 STW，先确认磁盘空间足够（预留 2 倍 RSS）
  AVAIL_KB="$(df -Pk "$RUN_DIR" 2>/dev/null | awk 'NR==2{print $4}')"
  RSS_KB="$(ps -o rss= -p "$PID" 2>/dev/null | tr -d ' ')"
  if [ -n "$AVAIL_KB" ] && [ -n "$RSS_KB" ] && [ "$AVAIL_KB" -gt $((RSS_KB * 2)) ]; then
    echo "===== 3. 堆 dump（会 STW，请知悉）====="
    jmap -dump:live,format=b,file="${RUN_DIR}/heap-${PID}-${STAMP}.hprof" "$PID" 2>&1 \
      && echo "[自愈] ✓ ${RUN_DIR}/heap-${PID}-${STAMP}.hprof"
  else
    echo "[自愈] ! 磁盘空间不足（可用 $((AVAIL_KB/1024))MB，进程 RSS $((RSS_KB/1024))MB），跳过堆 dump"
  fi
else
  echo "[自愈] ! 无 jmap，跳过"
fi

echo "===== 4. 重启 ====="
echo "[自愈] !! 本脚本默认只保留现场、不自动重启。"
echo "[自愈] !! 确需自动重启，请取消下面两行的注释，并确认服务有守护进程会拉起。"
# kill -15 "$PID" && sleep 10
# kill -0 "$PID" 2>/dev/null && kill -9 "$PID"

echo "[自愈] 现场保留完成，产物在 ${RUN_DIR}"
