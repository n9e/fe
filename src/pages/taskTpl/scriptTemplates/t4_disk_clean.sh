TARGET_DIR="${1:-/var/log}"
KEEP_DAYS="${2:-7}"
DRY_RUN="${3:-1}"

echo "[自愈] 目录=${TARGET_DIR} 保留=${KEEP_DAYS}天 DRY_RUN=${DRY_RUN}"

# 规范化路径：cd -P 解开符号链接与 ../、// 等等价写法，避免绕过下面的黑名单
REAL_DIR="$(cd -P -- "$TARGET_DIR" 2>/dev/null && pwd -P)" || {
  echo "[自愈] ✗ 目录无效：${TARGET_DIR}" >&2
  exit 1
}

# 安全闸：拒绝在受保护路径（及其子树）上执行
case "$REAL_DIR" in
  /|/etc|/etc/*|/bin|/bin/*|/sbin|/sbin/*|/usr|/usr/*|/lib|/lib/*|/lib64|/lib64/*|/boot|/boot/*|/root|/root/*|/home|/home/*)
    echo "[自愈] ✗ 拒绝清理受保护路径：${REAL_DIR}" >&2
    exit 1
    ;;
esac

# 兜底：规范化后不足两层目录一律拒绝（如 / 、/data）
DEPTH="$(printf '%s' "${REAL_DIR#/}" | awk -F/ '{c=0; for (i=1;i<=NF;i++) if ($i!="") c++; print c}')"
if [ "${DEPTH:-0}" -lt 2 ]; then
  echo "[自愈] ✗ 目录层级过浅，拒绝执行：${REAL_DIR}" >&2
  exit 1
fi

BEFORE="$(df -Pk "$REAL_DIR" 2>/dev/null | awk 'NR==2{print $4}')"
echo "[自愈] 清理前可用：$((BEFORE/1024)) MB"

# 用 NUL 分隔收集结果，预览 / 计数 / 删除都基于同一份列表，避免含空格 / 引号的文件名被错分词
TMPLIST="$(mktemp)" || exit 1
trap 'rm -f "$TMPLIST"' EXIT
find "$REAL_DIR" -xdev -type f \
  \( -name '*.log.*' -o -name '*.gz' -o -name '*.zip' -o -name '*.old' -o -name '*.bak' \) \
  -mtime "+${KEEP_DAYS}" -print0 > "$TMPLIST" 2>/dev/null

if [ ! -s "$TMPLIST" ]; then
  echo "[自愈] 没有符合条件的文件，无需清理"
  exit 0
fi

echo "===== 待清理文件（*.log.*/*.gz/*.zip/*.old/*.bak，mtime > ${KEEP_DAYS}天）====="
tr '\0' '\n' < "$TMPLIST" | head -n 50
COUNT="$(tr -dc '\0' < "$TMPLIST" | wc -c | tr -d ' ')"
echo "[自愈] 共匹配 ${COUNT} 个文件"

# DRY_RUN 白名单 fail-closed：只有明确的 0 才真正删除，非法值直接退出
case "$DRY_RUN" in
  1)
    echo "[自愈] DRY_RUN=1，仅预览未删除。确认无误后把第三个参数改为 0 再执行。"
    exit 0
    ;;
  0) ;;
  *)
    echo "[自愈] ✗ DRY_RUN 只接受 0 或 1，当前=${DRY_RUN}" >&2
    exit 2
    ;;
esac

xargs -0 -r rm -f -- < "$TMPLIST"
AFTER="$(df -Pk "$REAL_DIR" 2>/dev/null | awk 'NR==2{print $4}')"
echo "[自愈] ✓ 清理完成。可用：$((AFTER/1024)) MB（释放 $(((AFTER-BEFORE)/1024)) MB）"
