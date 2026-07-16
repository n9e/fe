import { highlightTags } from '@/pages/logExplorer/utils/highlight/highlight_tags';

import { buildLogHighlights, extractLineHighlightFiltersFromQuery, getLineHighlightFilters, getLineHighlights } from './highlights';

describe('Loki raw line highlights', () => {
  it('extracts only positive line filters from LogQL', () => {
    expect(extractLineHighlightFiltersFromQuery('{job="api"} |= "error" != "debug" |~ `timeout|failed` !~ "trace"')).toEqual([
      { op: '|=', value: 'error' },
      { op: '|~', value: 'timeout|failed' },
    ]);
  });

  it('uses synced builder line filters before parsing query text', () => {
    expect(
      getLineHighlightFilters({
        query: '{job="api"} |= "from-code"',
        querySource: 'builder',
        builderStatus: 'synced',
        builder: {
          raw: {
            labels: [],
            lineFilters: [
              { id: '1', op: '|=', value: 'from-builder' },
              { id: '2', op: '!=', value: 'excluded' },
            ],
          },
        },
      }),
    ).toEqual([{ op: '|=', value: 'from-builder' }]);
  });

  it('builds tagged line highlights per row', () => {
    expect(
      getLineHighlights('error: request failed', [
        { op: '|=', value: 'error' },
        { op: '|~', value: 'request\\s+failed' },
      ]),
    ).toEqual([`${highlightTags.pre}error${highlightTags.post}`, `${highlightTags.pre}request failed${highlightTags.post}`]);
    expect(buildLogHighlights([{ line: 'ok' }, { line: 'error' }], [{ op: '|=', value: 'error' }])).toEqual([{}, { line: [`${highlightTags.pre}error${highlightTags.post}`] }]);
  });
});
