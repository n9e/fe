import React, { useRef, useState } from 'react';
import { Button, Popover, Spin, Empty } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { parseRange } from '@/components/TimeRangePicker';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import { getSerieName } from '@/pages/dashboard/Renderer/datasource/utils';
import { fetchHistoryRangeBatch } from '@/services/dashboardV2';
import { completeBreakpoints } from '@/pages/dashboard/Renderer/datasource/utils';

const getDefaultStepByStartAndEnd = (start: number, end: number) => {
  return Math.max(Math.floor((end - start) / 240), 1);
};

export default function GraphPreview({ form, fieldName, promqlFieldName = 'prom_ql' }) {
  const { t } = useTranslation();
  const divRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const fetchData = () => {
    const datasource_ids = form.getFieldValue('datasource_ids');
    const datasource_id = _.isArray(datasource_ids) ? datasource_ids?.[0] : datasource_ids;
    const query = form.getFieldValue(['rule_config', 'queries', fieldName]);
    const parsedRange = parseRange({
      start: 'now-24h',
      end: 'now',
    });
    const from = moment(parsedRange.start).unix();
    const to = moment(parsedRange.end).unix();

    if (datasource_id) {
      setLoading(true);
      const step = getDefaultStepByStartAndEnd(from, to);
      fetchHistoryRangeBatch(
        {
          datasource_id,
          queries: [
            {
              query: query[promqlFieldName],
              start: from,
              end: to,
              step,
            },
          ],
        },
        'ID',
      )
        .then((res) => {
          const series: any[] = [];
          const dat = res.dat || [];
          for (let i = 0; i < dat?.length; i++) {
            var item = {
              result: dat[i],
              expr: res[i]?.query,
              refId: res[i]?.refId,
            };
            _.forEach(item.result, (serie) => {
              series.push({
                id: _.uniqueId('series_'),
                refId: item.refId,
                name: getSerieName(serie.metric),
                metric: serie.metric,
                expr: item.expr,
                data: completeBreakpoints(step, serie.values),
              });
            });
          }
          setData(series);
        })
        .finally(() => {
          setLoading(false);
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
        title={t('数据预览')}
        content={
          <div
            style={{
              width: 700,
            }}
          >
            <>
              {!_.isEmpty(data) ? (
                <Spin spinning={loading}>
                  <div
                    style={{
                      height: 500,
                    }}
                  >
                    <Timeseries
                      series={data}
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
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('暂无数据')} />
                </div>
              )}
            </>
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
          {t('数据预览')}
        </Button>
      </Popover>
    </div>
  );
}
