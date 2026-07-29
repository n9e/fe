# 用 truncate 语义（保留 inode），写日志的进程无需重启即可继续写
LOG_DIR="${1:-/var/log}"
THRESHOLD_MB="${2:-1024}"
DRY_RUN="${3:-1}"

echo "[自愈] 目录=${LOG_DIR} 阈值=${THRESHOLD_MB}MB DRY_RUN=${DRY_RUN}"

# 规范化路径，避免符号链接 / ../ / // 等等价写法绕过下面的黑名单
REAL_DIR="$(cd -P -- "$LOG_DIR" 2>/dev/null && pwd -P)" || {
  echo "[自愈] ✗ 目录无效：${LOG_DIR}" >&2
  exit 1
}

case "$REAL_DIR" in
  /|/etc|/etc/*|/bin|/bin/*|/sbin|/sbin/*|/usr|/usr/*|/lib|/lib/*|/lib64|/lib64/*|/boot|/boot/*|/root|/root/*|/home|/home/*)
    echo "[自愈] ✗ 拒绝在受保护路径上执行：${REAL_DIR}" >&2
    exit 1
    ;;
esac

DEPTH="$(printf '%s' "${REAL_DIR#/}" | awk -F/ '{c=0; for (i=1;i<=NF;i++) if ($i!="") c++; print c}')"
if [ "${DEPTH:-0}" -lt 2 ]; then
  echo "[自愈] ✗ 目录层级过浅，拒绝执行：${REAL_DIR}" >&2
  exit 1
fi

# 匹配列表与临时目录都放在 root 独占的安全位置（mktemp 默认 /tmp，带 sticky）
TMPLIST="$(mktemp)" || exit 1
TMPD="$(mktemp -d)" || exit 1
trap 'rm -rf "$TMPLIST" "$TMPD"' EXIT

find "$REAL_DIR" -xdev -type f -name '*.log' -size "+${THRESHOLD_MB}M" -print0 > "$TMPLIST" 2>/dev/null

if [ ! -s "$TMPLIST" ]; then
  echo "[自愈] 没有超过 ${THRESHOLD_MB}MB 的 .log 文件"
  exit 0
fi

echo "===== 待截断文件 ====="
while IFS= read -r -d '' f; do
  printf '%s\t%s\n' "$(du -h "$f" 2>/dev/null | cut -f1)" "$f"
done < "$TMPLIST"

# DRY_RUN 白名单 fail-closed：只有明确的 0 才真正截断
case "$DRY_RUN" in
  1)
    echo "[自愈] DRY_RUN=1，仅预览未截断。确认无误后把第三个参数改为 0 再执行。"
    exit 0
    ;;
  0) ;;
  *)
    echo "[自愈] ✗ DRY_RUN 只接受 0 或 1，当前=${DRY_RUN}" >&2
    exit 2
    ;;
esac

while IFS= read -r -d '' f; do
  # 临时文件落在 root 独占目录，避免 ${f}.keep 落在应用可写目录被软链劫持；成功提示只在真正成功后打印
  if tail -n 1000 "$f" > "$TMPD/keep" 2>/dev/null && cat "$TMPD/keep" > "$f" 2>/dev/null; then
    echo "[自愈] ✓ 已截断（保留末尾 1000 行）：$f"
  else
    echo "[自愈] ✗ 截断失败（磁盘满或无权限？）：$f" >&2
  fi
done < "$TMPLIST"

echo "[自愈] 完成"
