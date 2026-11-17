import { basePrefix } from '@/App';

export type AuditTargetName = 'board' | 'alert_rule' | 'notify_rule' | 'alert_mute' | 'global_alert_mute' | 'collect' | 'dashboard_topology';

export function openAuditHistory(targetName: AuditTargetName, targetId: number): void {
  const query = new URLSearchParams({ target_name: targetName, target_id: String(targetId), start: 'now-30d', end: 'now' });
  window.open(`${basePrefix}/system/audits?${query.toString()}`, '_blank', 'noopener,noreferrer');
}
