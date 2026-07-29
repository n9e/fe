#!/usr/bin/env bash
# Sync categraf sample plugin configs into public/n9e-collect-templates/.
#
# The collect-config wizard (src/pages/hosts/pages/List/CollectSetup) fetches
# these at runtime as the starting content for template-mode plugins, the same
# way DocumentDrawer fetches public/n9e-docs/**. Re-run this script when the
# pinned categraf version moves:
#
#   ./scripts/sync_collect_templates.sh [path-to-categraf-checkout]
#
# Two groups are deliberately NOT synced:
#   - system plugins that collect out of the box after install (cpu, mem, ...)
#     — there is nothing for the user to configure;
#   - plugins whose config is too involved for a copy-paste wizard (oracle's
#     485-line metric SQL, snmp MIB setup, cloud-provider credentials, ...) —
#     the docs are the right path for those.
# The wizard's catalog.ts must stay a subset of what is synced here; it points
# users at these files, so a catalog entry without a template 404s.
set -euo pipefail

CATEGRAF_DIR="${1:-$(dirname "$0")/../../../flashcatcloud/categraf}"
OUT_DIR="$(dirname "$0")/../public/n9e-collect-templates"

[ -d "$CATEGRAF_DIR/conf" ] || {
    echo "categraf checkout not found at $CATEGRAF_DIR (pass the path as the first argument)" >&2
    exit 1
}

SYSTEM_DEFAULT="cpu mem disk diskio net netstat system processes kernel kernel_vmstat linux_sysctl_fs sockstat conntrack ipvs self_metrics"
TOO_COMPLEX="oracle hadoop vsphere gnmi cloudwatch aliyun googlecloud snmp snmp_trap snmp_zabbix switch_legacy appdynamics xskyapi huatuo emc_unity redfish jolokia_agent_kafka jolokia_agent_misc"
# These ship their sample under a non-canonical file name (rocm.toml,
# conf.toml, exporter.toml) or need sidecar files (dcgm's CSVs). The wizard's
# apply script always writes conf/input.<name>/<name>.toml, so for these the
# shipped sample would survive alongside and be merged in by categraf.
NON_CANONICAL="amd_rocm_smi dcgm ipmi node_exporter"

excluded() {
    local n
    for n in $SYSTEM_DEFAULT $TOO_COMPLEX $NON_CANONICAL; do
        [ "$n" = "$1" ] && return 0
    done
    return 1
}

mkdir -p "$OUT_DIR"
# Full resync: a plugin dropped upstream must not linger here as a stale file.
rm -f "$OUT_DIR"/*.toml

count=0
for dir in "$CATEGRAF_DIR"/conf/input.*/; do
    name="$(basename "$dir")"
    name="${name#input.}"
    excluded "$name" && continue
    src="$dir$name.toml"
    if [ ! -f "$src" ]; then
        echo "skip $name: no $name.toml in $dir" >&2
        continue
    fi
    cp "$src" "$OUT_DIR/$name.toml"
    count=$((count + 1))
done

echo "synced $count templates into $OUT_DIR"
