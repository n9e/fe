jest.mock(
  '@/utils/constant',
  () => ({
    __esModule: true,
    DatasourceCateEnum: {
      prometheus: 'prometheus',
      elasticsearch: 'elasticsearch',
      ck: 'ck',
    },
  }),
  { virtual: true },
);

jest.mock('@/plugins/prometheus/Dashboard/variableDatasource', () => ({
  __esModule: true,
  default: jest.fn(async () => ['p']),
}));

jest.mock('@/plugins/elasticsearch/Dashboard/variableDatasource', () => ({
  __esModule: true,
  default: jest.fn(async () => ['es']),
}));

jest.mock('@/plugins/clickHouse/Dashboard/VariableDatasource', () => ({
  __esModule: true,
  default: jest.fn(async () => ['ck']),
}));

jest.mock(
  'plus:/parcels/Dashboard/variableDatasource',
  () => ({
    __esModule: true,
    default: jest.fn(async () => ['plus']),
  }),
  { virtual: true },
);

import prometheus from '@/plugins/prometheus/Dashboard/variableDatasource';
import elasticsearch from '@/plugins/elasticsearch/Dashboard/variableDatasource';
import clickHouse from '@/plugins/clickHouse/Dashboard/VariableDatasource';
import variableDatasourcePro from 'plus:/parcels/Dashboard/variableDatasource';
import datasource from '../datasource';

describe('Variables/datasource dispatcher', () => {
  test('routes prometheus datasourceCate to prometheus variableDatasource', async () => {
    const res = await datasource({ datasourceCate: 'prometheus', datasourceValue: 1, datasourceList: [], query: { query: 'x' } });
    expect(res).toEqual(['p']);
    expect(prometheus).toHaveBeenCalled();
  });

  test('routes elasticsearch datasourceCate to elasticsearch variableDatasource', async () => {
    const res = await datasource({ datasourceCate: 'elasticsearch', datasourceValue: 1, datasourceList: [], query: { query: 'x' } });
    expect(res).toEqual(['es']);
    expect(elasticsearch).toHaveBeenCalled();
  });

  test('routes ck datasourceCate to clickHouse variableDatasource', async () => {
    const res = await datasource({ datasourceCate: 'ck', datasourceValue: 1, datasourceList: [], query: { query: 'x' } });
    expect(res).toEqual(['ck']);
    expect(clickHouse).toHaveBeenCalled();
  });

  test('routes other datasourceCate to plus variableDatasource', async () => {
    const res = await datasource({ datasourceCate: 'unknown', datasourceValue: 1, datasourceList: [], query: { query: 'x' } });
    expect(res).toEqual(['plus']);
    expect(variableDatasourcePro).toHaveBeenCalled();
  });
});
