import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button, Popover, Spin, Empty, Space, Select, Form, InputNumber, message } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import TimeRangePicker, { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import { getSerieName } from '@/pages/dashboard/Renderer/datasource/utils';
import { fetchHistoryRangeBatch } from '@/services/dashboardV2';
import { CommonStateContext } from '@/App';
import { completeBreakpoints } from '@/pages/dashboard/Renderer/datasource/utils';

const getDefaultStepByStartAndEnd = (start: number, end: number) => {
  return Math.max(Math.floor((end - start) / 240), 1);
};

export default function GraphPreview({ form, fieldName, promqlFieldName = 'prom_ql' }) {
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const { t } = useTranslation('alertRules');
  const divRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [datasourceId, setDatasourceId] = useState<number>();
  const [range, setRange] = useState<IRawTimeRange>({
    start: 'now-24h',
    end: 'now',
  });
  const [step, setStep] = useState<number | null>();
  const var_enabled = Form.useWatch(['rule_config', 'queries', fieldName, 'var_enabled']);

  const fetchData = () => {
    const query = form.getFieldValue(['rule_config', 'queries', fieldName]);
    const parsedRange = parseRange(range);
    const from = moment(parsedRange.start).unix();
    const to = moment(parsedRange.end).unix();

    if (datasourceId) {
      setLoading(true);
      const curStep = step || getDefaultStepByStartAndEnd(from, to);
      fetchHistoryRangeBatch(
        {
          datasource_id: datasourceId,
          queries: [
            {
              query: query[promqlFieldName],
              start: from,
              end: to,
              step: curStep,
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
                data: completeBreakpoints(curStep, serie.values),
              });
            });
          }
          setData(series);
        })
        .catch((res) => {
          try {
            message.error(res.message);
          } catch (e) {
            console.log(e);
          }
          setData([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    if (visible && datasourceId) {
      fetchData();
    }
  }, [visible, datasourceId, range]);

  // 启用变量时无法预览，这里隐藏预览按钮
  if (!!var_enabled) return null;

  return (
    <div ref={divRef}>
      <Popover
        placement='right'
        visible={visible}
        onVisibleChange={(visible) => {
          setVisible(visible);
          if (!visible) {
            setData([]);
          }
        }}
        title={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <div>{t('preview')}</div>
            <Space>
              <span>{t('common:datasource.name')}:</span>
              <Select
                value={datasourceId}
                onChange={(value) => {
                  setDatasourceId(value);
                }}
                style={{ width: 200 }}
                options={_.map(groupedDatasourceList.prometheus, (item) => {
                  return {
                    label: item.name,
                    value: item.id,
                  };
                })}
              />
              <TimeRangePicker value={range} onChange={setRange} dateFormat='YYYY-MM-DD HH:mm:ss' />
              <InputNumber
                placeholder='step'
                value={step}
                onChange={(val) => {
                  setStep(val);
                }}
                onBlur={() => {
                  fetchData();
                }}
                onPressEnter={() => {
                  fetchData();
                }}
              />
            </Space>
          </div>
        }
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
                      time={range}
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
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('common:nodata')} />
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
              const datasource_id = form.getFieldValue('datasource_value');
              setDatasourceId(datasource_id);
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
