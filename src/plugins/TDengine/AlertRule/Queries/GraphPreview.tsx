import React, { useRef, useState } from 'react';
import { Button, Popover } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { parseRange } from '@/components/TimeRangePicker';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import { getDsQuery } from '../../services';
import { getSerieName } from '../../utils';

export default function GraphPreview({ cate, datasourceValue, query }) {
  const { t } = useTranslation('db_aliyunSLS');
  const divRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<any[]>([]);
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
  const fetchData = () => {
    if (datasourceValue) {
      getDsQuery({
        cate,
        datasource_id: datasourceValue,
        query: _.map([query], (q) => {
          const parsedRange = parseRange(q.range);
          const from = moment(parsedRange.start).unix();
          const to = moment(parsedRange.end).unix();
          return {
            query: q.query,
            keys: q.keys,
            from,
            to,
          };
        }),
      }).then((res) => {
        const series = _.map(res, (item) => {
          return {
            id: _.uniqueId('series_'),
            name: getSerieName(item.metric),
            metric: item.metric,
            data: item.values,
          };
        });
        setData(series);
      });
    }
  };

  return (
    <div ref={divRef}>
      <Popover
        placement='right'
        visible={visible}
        onVisibleChange={(visible) => {
          setVisible(visible);
        }}
        title={t('preview')}
        content={
          <div style={{ width: 700 }}>
            <Timeseries inDashboard={false} values={lineGraphProps as any} series={data} />
          </div>
        }
        trigger='click'
        getPopupContainer={() => divRef.current || document.body}
      >
        <Button
          size='small'
          type='primary'
          ghost
          onClick={() => {
            if (!visible) {
              fetchData();
              setVisible(true);
            }
          }}
        >
          {t('preview')}
        </Button>
      </Popover>
    </div>
  );
}
