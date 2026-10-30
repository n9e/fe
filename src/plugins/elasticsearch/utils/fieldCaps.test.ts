import { esSupportsLogOrder } from '@/pages/logExplorer/components/LogOrderContext/utils';

import buildFieldCapsFields from './fieldCaps';

describe('buildFieldCapsFields（跨集群 _field_caps 归一化）', () => {
  it('marks fields indexable and keeps their single type', () => {
    const fields = buildFieldCapsFields({
      '@timestamp': { date: {} },
      __log_stream_id__: { keyword: {} },
      __log_seq__: { long: {} },
    });

    expect(fields).toEqual([
      { field: '@timestamp', type: 'date', indexable: true },
      { field: '__log_stream_id__', type: 'keyword', indexable: true },
      { field: '__log_seq__', type: 'long', indexable: true },
    ]);
  });

  // 待确认问题：_field_caps 里 __log_seq__ 同时有 long/text 时只取 keys[0]（此处是 long），
  // esSupportsLogOrder 会因此误判为可排序；排序打到 text 索引的 ES 会返回 400
  it('mixed types in field caps should not enable order sorting', () => {
    const fields = buildFieldCapsFields({
      __log_stream_id__: { keyword: {} },
      __log_seq__: { long: {}, text: {} },
    });

    expect(esSupportsLogOrder(fields)).toBe(false);
  });
});
