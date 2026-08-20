import normalizeData from './normalizeData';
import type { DashboardSeries } from '../../../datasource/types';
import type { ITransformation } from '@/pages/dashboard/types';

const rawLogSeries = (): DashboardSeries[] => [
  { id: 'B-log-1', refId: 'B', metric: { host: 'web-01', message: 'request completed', level: 'info' }, data: [], mode: 'raw' },
  { id: 'B-log-2', refId: 'B', metric: { host: 'web-02', message: 'request failed', status: '500', level: 'error' }, data: [], mode: 'raw' },
];

const timeSeries = (): DashboardSeries[] => [
  { id: 'A-1', refId: 'A', metric: { instance: 'localhost:9090', job: 'node' }, data: [[1710000000, 1]], mode: 'timeSeries' },
  { id: 'A-2', refId: 'A', metric: { instance: 'localhost:9091', job: 'node' }, data: [[1710000000, 0]], mode: 'timeSeries' },
];

describe('TableNG normalizeData', () => {
  it('在混合时序和日志结果中为日志 RefID 生成表格行', () => {
    const data = normalizeData([
      {
        id: 'A-series',
        refId: 'A',
        metric: { instance: 'localhost:9090' },
        data: [[1710000000, 1]],
        mode: 'timeSeries',
      },
      {
        id: 'B-log-1',
        refId: 'B',
        metric: { host: 'web-01', message: 'request completed' },
        data: [],
        mode: 'raw',
      },
      {
        id: 'B-log-2',
        refId: 'B',
        metric: { host: 'web-02', message: 'request failed', status: '500' },
        data: [],
        mode: 'raw',
      },
    ]);

    expect(data).toHaveLength(2);
    expect(data[0]).toMatchObject({
      id: '#A',
      refId: 'A',
      columns: ['__time', 'instance', '__value_#A'],
    });
    expect(data[0].rows).toEqual([
      {
        __time: 1710000000,
        instance: 'localhost:9090',
        '__value_#A': 1,
      },
    ]);
    expect(data[1]).toMatchObject({
      id: '#B',
      refId: 'B',
      columns: ['host', 'message', 'status'],
    });
    expect(data[1].rows).toEqual([
      {
        host: 'web-01',
        message: 'request completed',
        status: null,
      },
      {
        host: 'web-02',
        message: 'request failed',
        status: '500',
      },
    ]);
  });

  describe('Organize fields by name 转换', () => {
    it('对日志原始数据：重排 + 重命名 + 隐藏字段', () => {
      const transformations: ITransformation[] = [
        {
          id: 'organize',
          options: {
            fields: ['host', 'message', 'status', 'level'],
            indexByName: { status: 0, host: 1, message: 2, level: 3 },
            excludeByName: { level: true },
            renameByName: { host: 'hostname' },
          },
        },
      ];

      const data = normalizeData(rawLogSeries(), transformations);

      expect(data).toHaveLength(1);
      // 隐藏的 level 不应出现在列中
      expect(data[0].columns).toEqual(['status', 'hostname', 'message']);
      // 行数据与列保持一致，且字段被重命名
      expect(data[0].rows).toEqual([
        { status: null, hostname: 'web-01', message: 'request completed' },
        { status: '500', hostname: 'web-02', message: 'request failed' },
      ]);
    });

    it('对时序数据：按 indexByName 重排列', () => {
      const transformations: ITransformation[] = [
        {
          id: 'organize',
          options: {
            fields: ['__time', 'instance', 'job', '__value_#A'],
            indexByName: { '__value_#A': 0, instance: 1, job: 2, __time: 3 },
          },
        },
      ];

      const data = normalizeData(timeSeries(), transformations);

      expect(data).toHaveLength(1);
      expect(data[0].columns).toEqual(['__value_#A', 'instance', 'job', '__time']);
      expect(data[0].rows).toEqual([
        { '__value_#A': 1, instance: 'localhost:9090', job: 'node', __time: 1710000000 },
        { '__value_#A': 0, instance: 'localhost:9091', job: 'node', __time: 1710000000 },
      ]);
    });

    it('转换后保留帧 id，多帧场景下帧切换不丢失', () => {
      const series: DashboardSeries[] = [
        { id: 'A-1', refId: 'A', metric: { instance: 'a' }, data: [[1710000000, 1]], mode: 'timeSeries' },
        { id: 'B-1', refId: 'B', metric: { instance: 'b' }, data: [[1710000000, 2]], mode: 'timeSeries' },
      ];
      const transformations: ITransformation[] = [
        {
          id: 'organize',
          options: {
            fields: ['__time', 'instance', '__value_#A', '__value_#B'],
          },
        },
      ];

      const data = normalizeData(series, transformations);

      expect(data).toHaveLength(2);
      expect(data.map((item) => item.id)).toEqual(['#A', '#B']);
    });

    it('重命名后 columns 与 rows 的键保持一致（displayName 优先）', () => {
      const transformations: ITransformation[] = [
        {
          id: 'organize',
          options: {
            fields: ['host', 'message'],
            renameByName: { host: 'hostname', message: 'msg' },
          },
        },
      ];

      const data = normalizeData(rawLogSeries(), transformations);

      expect(data[0].columns).toEqual(['hostname', 'msg']);
      // 每一行的键必须与 columns 完全一致，供 ag-grid 按列取值
      for (const row of data[0].rows) {
        expect(Object.keys(row).sort()).toEqual(['hostname', 'msg']);
      }
    });

    it('fields 中未列出的字段会被丢弃（白名单语义）', () => {
      const transformations: ITransformation[] = [
        {
          id: 'organize',
          options: {
            fields: ['host', 'message'],
          },
        },
      ];

      const data = normalizeData(rawLogSeries(), transformations);

      expect(data[0].columns).toEqual(['host', 'message']);
      expect(data[0].rows).toEqual([
        { host: 'web-01', message: 'request completed' },
        { host: 'web-02', message: 'request failed' },
      ]);
    });

    it('fields 与当前数据字段不一致时只保留可匹配的字段，不抛错', () => {
      const transformations: ITransformation[] = [
        {
          id: 'organize',
          options: {
            fields: ['host', 'not_exists'],
          },
        },
      ];

      const data = normalizeData(rawLogSeries(), transformations);

      expect(data[0].columns).toEqual(['host']);
      expect(data[0].rows).toHaveLength(2);
    });
  });
});
