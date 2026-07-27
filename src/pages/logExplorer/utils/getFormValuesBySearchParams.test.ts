const datasourceCateEnum = {
  doris: 'doris',
  ck: 'ck',
  aliyunSLS: 'aliyunSLS',
  elasticsearch: 'elasticsearch',
  loki: 'loki',
  victorialogs: 'victorialogs',
  huaweiLTS: 'huaweiLTS',
  tencentCLS: 'tencentCLS',
  cloudwatchLogs: 'cloudwatchLogs',
  bceBLS: 'bceBLS',
  volcTLS: 'volc-tls',
};

jest.mock('@/utils/constant', () => ({ DatasourceCateEnum: datasourceCateEnum }));
jest.mock('@/components/TimeRangePicker', () => ({
  isMathString: (value: unknown) => typeof value === 'string' && /^(now|now[+-])/.test(value),
}));

import getFormValuesBySearchParams, { getLocationSearchByFormValues } from './getFormValuesBySearchParams';

describe('火山云 TLS 分享链接参数', () => {
  const formValues = {
    datasourceCate: datasourceCateEnum.volcTLS,
    datasourceValue: 12,
    query: {
      range: { start: 'now-1h', end: 'now' },
      mode: 'metric',
      submode: 'timeSeries',
      project: 'project-a',
      topic: 'topic-a',
      query: 'status:500',
      organizeFields: ['host', 'message'],
      keys: { labelKey: ['host'], valueKey: ['count'], timeKey: 'time' },
    },
  };

  it('序列化当前查询条件', () => {
    expect(getLocationSearchByFormValues(formValues)).toContain('data_source_name=volc-tls');
    expect(getLocationSearchByFormValues(formValues)).toContain('project=project-a');
    expect(getLocationSearchByFormValues(formValues)).toContain('topic=topic-a');
  });

  it('可从分享链接参数还原查询条件', () => {
    expect(
      getFormValuesBySearchParams({
        data_source_name: 'volc-tls',
        data_source_id: '12',
        start: 'now-1h',
        end: 'now',
        mode: 'metric',
        submode: 'timeSeries',
        project: 'project-a',
        topic: 'topic-a',
        query: 'status:500',
        organize_fields: 'host',
        labelKey: 'host',
        valueKey: 'count',
        timeKey: 'time',
      }),
    ).toEqual({
      datasourceCate: 'volc-tls',
      datasourceValue: 12,
      query: {
        range: { start: 'now-1h', end: 'now' },
        mode: 'metric',
        submode: 'timeSeries',
        project: 'project-a',
        topic: 'topic-a',
        query: 'status:500',
        organizeFields: ['host'],
        keys: { labelKey: ['host'], valueKey: ['count'], timeKey: 'time' },
      },
    });
  });
});
