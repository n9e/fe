import _ from 'lodash';

import { mappingsToFullFields } from './mappingsToFields';

// mappingsToFullFields 的参数类型描述的是解析后的映射，实际入参是 ES 返回的 { index: { mappings } }
const asResponse = (value: unknown) => value as Parameters<typeof mappingsToFullFields>[0];

const mappingOf = (properties: Record<string, unknown>) => ({
  'logs-2026.10.28': { mappings: { properties } },
});

describe('mappingsToFullFields', () => {
  it('normalizes keyword to string and keeps other index types', () => {
    const fields = mappingsToFullFields(
      asResponse(
        mappingOf({
          '@timestamp': { type: 'date' },
          message: { type: 'keyword' },
        }),
      ),
    );

    expect(_.find(fields, { field: 'message' })?.type).toBe('string');
    expect(_.find(fields, { field: '@timestamp' })?.type).toBe('date');
  });

  it('keeps only the first type when indices map the same field differently', () => {
    const fields = mappingsToFullFields(
      asResponse({
        'logs-2026.10.28': { mappings: { properties: { __log_seq__: { type: 'long' } } } },
        'logs-2026.10.29': { mappings: { properties: { __log_seq__: { type: 'text' } } } },
      }),
    );

    expect(_.filter(fields, { field: '__log_seq__' })).toEqual([expect.objectContaining({ field: '__log_seq__', type: 'long' })]);
  });

  it('walks nested properties and returns dotted field names', () => {
    const fields = mappingsToFullFields(asResponse(mappingOf({ http: { properties: { method: { type: 'keyword' } } } })));

    expect(_.find(fields, { field: 'http.method' })?.type).toBe('string');
  });
});
