import React, { useState, useEffect } from 'react';
import { Space } from 'antd';
import moment from 'moment';
import { TimeRangePickerWithRefresh, IRawTimeRange } from '@/components/TimeRangePicker';
import Resolution from '@/components/Resolution';
import { getStepByTimeAndStep } from '@/pages/dashboard/utils';
import { EventPreview as AlgoGraph } from 'plus:/datasource/anomaly';
import { EventPreview as ElasticsearchGraph } from 'plus:/datasource/elasticsearch';
import { EventPreview as AliyunSLSGraph } from 'plus:/datasource/aliyunSLS';
import { EventPreview as InfluxDBPreview } from 'plus:/datasource/influxDB';

export default function index({ data, triggerTime, onClick }) {
  const [range, setRange] = useState<IRawTimeRange>();
  const [step, setStep] = useState<number | null>(15);

  useEffect(() => {
    setRange({
      start: moment.unix(triggerTime).subtract(30, 'minutes'),
      end: moment.unix(triggerTime).add(30, 'minutes'),
    });
  }, [triggerTime]);

  if (!range) return null;

  return (
    <div>
      <Space>
        <TimeRangePickerWithRefresh
          value={range}
          onChange={setRange}
          refreshTooltip={data.cate === 'prometheus' ? `刷新间隔小于 step(${getStepByTimeAndStep(range, step)}s) 将不会更新数据` : undefined}
        />
        {data.cate === 'prometheus' && <Resolution value={step} onChange={(v) => setStep(v)} />}
      </Space>
      {data.rule_prod === 'anomaly' && <AlgoGraph rid={data.rule_id} tags={data.tags} range={range} step={step} />}
      {data.cate === 'elasticsearch' && <ElasticsearchGraph eventId={data.id} range={range} triggerTime={triggerTime} onClick={onClick} />}
      {data.cate === 'aliyun-sls' && <AliyunSLSGraph eventId={data.id} range={range} triggerTime={triggerTime} onClick={onClick} />}
      {data.cate === 'influxdb' && <InfluxDBPreview eventId={data.id} range={range} triggerTime={triggerTime} onClick={onClick} />}
    </div>
  );
}
