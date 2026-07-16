import { classifyExplorerMode, formatLogsQL, getPipeName, renderMetricLogsQL, splitLogsQLPipes } from './logsQL';

describe('VictoriaLogs ExplorerNG logsQL utils', () => {
  test.each([
    ['', 'raw'],
    ['   ', 'raw'],
    ['|', 'raw'],
    ['* |', 'raw'],
    ['*', 'raw'],
    ['domain:api.example.com', 'raw'],
    ['level:error | filter status:500', 'raw'],
    ['nginx | extract "ip=(\\\\S+)" | filter ip:*', 'raw'],
    ['Builder render filters only', 'raw'],
    ['Builder render filters | stats count() as count', 'metric'],
    ['* | limit 10', 'metric'],
    ['* | sort by (_time desc)', 'metric'],
    ['* | fields _time, _msg, level', 'metric'],
    ['* | offset 100 | limit 50', 'metric'],
    ['level:error | rename level as lvl', 'metric'],
    ['domain:x | stats by (domain) count() as count', 'metric'],
    ['error | stats count() as total', 'metric'],
    ['* | stats by (level) count() | sort by (count desc)', 'metric'],
    ['* | json | unpack_json | filter level:error', 'raw'],
    ['* | json | limit 10', 'metric'],
    ['* | filter level:error | stats count()', 'metric'],
    ['* |  STATS  by (level) count()', 'metric'],
    ['* | sort by (count desc)', 'metric'],
  ])('classifies %s as %s', (query, mode) => {
    expect(classifyExplorerMode(query)).toBe(mode);
  });

  it('does not split pipes inside quotes or parentheses', () => {
    expect(splitLogsQLPipes('level:"a|b" | filter status:500')).toEqual(['level:"a|b"', 'filter status:500']);
    expect(splitLogsQLPipes('nginx | extract "x|y" | filter ip:*')).toEqual(['nginx', 'extract "x|y"', 'filter ip:*']);
    expect(splitLogsQLPipes('* | stats by (domain) count(if(level="a|b"))')).toEqual(['*', 'stats by (domain) count(if(level="a|b"))']);
  });

  it('normalizes pipe names', () => {
    expect(getPipeName('  stats  by (level) count()')).toBe('stats');
    expect(getPipeName('SORT BY (_time desc)')).toBe('sort by');
    expect(getPipeName('filter level:error')).toBe('filter');
  });

  it('formats LogsQL pipes without splitting quoted or nested pipes', () => {
    const query = formatLogsQL('level:"a|b" | filter status:500 | stats by (domain) count(if(level="x|y")) as count | limit 10');

    expect(query).toBe(['level:"a|b"', '| filter status:500', '| stats by (domain) count(if(level="x|y")) as count', '| limit 10'].join('\n'));
    expect(classifyExplorerMode(query)).toBe('metric');
  });

  it('renders multiline metric LogsQL from builder state', () => {
    const query = renderMetricLogsQL(
      {
        filters: [{ id: '1', field: 'level', op: 'eq', value: 'error' }],
        aggregations: [{ id: '2', func: 'count', alias: 'count' }],
        groupBy: ['domain'],
        orderBy: [{ id: '3', field: 'count', direction: 'desc' }],
        limit: 10,
        vizType: 'table',
      },
      { multiline: true },
    );

    expect(query).toBe(['level:error', '| stats by (domain) count() as count', '| sort by (count desc)', '| limit 10'].join('\n'));
    expect(classifyExplorerMode(query)).toBe('metric');
  });
});
