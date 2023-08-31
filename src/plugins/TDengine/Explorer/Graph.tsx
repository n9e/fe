import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Form, Alert } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import { parseRange } from '@/components/TimeRangePicker';
import { DatasourceCateEnum } from '@/utils/constant';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import { getSerieName } from './utils';
import { getDsQuery } from '../services';

interface Props {
  form: FormInstance;
  datasourceValue: number;
}

export default function Graph(props: Props) {
  const { form, datasourceValue } = props;
  const [data, setData] = useState<any[]>([]);
  const [errorContent, setErrorContent] = useState('');
  const range = Form.useWatch(['query', 'range'], form);
  const keys = Form.useWatch(['query', 'keys'], form);
  const query = Form.useWatch(['query', 'query'], form);

  const lineGraphProps = {
    custom: {
      drawStyle: 'lines',
      fillOpacity: 0,
      stack: 'hidden',
      lineInterpolation: 'smooth',
    },
    options: {
      legend: {
        displayMode: 'table',
      },
      tooltip: {
        mode: 'all',
        sort: 'desc',
      },
      standardOptions: {
        util: 'none',
      },
    },
  };

  useEffect(() => {
    if (datasourceValue && query) {
      const parsedRange = parseRange(range);
      const start = moment(parsedRange.start).unix();
      const end = moment(parsedRange.end).unix();
      getDsQuery({
        cate: DatasourceCateEnum.tdengine,
        datasource_id: datasourceValue,
        query: [
          {
            query,
            from: start,
            to: end,
            keys,
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
          setData(series);
        })
        .catch((err) => {
          const msg = _.get(err, 'message');
          setErrorContent(`Error executing query: ${msg}`);
        });
    }
  }, [JSON.stringify(range), JSON.stringify(keys), query]);

  return (
    <div>
      {errorContent && <Alert style={{ marginBottom: 16 }} message={errorContent} type='error' />}
      <Timeseries inDashboard={false} values={lineGraphProps as any} series={data} />
    </div>
  );
}
