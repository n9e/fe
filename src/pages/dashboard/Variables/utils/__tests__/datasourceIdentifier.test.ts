import { hasDatasourceIdentifier } from '../datasourceIdentifier';

describe('hasDatasourceIdentifier', () => {
  test.each([undefined, '', '   ', null])('rejects an absent or blank identifier: %p', (identifier) => {
    expect(hasDatasourceIdentifier({ identifier })).toBe(false);
  });

  test('keeps a non-empty identifier without changing its value', () => {
    const datasource = { identifier: 'prometheus-primary' };

    expect(hasDatasourceIdentifier(datasource)).toBe(true);
    if (hasDatasourceIdentifier(datasource)) expect(datasource.identifier).toBe('prometheus-primary');
  });
});
