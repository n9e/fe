import React, { useRef, useState, useEffect } from 'react';
import { Button, Popover } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import TimeRangePicker, { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import { getDsQuery } from '../../services';
import { getSerieName } from '../../utils';

export default function GraphPreview({ cate, datasourceValue, query }) {
  const { t } = useTranslation('db_tdengine');
  const divRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [range, setRange] = useState<IRawTimeRange>({
    start: 'now-1h',
    end: 'now',
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
          const parsedRange = parseRange(range);
          const from = moment(parsedRange.start).toISOString();
          const to = moment(parsedRange.end).toISOString();
          return {
            query: q.query,
            keys: {
              metricKey: _.isArray(q.keys?.metricKey) ? _.join(q.keys?.metricKey, ' ') : q.keys?.metricKey,
              labelKey: _.isArray(q.keys?.labelKey) ? _.join(q.keys?.labelKey, ' ') : q.keys?.labelKey,
              timeFormat: q.keys?.timeFormat,
            },
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

  useEffect(() => {
    if (visible) {
      fetchData();
    }
  }, [JSON.stringify(range)]);

  return (
    <div ref={divRef}>
      <Popover
        placement='right'
        visible={visible}
        onVisibleChange={(visible) => {
          setVisible(visible);
        }}
        title={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                lineHeight: '32px',
              }}
            >
              {t('datasource:es.alert.query.preview')}
            </div>
            <div>
              <TimeRangePicker value={range} onChange={setRange} />
            </div>
          </div>
        }
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
