import { upgradeTableToNG } from './upgradeTableToNG';

describe('upgradeTableToNG', () => {
  it('converts legacy table options and links while preserving common panel fields', () => {
    const panel = {
      id: 'panel-1',
      type: 'table',
      name: 'Legacy',
      targets: [{ refId: 'A' }],
      layout: { i: 'panel-1' },
      options: { standardOptions: { unit: 'ms' } },
      custom: {
        displayMode: 'labelsOfSeriesToRows',
        calc: 'max',
        columns: ['host'],
        showHeader: false,
        colorMode: 'background',
        nowrap: false,
        sortColumn: 'value',
        sortOrder: 'ascend',
        linkMode: 'appendLinkColumn',
        links: [
          {
            title: 'detail',
            url: 'http://example.com?var=${var}&host=${__field.labels.host}&name=${__field.name}&value=${__field.value}&interval=${__interval}',
            targetBlank: true,
          },
        ],
      },
    };

    const result = upgradeTableToNG(panel, ['__time', 'cpu', 'host', '__value_#A']);

    expect(result).toMatchObject({
      id: 'panel-1',
      type: 'tableNG',
      targets: [{ refId: 'A' }],
      custom: {
        showHeader: false,
        sortColumn: 'value',
        sortOrder: 'ascend',
        cellOptions: { type: 'none' },
      },
      transformationsNG: [
        {
          id: 'organize',
          options: {
            fields: ['__time', 'cpu', 'host', '__value_#A'],
            excludeByName: { __time: true, cpu: true },
            renameByName: { '__value_#A': 'value' },
          },
        },
      ],
      options: {
        links: [
          {
            url: 'http://example.com?var=${var}&host=${__row.host}&name=${__row.__name__}&value=${__row.value}&interval=${__interval}',
          },
        ],
      },
    });
    expect(result.targets).toEqual([{ refId: 'A', instant: true }]);
    expect(result.custom.links).toBeUndefined();
    expect(result.custom.linkMode).toBeUndefined();
  });

  it('maps series and grouped-dimension modes to existing transformations', () => {
    expect(
      upgradeTableToNG({ type: 'table', custom: { displayMode: 'seriesToRows' }, targets: [{ refId: 'A' }] }, ['__time', '__name__', 'ident', '__value_#A']).transformationsNG,
    ).toEqual([
      {
        id: 'organize',
        options: {
          fields: ['__time', '__name__', 'ident', '__value_#A'],
          excludeByName: { __time: true, ident: true },
          renameByName: { __name__: 'name', '__value_#A': 'value' },
        },
      },
    ]);
    expect(
      upgradeTableToNG({
        type: 'table',
        custom: { displayMode: 'labelValuesToRows', calc: 'lastNotNull', aggrDimension: ['ident', 'env'] },
        targets: [
          { refId: 'A', legend: 'cpu_usage_idle' },
          { refId: 'B', legend: 'disk_used' },
        ],
      }).transformationsNG,
    ).toEqual([
      { id: 'merge', options: {} },
      {
        id: 'groupedAggregateTable',
        options: {
          fields: {
            env: { operation: 'groupby', aggregations: [] },
            ident: { operation: 'groupby', aggregations: [] },
            '__value_#A': { operation: 'aggregate', aggregations: ['last'] },
            '__value_#B': { operation: 'aggregate', aggregations: ['last'] },
          },
        },
      },
      {
        id: 'organize',
        options: {
          fields: ['ident', 'env', '__value_#A (last)', '__value_#B (last)'],
          indexByName: { ident: 0, env: 1, '__value_#A (last)': 2, '__value_#B (last)': 3 },
          renameByName: { '__value_#A (last)': 'cpu_usage_idle', '__value_#B (last)': 'disk_used' },
        },
      },
    ]);
  });

  it('maps refId overrides to the corresponding organized column names', () => {
    const result = upgradeTableToNG({
      type: 'table',
      custom: { displayMode: 'labelValuesToRows', aggrDimension: ['ident'] },
      targets: [
        { refId: 'A', legend: 'cpu_usage_idle' },
        { refId: 'B', legend: 'disk_used' },
      ],
      overrides: [
        { matcher: { id: 'byFrameRefID', value: 'A' }, properties: { standardOptions: { unit: 'percent', decimals: 2 } } },
        { matcher: { id: 'byFrameRefID', value: 'B' }, properties: { standardOptions: { unit: 'bytesSI', decimals: 2 } } },
      ],
    });

    expect(result.overrides).toEqual([
      expect.objectContaining({
        matcher: { id: 'byName', value: 'cpu_usage_idle' },
        properties: expect.objectContaining({ standardOptions: { unit: 'percent', decimals: 2 } }),
      }),
      expect.objectContaining({
        matcher: { id: 'byName', value: 'disk_used' },
        properties: expect.objectContaining({ standardOptions: { unit: 'bytesSI', decimals: 2 } }),
      }),
    ]);
  });

  it('does not throw for malformed historical panel fields', () => {
    const malformedPanel = {
      type: 'table',
      custom: { columns: { invalid: true }, links: { invalid: true }, aggrDimension: { invalid: true } },
      options: { links: { invalid: true } },
      targets: { invalid: true },
      overrides: { invalid: true },
    };

    expect(() => upgradeTableToNG(malformedPanel, ['__time', 1] as any)).not.toThrow();
    expect(upgradeTableToNG(malformedPanel)).toMatchObject({
      type: 'tableNG',
      targets: [],
      overrides: [],
      options: {},
    });
    expect(upgradeTableToNG(null)).toBeNull();
  });

  it('only records hidden organize fields and does not add empty links', () => {
    const result = upgradeTableToNG(
      {
        type: 'table',
        custom: { displayMode: 'labelsOfSeriesToRows', columns: ['ident', 'value'], sortColumn: 'value' },
        options: { standardOptions: {} },
        targets: [{ refId: 'A' }],
      },
      ['__time', '**name**', 'cpu', 'ident', '__value_#A'],
    );

    expect(result.transformationsNG[0].options).toEqual({
      fields: ['__time', '**name**', 'cpu', 'ident', '__value_#A'],
      excludeByName: { __time: true, '**name**': true, cpu: true },
      renameByName: { '__value_#A': 'value' },
    });
    expect(result.custom.sortColumn).toBe('value');
    expect(result.options).toEqual({ standardOptions: {} });
  });

  it('maps label-mode refId overrides to value and keeps target legend', () => {
    const result = upgradeTableToNG({
      type: 'table',
      custom: { displayMode: 'labelsOfSeriesToRows', columns: ['ident', 'value'] },
      targets: [{ refId: 'A', legend: 'custom legend' }],
      overrides: [{ matcher: { id: 'byFrameRefID', value: 'A' }, properties: { standardOptions: { unit: 'percent' } } }],
    });

    expect(result.targets).toEqual([{ refId: 'A', legend: 'custom legend', instant: true }]);
    expect(result.overrides[0]).toMatchObject({
      matcher: { id: 'byName', value: 'value' },
      properties: { standardOptions: { unit: 'percent' } },
    });
  });

  it('maps field value links to the final transformed column name', () => {
    const result = upgradeTableToNG({
      type: 'table',
      custom: {
        displayMode: 'labelValuesToRows',
        calc: 'lastNotNull',
        aggrDimension: ['ident'],
        links: [{ title: 'detail', url: 'http://example.com?value=${__field.value}' }],
      },
      targets: [{ refId: 'A', legend: 'cpu_usage_idle' }],
    });

    expect(result.options.links).toEqual([
      {
        title: 'detail',
        url: 'http://example.com?value=${__row.cpu_usage_idle}',
      },
    ]);
  });

  it('uses distinct value names for multiple series and preserves option links before legacy links', () => {
    const result = upgradeTableToNG({
      type: 'table',
      custom: { displayMode: 'seriesToRows', links: [{ title: 'legacy', url: 'https://legacy/${__field.value}' }] },
      options: { links: [{ title: 'existing', url: 'https://existing/${__field.value}' }] },
      targets: [{ refId: 'A' }, { refId: 'B' }],
    });

    expect(result.transformationsNG[0]).toMatchObject({ options: { renameByName: { '__value_#A': 'value_A', '__value_#B': 'value_B' } } });
    expect(result.options.links).toEqual([
      { title: 'existing', url: 'https://existing/${__row.value_A}' },
      { title: 'legacy', url: 'https://legacy/${__row.value_A}' },
    ]);
  });

  it('degrades an unmatched RefID override to a matcher without a value', () => {
    const result = upgradeTableToNG({
      type: 'table', targets: [{ refId: 'A' }],
      overrides: [{ matcher: { id: 'byFrameRefID', value: 'missing' }, properties: {} }],
    });

    expect(result.overrides[0]).toMatchObject({ matcher: { id: 'byName' } });
    expect(result.overrides[0].matcher).not.toHaveProperty('value');
  });

  it('derives sensible fields without availableFields for every display mode', () => {
    expect(upgradeTableToNG({ type: 'table', custom: { displayMode: 'seriesToRows' }, targets: [{ refId: 'A' }] }).transformationsNG[0]).toMatchObject({
      options: { fields: ['__name__', '__value_#A'] },
    });
    expect(upgradeTableToNG({ type: 'table', custom: { displayMode: 'labelsOfSeriesToRows', columns: ['host', 'value'] }, targets: [{ refId: 'A' }] }).transformationsNG[0]).toMatchObject({
      options: { fields: ['host', '__value_#A'] },
    });
    expect(upgradeTableToNG({ type: 'table', custom: { displayMode: 'labelValuesToRows', aggrDimension: ['host'] }, targets: [{ refId: 'A' }] }).transformationsNG[2]).toMatchObject({
      options: { fields: ['host', '__value_#A (last)'] },
    });
  });
});
