#!/bin/bash
# 告警触发时，事件信息以 JSON 从 stdin 传入（手动执行时为空）
#   固定字段：alert_severity / alert_trigger_value / is_recovered
#   其余为事件标签：ident / __name__ / instance ...（因规则而异，注意 evt 兜底）
set -uo pipefail
export PATH=/usr/local/bin:/bin:/usr/bin:/usr/local/sbin:/usr/sbin:/sbin:$PATH

EVENT_JSON="$(cat 2>/dev/null || true)"
[ -z "$EVENT_JSON" ] && EVENT_JSON='{}'

# evt <字段名> [默认值]：从告警上下文取值
evt() {
  local key="$1" def="${2:-}" val=""
  if command -v jq >/dev/null 2>&1; then
    # 后端 stdin 由 map[string]string 序列化，字段值均为带引号的字符串（含 alert_severity/is_recovered）；
    # 用 has + != null 而非 // empty，避免万一将来出现布尔 false / 数值 0 时被误判为缺省
    val="$(printf '%s' "$EVENT_JSON" | jq -r --arg k "$key" 'if has($k) and .[$k] != null then .[$k] else empty end' 2>/dev/null)"
  else
    val="$(printf '%s' "$EVENT_JSON" | sed -n "s/.*\"${key}\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p" | head -n1)"
  fi
  [ -n "$val" ] && printf '%s' "$val" || printf '%s' "$def"
}

IDENT="$(evt ident "$(hostname)")"
SEVERITY="$(evt alert_severity 0)"
echo "[自愈] 主机=${IDENT} 级别=S${SEVERITY}"

# ====== 在下面写你的自愈逻辑 ======
