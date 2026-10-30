/// <reference types="jest" />

jest.mock('@fc-components/es-query', () => ({
  buildESQueryFromKuery: jest.fn(() => ({ filter: [] })),
}));

import dslBuilder from './dslBuilder';

function getBody(requestBody: string) {
  return JSON.parse(requestBody.trim().split('\n')[1]);
}

describe('elasticsearch dslBuilder filters', () => {
  it('builds match_phrase filters for AND filters', () => {
    const body = getBody(
      dslBuilder({
        index: 'logs-*',
        start: 1,
        end: 2,
        filters: [{ key: 'status', operator: 'AND', value: '500' }],
      }),
    );

    expect(body.query.bool.filter).toContainEqual({
      match_phrase: {
        status: '500',
      },
    });
  });

  it('builds must_not match_phrase filters for NOT filters', () => {
    const body = getBody(
      dslBuilder({
        index: 'logs-*',
        start: 1,
        end: 2,
        filters: [{ key: 'status', operator: 'NOT', value: '200' }],
      }),
    );

    expect(body.query.bool.must_not).toContainEqual({
      match_phrase: {
        status: '200',
      },
    });
  });

  it('builds exists filters for EXISTS filters', () => {
    const body = getBody(
      dslBuilder({
        index: 'logs-*',
        start: 1,
        end: 2,
        filters: [{ key: 'trace_id', operator: 'EXISTS', value: '' }],
      }),
    );

    expect(body.query.bool.filter).toContainEqual({
      exists: {
        field: 'trace_id',
      },
    });
  });

  it('skips disabled filters', () => {
    const body = getBody(
      dslBuilder({
        index: 'logs-*',
        start: 1,
        end: 2,
        filters: [{ key: 'status', operator: 'AND', value: '500', disabled: true }],
      }),
    );

    expect(body.query.bool.filter).not.toContainEqual({
      match_phrase: {
        status: '500',
      },
    });
  });
});

describe('elasticsearch dslBuilder sorter（原文顺序排序）', () => {
  it('keeps every sorter field in order and pins unmapped_type', () => {
    const body = getBody(
      dslBuilder({
        index: 'logs-*',
        start: 1,
        end: 2,
        sorter: [
          { field: '@timestamp', order: 'desc' },
          { field: '__log_stream_id__', order: 'desc' },
          { field: '__log_seq__', order: 'desc' },
        ],
      }),
    );

    expect(body.sort).toEqual([
      { '@timestamp': { order: 'desc', unmapped_type: 'boolean' } },
      { __log_stream_id__: { order: 'desc', unmapped_type: 'boolean' } },
      { __log_seq__: { order: 'desc', unmapped_type: 'boolean' } },
    ]);
  });

  it('does not add a sort when neither sorter nor order is provided', () => {
    const body = getBody(
      dslBuilder({
        index: 'logs-*',
        start: 1,
        end: 2,
      }),
    );

    expect(body.sort).toBeUndefined();
  });
});
