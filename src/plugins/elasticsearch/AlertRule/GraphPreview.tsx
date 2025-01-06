import React, { useState, useRef, useEffect } from 'react';
import { Button, Popover } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import TimeRangePicker, { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import { normalizeTime } from '../utils';
import { getDsQuery } from './services';

interface IProps {
  form: any;
  datasourceValue: number;
  disabled?: boolean;
}

const getSerieName = (metric: Object) => {
  let name = metric['__name__'] || '';
  _.forEach(_.omit(metric, '__name__'), (value, key) => {
    name += ` ${key}: ${value}`;
  });
  return _.trim(name);
};

export default function GraphPreview({ form, datasourceValue, disabled }: IProps) {
  const { t } = useTranslation('alertRules');
  const divRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [range, setRange] = useState<IRawTimeRange>({
    start: 'now-1h',
    end: 'now',
  });
  const [series, setSeries] = useState<any[]>([]);
  const fetchSeries = () => {
    const queries = form.getFieldValue(['rule_config', 'queries']);
    const parsedRange = parseRange(range);
    const start = moment(parsedRange.start).unix();
    const end = moment(parsedRange.end).unix();
    getDsQuery(
      {
        cate: form.getFieldValue('cate'),
        datasource_id: datasourceValue,
        query: _.map(queries, (item) => {
          return {
            ref: item.ref,
            index: item.index,
            filter: item.filter,
            value: item.value,
            group_by: item.group_by,
            date_field: item.date_field,
            interval: normalizeTime(item.interval, item.interval_unit),
            start,
            end,
          };
        }),
      },
      false,
    )
      .then((res) => {
        setSeries(
          _.map(res.dat, (item) => {
            return {
              id: _.uniqueId('series_'),
              name: getSerieName(item.metric),
              metric: item.metric,
              data: item.values,
            };
          }),
        );
      })
      .catch(() => {
        setSeries([]);
      });
  };

  useEffect(() => {
    if (visible) {
      fetchSeries();
    }
  }, [JSON.stringify(range)]);

  return (
    <div ref={divRef}>
      <Popover
        placement='bottomLeft'
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
            <Timeseries
              inDashboard={false}
              values={
                {
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
                    },
                  },
                } as any
              }
              series={series}
            />
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
              fetchSeries();
              setVisible(true);
            }
          }}
          disabled={disabled}
        >
          {t('datasource:es.alert.query.preview')}
        </Button>
      </Popover>
    </div>
  );
}
