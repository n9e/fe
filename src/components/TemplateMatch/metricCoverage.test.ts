import { computeCoverage, extractAlertRuleMetrics, extractDashboardMetrics, extractPromQLMetrics, hasAnyCoverage, isFullyCovered } from './metricCoverage';

describe('extractPromQLMetrics', () => {
  it('collects metric identifiers and ignores template variables', () => {
    const query = 'sum(rate(snmp_interface_incoming{device="$device"}[${interval}])) + snmp_up';

    expect(extractPromQLMetrics(query)).toEqual(['snmp_interface_incoming', 'snmp_up']);
  });

  it('supports an exact __name__ matcher', () => {
    expect(extractPromQLMetrics('{__name__="snmp_uptime", job="snmp"}')).toEqual(['snmp_uptime']);
  });

  it('does not treat a metric template variable as a provided metric', () => {
    expect(extractPromQLMetrics('${metric}')).toEqual([]);
  });
});

describe('extractDashboardMetrics', () => {
  it('collects target expressions in normal and collapsed row panels', () => {
    const dashboard = {
      configs: {
        panels: [
          { targets: [{ expr: 'snmp_uptime' }] },
          {
            type: 'row',
            collapsed: true,
            panels: [{ targets: [{ expr: 'sum(snmp_interface_incoming)' }] }],
          },
        ],
      },
    } as const;

    expect(extractDashboardMetrics(dashboard)).toEqual(['snmp_uptime', 'snmp_interface_incoming']);
  });
});

describe('extractAlertRuleMetrics', () => {
  it('collects metrics from alert rule queries', () => {
    const rule = {
      rule_config: {
        queries: [{ prom_ql: 'snmp_system_cpuuse' }, { prom_ql: 'snmp_up + snmp_system_cpuuse' }],
      },
    } as const;

    expect(extractAlertRuleMetrics(rule)).toEqual(['snmp_system_cpuuse', 'snmp_up']);
  });
});

describe('computeCoverage', () => {
  it('returns unique hits, missing metrics, and ratio', () => {
    expect(computeCoverage(['snmp_up', 'snmp_uptime'], ['snmp_up', 'snmp_uptime', 'snmp_if_in'])).toEqual({
      hit: 2,
      total: 3,
      covered: ['snmp_up', 'snmp_uptime'],
      missing: ['snmp_if_in'],
      ratio: 2 / 3,
    });
  });

  it('returns zero coverage for an empty query', () => {
    expect(computeCoverage(['snmp_up'], [])).toEqual({ hit: 0, total: 0, covered: [], missing: [], ratio: 0 });
  });
});

describe('isFullyCovered', () => {
  it('requires every referenced metric and a non-empty query', () => {
    expect(isFullyCovered(computeCoverage(['snmp_up', 'snmp_uptime'], ['snmp_up', 'snmp_uptime']))).toBe(true);
    expect(isFullyCovered(computeCoverage(['snmp_up'], ['snmp_up', 'snmp_uptime']))).toBe(false);
    expect(isFullyCovered(computeCoverage(['snmp_up'], []))).toBe(false);
  });
});

describe('hasAnyCoverage', () => {
  it('is false when no required metric is covered', () => {
    expect(hasAnyCoverage(computeCoverage(['snmp_up'], ['snmp_if_in']))).toBe(false);
    expect(hasAnyCoverage(computeCoverage(['snmp_up'], []))).toBe(false);
  });

  it('is true for partial or full coverage', () => {
    expect(hasAnyCoverage(computeCoverage(['snmp_up'], ['snmp_up', 'snmp_uptime']))).toBe(true);
    expect(hasAnyCoverage(computeCoverage(['snmp_up'], ['snmp_up']))).toBe(true);
  });
});
