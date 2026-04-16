import type { TFunction } from 'i18next';
import moment from 'moment';

export type BeatTimeDisplayKind = 'relative' | 'absolute';

export interface BeatTimeDisplay {
  kind: BeatTimeDisplayKind;
  /** Shown when kind === 'relative' */
  relativeLabel?: string;
  /** Shown when kind === 'absolute' */
  absoluteDate?: string;
  absoluteTime?: string;
}

/**
 * Heartbeat time display: relative within 24h, then absolute local datetime.
 * @param unixSeconds server beat_time (Unix seconds)
 */
export function formatBeatTimeDisplay(unixSeconds: number, nowMs: number, t: TFunction): BeatTimeDisplay {
  const diffSec = Math.max(0, Math.floor(nowMs / 1000) - unixSeconds);

  if (diffSec < 60) {
    return { kind: 'relative', relativeLabel: t('beat_time_just_now') };
  }
  if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    return { kind: 'relative', relativeLabel: t('beat_time_mins_ago', { count: mins }) };
  }
  if (diffSec < 86400) {
    const hours = Math.floor(diffSec / 3600);
    return { kind: 'relative', relativeLabel: t('beat_time_hours_ago', { count: hours }) };
  }

  const m = moment.unix(unixSeconds);
  return {
    kind: 'absolute',
    absoluteDate: m.format('YYYY-MM-DD'),
    absoluteTime: m.format('HH:mm:ss'),
  };
}
