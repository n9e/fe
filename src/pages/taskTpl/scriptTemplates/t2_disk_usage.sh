SCAN_PATH="${1:-/}"

echo "[自愈] 扫描路径：${SCAN_PATH}"
if [ ! -d "$SCAN_PATH" ]; then
  echo "[自愈] 目录不存在：${SCAN_PATH}" >&2
  exit 1
fi

echo "===== 分区使用率 ====="
df -hT "$SCAN_PATH" 2>/dev/null

echo
echo "===== 一级目录占用 TOP 20 ====="
du -xh --max-depth=1 "$SCAN_PATH" 2>/dev/null | sort -rh | head -n 20

echo
echo "===== 大文件 TOP 20（>100MB）====="
find "$SCAN_PATH" -xdev -type f -size +100M -printf '%s\t%p\n' 2>/dev/null \
  | sort -rn | head -n 20 \
  | awk '{printf "%.1f GB\t%s\n", $1/1024/1024/1024, $2}'

echo
echo "===== 已删除但仍被占用的文件（句柄泄漏）====="
lsof -nP 2>/dev/null | awk '/deleted/ {sum[$1"/"$2]+=$7} END{for (k in sum) printf "%.1f MB\t%s\n", sum[k]/1024/1024, k}' \
  | sort -rn | head -n 10

echo "[自愈] 定位完成。若「已删除但被占用」占比很高，需重启对应进程而非删文件。"
