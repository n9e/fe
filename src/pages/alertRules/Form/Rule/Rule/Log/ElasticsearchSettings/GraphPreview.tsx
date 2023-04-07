import React, { useState, useRef, useEffect } from 'react';
import { Button, Popover } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import TimeRangePicker, { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { getDsQuery } from '@/services/warning';
import { getSeriesQuery } from '@/pages/dashboard/Renderer/datasource/elasticsearch/queryBuilder';
import { processResponseToSeries } from '@/pages/dashboard/Renderer/datasource/elasticsearch/processResponse';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import { normalizeTime } from '../utils';

interface IProps {
  form: any;
  datasourceValue: number;
}

export default function GraphPreview({ form, datasourceValue }: IProps) {
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
    const start = moment(parsedRange.start).valueOf();
    const end = moment(parsedRange.end).valueOf();
    const batchDsParams = _.map(queries, (item) => {
      return {
        index: item.index,
        filter: item.filter,
        values: [item.value],
        group_by: item.group_by,
        date_field: item.date_field,
        interval: normalizeTime(item.interval, item.interval_unit),
        start,
        end,
      };
    });
    let payload = '';
    _.forEach(batchDsParams, (item) => {
      const esQuery = JSON.stringify(getSeriesQuery(item));
      const header = JSON.stringify({
        search_type: 'query_then_fetch',
        ignore_unavailable: true,
        index: item.index,
      });
      payload += header + '\n';
      payload += esQuery + '\n';
    });
    getDsQuery(datasourceValue, payload).then((res) => {
      const series = _.map(processResponseToSeries(res, batchDsParams), (item) => {
        return {
          id: _.uniqueId('series_'),
          ...item,
        };
      });
      setSeries(series);
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
        >
          {t('datasource:es.alert.query.preview')}
        </Button>
      </Popover>
    </div>
  );
}
