import React, { useState, forwardRef, useImperativeHandle } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Spin, Empty } from 'antd';
import { parseRange } from '@/components/TimeRangePicker';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import { getSerieName } from '@/pages/dashboard/Renderer/datasource/utils';
import AdvancedSettings from '../../components/AdvancedSettings';
import { getDsQuery } from '../../services';

function TimeseriesCpt(props, ref) {
  const { setExecuteLoading } = props;
  const [loading, setLoading] = useState(false);
  const [series, setSeries] = useState<any[]>([]);

  useImperativeHandle(ref, () => ({
    fetchData: (datasourceCate, datasourceValue, values) => {
      const query = values.query;
      if (query.keys.valueKey) {
        query.keys.valueKey = _.join(query.keys.valueKey, ' ');
      }
      if (query.keys.labelKey) {
        query.keys.labelKey = _.join(query.keys.labelKey, ' ');
      }
      const requestParams = {
        cate: datasourceCate,
        datasource_id: datasourceValue,
        query: [
          {
            from: moment(parseRange(query.range).start).unix(),
            to: moment(parseRange(query.range).end).unix(),
            sql: query.query,
            keys: query.keys,
          },
        ],
      };
      setLoading(true);
      setExecuteLoading(true);
      getDsQuery(requestParams)
        .then((res) => {
          setSeries(
            _.map(res, (item) => {
              return {
                name: getSerieName(item.metric),
                metric: item.metric,
                data: item.values,
              };
            }),
          );
        })
        .catch(() => {
          setSeries([]);
        })
        .finally(() => {
          setLoading(false);
          setExecuteLoading(false);
        });
    },
  }));

  return (
    <>
      <AdvancedSettings prefixName={['query']} expanded expandTriggerVisible={false} />
      {!_.isEmpty(series) ? (
        <div className='n9e-antd-table-height-full'>
          <Spin spinning={loading}>
            <Timeseries
              series={series}
              values={
                {
                  custom: {
                    drawStyle: 'lines',
                    lineInterpolation: 'smooth',
                  },
                  options: {
                    legend: {
                      displayMode: 'table',
                    },
                    tooltip: {
                      mode: 'all',
                    },
                  },
                } as any
              }
            />
          </Spin>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      )}
    </>
  );
}

export default forwardRef(TimeseriesCpt);
