import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Form, Alert, Popover, Button, Space } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import { SettingOutlined } from '@ant-design/icons';
import { parseRange } from '@/components/TimeRangePicker';
import { DatasourceCateEnum } from '@/utils/constant';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import LineGraphStandardOptions from '@/components/PromGraphCpt/components/GraphStandardOptions';
import AdvancedSettings from '../components/AdvancedSettings';
import { getSerieName } from '../utils';
import { getDsQuery } from '../services';
import { cacheDefaultValues } from './index';

interface Props {
  form: FormInstance;
  datasourceCate?: string;
  datasourceValue: number;
  refreshFlag?: string;
  setRefreshFlag: (flag?: string) => void;
}

export default function Graph(props: Props) {
  const { form, datasourceCate = DatasourceCateEnum.iotdb, datasourceValue, refreshFlag, setRefreshFlag } = props;
  const [data, setData] = useState<any[]>([]);
  const [errorContent, setErrorContent] = useState('');
  const range = Form.useWatch(['query', 'range'], form);
  const keys = Form.useWatch(['query', 'keys'], form);
  const query = Form.useWatch(['query', 'query'], form);
  const [highLevelConfig, setHighLevelConfig] = useState({
    shared: true,
    sharedSortDirection: 'desc',
    legend: true,
    unit: 'none',
  });
  const lineGraphProps = {
    custom: {
      drawStyle: 'lines',
      fillOpacity: 0,
      stack: 'hidden',
      lineInterpolation: 'smooth',
    },
    options: {
      legend: {
        displayMode: highLevelConfig.legend ? 'table' : 'hidden',
      },
      tooltip: {
        mode: highLevelConfig.shared ? 'all' : 'single',
        sort: highLevelConfig.sharedSortDirection,
      },
      standardOptions: {
        unit: highLevelConfig.unit,
      },
    },
  };

  useEffect(() => {
    if (datasourceCate && datasourceValue && query && range && refreshFlag) {
      const parsedRange = parseRange(range);
      const start = moment(parsedRange.start).toISOString();
      const end = moment(parsedRange.end).toISOString();
      cacheDefaultValues(datasourceCate, datasourceValue, query);
      getDsQuery({
        cate: datasourceCate,
        datasource_id: datasourceValue,
        query: [
          {
            query,
            from: start,
            to: end,
            keys: {
              metricKey: _.join(keys?.metricKey, ' '),
              labelKey: _.join(keys?.labelKey, ' '),
              timeKey: keys?.timeKey,
              timeFormat: keys?.timeFormat,
            },
          },
        ],
      })
        .then((res) => {
          const series = _.map(res, (item) => {
            return {
              id: _.uniqueId('series_'),
              name: getSerieName(item.metric),
              metric: item.metric,
              data: item.values,
            };
          });
          setErrorContent('');
          setData(series);
        })
        .catch((err) => {
          const msg = _.get(err, 'message');
          setErrorContent(`Error executing query: ${msg}`);
          setData([]);
        })
        .finally(() => {
          setRefreshFlag();
        });
    }
  }, [datasourceCate, datasourceValue, JSON.stringify(range), JSON.stringify(keys), query, refreshFlag]);

  return (
    <div className='explorer-graph-container'>
      <Space>
        <div className='iotdb-explorer-graph-settings'>
          <AdvancedSettings datasourceCate={datasourceCate} mode='graph' span={12} prefixName={['query']} expanded expandTriggerVisible={false} />
        </div>
        <Popover
          placement='left'
          content={<LineGraphStandardOptions highLevelConfig={highLevelConfig} setHighLevelConfig={setHighLevelConfig} />}
          trigger='click'
          autoAdjustOverflow={false}
          getPopupContainer={() => document.body}
        >
          <Form.Item>
            <Button icon={<SettingOutlined />} />
          </Form.Item>
        </Popover>
      </Space>
      {errorContent && <Alert className='mb-4' message={errorContent} type='error' />}
      <Timeseries inDashboard={false} values={lineGraphProps as any} series={data} />
    </div>
  );
}
