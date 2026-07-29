echo "===== 1. 系统负载 ====="
uptime
echo
echo "===== 2. CPU Top 10 ====="
ps -eo pid,ppid,user,pcpu,pmem,etime,cmd --sort=-pcpu 2>/dev/null | head -n 11
echo
echo "===== 3. 内存 Top 10 ====="
ps -eo pid,ppid,user,pcpu,pmem,etime,cmd --sort=-pmem 2>/dev/null | head -n 11
echo
echo "===== 4. 内存总览 ====="
free -h 2>/dev/null || vm_stat
echo
echo "===== 5. 磁盘使用 ====="
df -hT 2>/dev/null | grep -Ev '^(tmpfs|devtmpfs|overlay)'
echo
echo "===== 6. inode 使用 ====="
df -i 2>/dev/null | grep -Ev '^(tmpfs|devtmpfs|overlay)'
echo
echo "===== 7. 监听端口 ====="
ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null
echo
echo "===== 8. TCP 连接状态统计 ====="
ss -ant 2>/dev/null | awk 'NR>1{s[$1]++} END{for (k in s) print k, s[k]}'
echo
echo "===== 9. 最近内核消息（OOM / 硬件错误）====="
dmesg -T 2>/dev/null | tail -n 30 || dmesg 2>/dev/null | tail -n 30
echo
echo "[自愈] 快照采集完成"
