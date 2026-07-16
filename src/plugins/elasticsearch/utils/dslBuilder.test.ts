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
