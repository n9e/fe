import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Form, Alert, Popover, Button, Space, Spin } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import { SettingOutlined } from '@ant-design/icons';

import { parseRange } from '@/components/TimeRangePicker';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import LineGraphStandardOptions from '@/components/PromGraphCpt/components/GraphStandardOptions';
import { setLocalQueryHistory } from '@/components/HistoricalRecords';

import AdvancedSettings from '../components/AdvancedSettings';
import { getSerieName } from '../utils';
import { getDsQuery } from '../services';
import { NAME_SPACE, HISTORY_RECORDS_CACHE_KEY, QUERY_KEY } from '../constants';
import { useGlobalState } from '../globalState';

interface Props {
  form: FormInstance;
  datasourceValue: number;
  refreshFlag?: string;
  setRefreshFlag: (flag?: string) => void;
}

export default function Graph(props: Props) {
  const [tableFields, setTableFields] = useGlobalState('tableFields');
  const { form, datasourceValue, refreshFlag, setRefreshFlag } = props;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [errorContent, setErrorContent] = useState('');
  const range = Form.useWatch(['query', 'range'], form);
  const keys = Form.useWatch(['query', 'keys'], form);
  const query = Form.useWatch(['query', QUERY_KEY], form);
  const [highLevelConfig, setHighLevelConfig] = useState({
    shared: true,
    sharedSortDirection: 'desc',
    legend: true,
    unit: 'none',
  });
  const lineGraphProps = {
    custom: {
      drawStyle: 'lines',
      lineWidth: 2,
      fillOpacity: 0.01,
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
    if (datasourceValue && refreshFlag && query && keys?.valueKey && range) {
      const parsedRange = parseRange(range);
      const start = moment(parsedRange.start).unix();
      const end = moment(parsedRange.end).unix();
      setLoading(true);
      getDsQuery({
        cate: NAME_SPACE,
        datasource_id: datasourceValue,
        query: [
          {
            [QUERY_KEY]: query,
            from: start,
            to: end,
            keys: {
              valueKey: _.join(keys.valueKey, ' '),
              labelKey: _.join(keys.labelKey, ' '),
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
          setLocalQueryHistory(`${HISTORY_RECORDS_CACHE_KEY}-${datasourceValue}`, query);
        })
        .catch((err) => {
          const msg = _.get(err, 'message');
          setErrorContent(`Error executing query: ${msg}`);
          setData([]);
        })
        .finally(() => {
          setRefreshFlag();
          setLoading(false);
        });
    }
  }, [JSON.stringify(range), JSON.stringify(keys), query, refreshFlag]);

  return (
    <div className='explorer-graph-container'>
      <Space>
        <div style={{ width: 600 }}>
          <AdvancedSettings
            mode='graph'
            span={12}
            prefixName={['query']}
            expanded
            expandTriggerVisible={false}
            onChange={() => {
              form.validateFields().then(() => {
                setRefreshFlag(_.uniqueId('refreshFlag_'));
              });
            }}
            options={_.map(tableFields, (field) => {
              return { label: field, value: field };
            })}
          />
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
      {errorContent && <Alert style={{ marginBottom: 16 }} message={errorContent} type='error' />}
      <Spin spinning={loading}>
        <Timeseries inDashboard={false} values={lineGraphProps as any} series={data} />
      </Spin>
    </div>
  );
}
