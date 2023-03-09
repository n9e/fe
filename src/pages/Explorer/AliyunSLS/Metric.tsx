import React, { useState, forwardRef, useImperativeHandle } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Spin, Empty } from 'antd';
import { getDsQuery } from '@/services/metric';
import { parseRange } from '@/components/TimeRangePicker';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import { getSerieName } from '@/pages/dashboard/Renderer/datasource/utils';
import AdvancedSettings from './AdvancedSettings';

function Metric(props, ref) {
  const [loading, setLoading] = useState(false);
  const [series, setSeries] = useState<any[]>([]);

  useImperativeHandle(ref, () => ({
    fetchData: (datasourceCate, datasourceName, values) => {
      const query = values.query;
      if (query.keys.valueKey) {
        query.keys.valueKey = _.join(query.keys.valueKey, ' ');
      }
      if (query.keys.labelKey) {
        query.keys.labelKey = _.join(query.keys.labelKey, ' ');
      }
      const requestParams = {
        cate: datasourceCate,
        cluster: datasourceName,
        query: [
          {
            project: query.project,
            logstore: query.logstore,
            from: moment(parseRange(query.range).start).unix(),
            to: moment(parseRange(query.range).end).unix(),
            lines: 500,
            offset: 0,
            reverse: false,
            power_sql: query.power_sql,
            query: query.query,
            keys: query.keys,
          },
        ],
      };
      setLoading(true);
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
        .finally(() => {
          setLoading(false);
        });
    },
  }));

  return (
    <>
      <AdvancedSettings />
      {!_.isEmpty(series) ? (
        <Spin spinning={loading}>
          <div style={{ height: 500 }}>
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
          </div>
        </Spin>
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

export default forwardRef(Metric);
