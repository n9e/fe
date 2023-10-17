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
import { getSerieName } from './utils';
import { getDsQuery } from '../services';
import { cacheDefaultValues } from './index';

interface Props {
  form: FormInstance;
  datasourceValue: number;
  refreshFlag?: string;
  setRefreshFlag: (flag?: string) => void;
}

export default function Graph(props: Props) {
  const { form, datasourceValue, refreshFlag, setRefreshFlag } = props;
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
        util: highLevelConfig.unit,
      },
    },
  };

  useEffect(() => {
    if (datasourceValue && query && refreshFlag) {
      const parsedRange = parseRange(range);
      const start = moment(parsedRange.start).toISOString();
      const end = moment(parsedRange.end).toISOString();
      cacheDefaultValues(datasourceValue, query);
      getDsQuery({
        cate: DatasourceCateEnum.tdengine,
        datasource_id: datasourceValue,
        query: [
          {
            query,
            from: start,
            to: end,
            keys: {
              metricKey: _.join(keys.metricKey, ' '),
              labelKey: _.join(keys.labelKey, ' '),
              timeFormat: keys.timeFormat,
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
  }, [JSON.stringify(range), JSON.stringify(keys), query, refreshFlag]);

  return (
    <div style={{ minHeight: 0 }}>
      <Space>
        <div style={{ width: 600 }}>
          <AdvancedSettings mode='graph' span={12} prefixName={['query']} expanded expandTriggerVisible={false} />
        </div>
        <Form.Item>
          <Popover
            placement='left'
            content={<LineGraphStandardOptions highLevelConfig={highLevelConfig} setHighLevelConfig={setHighLevelConfig} />}
            trigger='click'
            autoAdjustOverflow={false}
            getPopupContainer={() => document.body}
          >
            <Button icon={<SettingOutlined />} />
          </Popover>
        </Form.Item>
      </Space>
      {errorContent && <Alert style={{ marginBottom: 16 }} message={errorContent} type='error' />}
      <Timeseries inDashboard={false} values={lineGraphProps as any} series={data} />
    </div>
  );
}
