import _ from 'lodash';

import { LokiLogRow } from '../../../types';
import { escapeString } from '../../../utils/logsQL';

const TWO_HOURS_NS = BigInt(2 * 60 * 60) * BigInt(1_000_000_000);

export function buildLokiSelector(labels?: Record<string, string>) {
  const validLabels = _.pickBy(labels || {}, (value, key) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(key) && value !== undefined && value !== null);
  const keys = _.sortBy(_.keys(validLabels));
  if (_.isEmpty(keys)) return '';
  return `{${_.join(
    _.map(keys, (key) => `${key}="${escapeString(validLabels[key])}"`),
    ',',
  )}}`;
}

export function getReliableLokiLabels(log?: Partial<LokiLogRow>) {
  if (!log) return {};
  if (!_.isEmpty(log.labels)) return log.labels || {};
  return {};
}

export function getContextTimeRanges(timestampNs?: string) {
  if (!timestampNs || !/^\d+$/.test(timestampNs)) return null;
  const currentNs = BigInt(timestampNs);
  return {
    backward: {
      start: (currentNs > TWO_HOURS_NS ? currentNs - TWO_HOURS_NS : BigInt(0)).toString(),
      end: (currentNs > BigInt(0) ? currentNs - BigInt(1) : BigInt(0)).toString(),
    },
    forward: {
      start: (currentNs + BigInt(1)).toString(),
      end: (currentNs + TWO_HOURS_NS).toString(),
    },
  };
}

export function getLogIdentity(log?: Partial<LokiLogRow>) {
  const labels = getReliableLokiLabels(log);
  const labelText = JSON.stringify(_.fromPairs(_.map(_.sortBy(_.keys(labels)), (key) => [key, labels[key]])));
  return `${labelText}|${log?.__timestamp__ || ''}|${log?.line || ''}`;
}

function compareTimestampNs(a?: string, b?: string) {
  const ta = a && /^\d+$/.test(a) ? a : '0';
  const tb = b && /^\d+$/.test(b) ? b : '0';
  if (ta.length !== tb.length) return ta.length - tb.length;
  if (ta < tb) return -1;
  if (ta > tb) return 1;
  return 0;
}

export function mergeContextLogs(currentLog: LokiLogRow, backwardLogs: LokiLogRow[], forwardLogs: LokiLogRow[]): LokiLogRow[] {
  const logs = [...backwardLogs, currentLog, ...forwardLogs].sort((a, b) => {
    return compareTimestampNs(a.__timestamp__, b.__timestamp__);
  });
  return _.uniqBy(logs, (item) => getLogIdentity(item));
}
