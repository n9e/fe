import appendFieldFilter from './appendFieldFilter';

describe('appendFieldFilter', () => {
  it('updates synced Builder filters and keeps the Builder synchronized', () => {
    const next = appendFieldFilter(
      {
        query: 'level:error',
        querySource: 'builder',
        builderStatus: 'synced',
        builder: {
          raw: {
            filters: [{ id: 'level', field: 'level', op: 'eq', value: 'error' }],
          },
        },
      },
      { key: 'host', value: 'api-01', operator: 'AND' },
    );

    expect(next).toMatchObject({
      query: 'level:error host:api-01',
      querySource: 'builder',
      builderStatus: 'synced',
      builder: {
        raw: {
          filters: [
            { field: 'level', op: 'eq', value: 'error' },
            { field: 'host', op: 'eq', value: 'api-01' },
          ],
        },
      },
    });
  });

  it('appends a Builder-style condition to a hand-written query without pipes', () => {
    const next = appendFieldFilter({ query: 'domain:shop.example.com' }, { key: 'method', value: 'GET', operator: 'AND' });

    expect(next).toMatchObject({
      query: 'domain:shop.example.com method:GET',
      querySource: 'code',
      builderStatus: 'stale',
    });
  });

  it('appends a filter pipe after a hand-written processing pipeline', () => {
    const next = appendFieldFilter({ query: '* | json' }, { key: 'message', value: 'request failed', operator: 'NOT' });

    expect(next).toMatchObject({
      query: '* | json | filter message:!"request failed"',
      querySource: 'code',
      builderStatus: 'stale',
    });
  });

  it('does not create an equality filter for null', () => {
    expect(appendFieldFilter({ query: '*' }, { key: 'message', value: null, operator: 'AND' })).toBeUndefined();
  });
});
