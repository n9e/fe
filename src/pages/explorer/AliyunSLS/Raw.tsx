import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Spin, Empty } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import _ from 'lodash';
import moment from 'moment';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import { parseRange } from '@/components/TimeRangePicker';
import { getSLSFields, getSLSLogs, getHistogram } from '@/services/metric';
import FieldsSidebar from '../components/FieldsSidebar';
import RawTable from './RawTable';

interface IProps {
  form: FormInstance;
}

function Raw(props: IProps, ref) {
  const { form } = props;
  const [fields, setFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [logs, setLogs] = useState<{ [index: string]: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMore, setIsMore] = useState(true);
  const [histogram, setHistogram] = useState<
    {
      metric: string;
      data: [number, number][];
    }[]
  >([]);

  useImperativeHandle(ref, () => ({
    fetchData: (datasourceCate, datasourceName, values) => {
      const query = values.query;
      const requestParams = {
        cate: datasourceCate,
        cluster: datasourceName,
        query: [
          {
            project: query.project,
            logstore: query.logstore,
            query: query.query,
            from: moment(parseRange(query.range).start).unix(),
            to: moment(parseRange(query.range).end).unix(),
            lines: 500,
            offset: 0,
            reverse: false,
            power_sql: query.power_sql,
          },
        ],
      };
      getSLSFields(requestParams).then((res) => {
        setFields(res);
      });
      setLoading(true);
      getSLSLogs(requestParams)
        .then((res) => {
          setLogs(res.list);
        })
        .finally(() => {
          setLoading(false);
        });
      getHistogram(requestParams).then((res) => {
        setHistogram(
          _.map(res, (item) => {
            return {
              metric: item.metric,
              data: item.values,
            };
          }),
        );
      });
    },
  }));

  const reloadLogs = (from, to) => {
    const values = form.getFieldsValue();
    const query = values.query;
    const requestParams = {
      cate: values.datasourceCate,
      cluster: values.datasourceName,
      query: [
        {
          project: query.project,
          logstore: query.logstore,
          query: query.query,
          from,
          to,
          lines: 500,
          offset: 0,
          reverse: false,
          power_sql: query.power_sql,
        },
      ],
    };
    setLoading(true);
    getSLSLogs(requestParams)
      .then((res) => {
        setLogs(res.list);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Spin spinning={loading}>
      {!_.isEmpty(histogram) ? (
        <div className='sls-discover-content'>
          <FieldsSidebar fields={fields} setFields={setFields} value={selectedFields} onChange={setSelectedFields} />
          <div className='sls-discover-main'>
            <div className='sls-discover-chart'>
              <div className='sls-discover-chart-content'>
                <Timeseries
                  series={histogram}
                  values={
                    {
                      custom: {
                        drawStyle: 'bar',
                        lineInterpolation: 'smooth',
                      },
                      options: {
                        legend: {
                          displayMode: 'hidden',
                        },
                        tooltip: {
                          mode: 'all',
                        },
                      },
                    } as any
                  }
                  onClick={(event, datetime, value, points) => {
                    const start = _.get(points, '[0][0]');
                    const allPoints = _.get(histogram, '[0].data');
                    if (start && allPoints) {
                      const step = _.get(allPoints, '[2][0]') - _.get(allPoints, '[1][0]');
                      const end = start + step;
                      reloadLogs(start, end);
                    }
                  }}
                />
              </div>
            </div>
            <RawTable data={logs} selectedFields={selectedFields} scroll={{ x: 'max-content', y: !isMore ? 312 - 35 : 312 }} />
          </div>
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
    </Spin>
  );
}

export default forwardRef(Raw);
