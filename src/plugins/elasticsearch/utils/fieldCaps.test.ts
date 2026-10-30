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
      { field: '__log_stream_id__', type: 'keyword', indexable: true, logOrderTypes: ['keyword'] },
      { field: '__log_seq__', type: 'long', indexable: true, logOrderTypes: ['long'] },
    ]);
  });

  it('mixed types in field caps should not enable order sorting', () => {
    const fields = buildFieldCapsFields({
      __log_stream_id__: { keyword: {} },
      __log_seq__: { long: {}, text: {} },
    });

    expect(esSupportsLogOrder(fields)).toBe(false);
  });
});

it.each([
  { long: {}, text: {} },
  { text: {}, long: {} },
])('field caps conflicts do not depend on type order: %p', (types) => {
  expect(esSupportsLogOrder(buildFieldCapsFields({ __log_stream_id__: { keyword: {} }, __log_seq__: types }))).toBe(false);
});

it('rejects mixed stream types and accepts consistent mappings', () => {
  expect(esSupportsLogOrder(buildFieldCapsFields({ __log_stream_id__: { keyword: {}, text: {} }, __log_seq__: { long: {} } }))).toBe(false);
  expect(esSupportsLogOrder(buildFieldCapsFields({ __log_stream_id__: { keyword: {} }, __log_seq__: { long: {} } }))).toBe(true);
});
