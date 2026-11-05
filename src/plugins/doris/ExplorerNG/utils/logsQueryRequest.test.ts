import buildDorisLogsQueryRequest from './logsQueryRequest';

const baseParams = {
  cate: 'doris',
  datasourceId: 1,
  database: 'db',
  table: 'logs',
  timeField: 'ts',
  query: 'error',
  queryBuilderFilter: [{ field: 'level', operator: 'AND', value: 'ERROR' }],
  range: { from: 1700000000000, to: 1700003600000 },
  lines: 100,
  offset: 100,
  reverse: false,
  defaultField: 'message',
};

describe('buildDorisLogsQueryRequest', () => {
  it('keeps offset-based paging when there is no order anchor', () => {
    const payload = buildDorisLogsQueryRequest(baseParams);

    expect(payload.query[0]).toMatchObject({
      database: 'db',
      table: 'logs',
      time_field: 'ts',
      query: 'error',
      from: 1700000000000,
      to: 1700003600000,
      lines: 100,
      offset: 100,
      reverse: false,
      default_field: 'message',
      highlight: true,
    });
    expect(payload.query[0].search_after).toBeUndefined();
  });

  it('maps the order anchor to the backend search_after payload', () => {
    const payload = buildDorisLogsQueryRequest({ ...baseParams, searchAfter: { time: 1700000000123, streamId: 's1', seq: '100' } });

    expect(payload.query[0].search_after).toEqual({ time: '1700000000123', stream_id: 's1', seq: '100' });
  });

  // 后端游标生效时忽略 offset；表排序键不支持游标时仍需要 offset 回退。
  it('keeps offset as a fallback when the table cannot use search_after', () => {
    const payload = buildDorisLogsQueryRequest({ ...baseParams, searchAfter: { time: '2026-10-29 10:00:00.123', streamId: 's1', seq: '100' } });

    expect(payload.query[0].offset).toBe(baseParams.offset);
  });
});
