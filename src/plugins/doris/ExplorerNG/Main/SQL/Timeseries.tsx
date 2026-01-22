import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Spin, Empty, Form, Space, Radio, Tooltip, Select } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { AlignedData, Options } from 'uplot';
import { useSize } from 'ahooks';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { CommonStateContext } from '@/App';
import UPlotChart, { tooltipPlugin, paddingSide, axisBuilder, seriesBuider, cursorBuider, scalesBuilder } from '@/components/UPlotChart';
import { parseRange } from '@/components/TimeRangePicker';
import { getSerieName } from '@/pages/dashboard/Renderer/datasource/utils';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';
import { hexPalette } from '@/pages/dashboard/config';
import getDataFrameAndBaseSeries, { BaseSeriesItem } from '@/pages/dashboard/Renderer/Renderer/TimeSeriesNG/utils/getDataFrameAndBaseSeries';
import { LegendTable } from '@/pages/dashboard/Renderer/Renderer/TimeSeriesNG/components/Legend';
import getLegendData from '@/pages/dashboard/Renderer/Renderer/TimeSeriesNG/utils/getLegendData';
import UnitPicker from '@/pages/dashboard/Components/UnitPicker';
import valueFormatter from '@/pages/dashboard/Renderer/utils/valueFormatter';

import { NAME_SPACE } from '../../../constants';
import { getDsQuery } from '../../../services';
import replaceTemplateVariables from '../../utils/replaceTemplateVariables';
import ResetZoomButton from './ResetZoomButton';

interface Props {
  sqlVizType: string;
  width: number;
  setExecuteLoading: (loading: boolean) => void;
}

function Graph(props: {
  width: number;
  height: number;
  frames: AlignedData;
  baseSeries: BaseSeriesItem[];
  showResetZoomBtn: boolean;
  unit: string;
  setShowResetZoomBtn: (show: boolean) => void;
}) {
  const { darkMode } = useContext(CommonStateContext);
  const { width, height, frames, baseSeries, showResetZoomBtn, unit, setShowResetZoomBtn } = props;
  const xScaleInitMinMaxRef = useRef<[number, number]>();
  const yScaleInitMinMaxRef = useRef<[number, number]>();
  const uplotRef = useRef<any>();
  const id = useMemo(() => _.uniqueId(`${NAME_SPACE}_explort_id_`), []);
  const uOptions: Options = useMemo(() => {
    return {
      width,
      height,
      padding: [paddingSide, paddingSide, paddingSide, paddingSide],
      legend: { show: false },
      plugins: [
        tooltipPlugin({
          id,
          mode: 'all',
          sort: 'none',
          pointValueformatter: (val) => {
            return valueFormatter(
              {
                unit,
              },
              val,
            ).text;
          },
        }),
      ],
      cursor: cursorBuider({}),
      scales: scalesBuilder({}),
      series: seriesBuider({
        baseSeries,
        colors: hexPalette,
        width: 2,
        pathsType: 'spline',
        points: { show: false },
        fillOpacity: 0,
        spanGaps: true,
      }),
      axes: [
        axisBuilder({
          isTime: true,
          theme: darkMode ? 'dark' : 'light',
        }),
        axisBuilder({
          scaleKey: 'y',
          theme: darkMode ? 'dark' : 'light',
          formatValue: (v) => {
            return valueFormatter(
              {
                unit,
              },
              v,
            ).text;
          },
        }),
      ],
      hooks: {
        setScale: [
          (u, scaleKey) => {
            if (scaleKey === 'x') {
              const min = u.scales.x.min;
              const max = u.scales.x.max;
              if (u.status === 0 && typeof min === 'number' && typeof max === 'number') {
                xScaleInitMinMaxRef.current = [min, max];
              } else if (u.status === 1) {
                if (_.isEqual(xScaleInitMinMaxRef.current, [min, max])) {
                  setShowResetZoomBtn(false);
                } else {
                  setShowResetZoomBtn(true);
                }
              }
            } else if (scaleKey === 'y') {
              const min = u.scales.y.min;
              const max = u.scales.y.max;
              if (u.status === 0 && typeof min === 'number' && typeof max === 'number') {
                yScaleInitMinMaxRef.current = [min, max];
              }
            }
          },
        ],
      },
    };
  }, [width, height, darkMode, JSON.stringify(baseSeries), unit]);

  return (
    <div className='relative'>
      <UPlotChart
        id={id}
        options={uOptions}
        data={frames}
        className='h-full min-h-0'
        onCreate={(id, uplot) => {
          uplotRef.current = uplot;
        }}
      />
      <ResetZoomButton
        showResetZoomBtn={showResetZoomBtn}
        getUplot={() => {
          return uplotRef.current;
        }}
        xScaleInitMinMax={xScaleInitMinMaxRef.current}
        yScaleInitMinMax={yScaleInitMinMaxRef.current}
      />
    </div>
  );
}

export default function TimeseriesCpt(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { sqlVizType, width, setExecuteLoading } = props;
  const form = Form.useFormInstance();
  const refreshFlag = Form.useWatch('refreshFlag');
  const labelKey = Form.useWatch(['query', 'keys', 'labelKey']);
  const valueKey = Form.useWatch(['query', 'keys', 'valueKey']);

  const eleRef = useRef<HTMLDivElement>(null);
  const eleSize = useSize(eleRef);
  const [unit, setUnit] = useState('none');
  const [showResetZoomBtn, setShowResetZoomBtn] = useState(false);
  const [activeLegend, setActiveLegend] = useState<string>();
  const [dataRefresh, setDataRefresh] = useState(_.uniqueId('dataRefresh_'));
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ frames: AlignedData; baseSeries: BaseSeriesItem[] }>({
    frames: [],
    baseSeries: [],
  });

  useEffect(() => {
    if (refreshFlag) {
      form.validateFields().then((values) => {
        const query = values.query;
        if (query.keys.valueKey) {
          query.keys.valueKey = _.join(query.keys.valueKey, ' ');
        }
        if (query.keys.labelKey) {
          query.keys.labelKey = _.join(query.keys.labelKey, ' ');
        }
        const requestParams = {
          cate: values.datasourceCate,
          datasource_id: values.datasourceValue,
          query: [
            {
              from: moment(parseRange(query.range).start).unix(),
              to: moment(parseRange(query.range).end).unix(),
              sql: replaceTemplateVariables(_.trim(query.sql), query.range, width),
              keys: query.keys,
            },
          ],
        };
        setLoading(true);
        setExecuteLoading(true);
        getDsQuery(requestParams)
          .then((res) => {
            const series = _.map(res, (item) => {
              return {
                id: _.uniqueId('series_'),
                refId: item.refId,
                name: getSerieName(item.metric),
                metric: {},
                data: item.values,
              };
            });
            const { frames, baseSeries } = getDataFrameAndBaseSeries(series);
            setData({ frames, baseSeries });
            setDataRefresh(_.uniqueId('dataRefresh_'));
          })
          .catch(() => {
            setData({ frames: [[]], baseSeries: [] });
            setDataRefresh(_.uniqueId('dataRefresh_'));
          })
          .finally(() => {
            setLoading(false);
            setExecuteLoading(false);
            setShowResetZoomBtn(false);
            setActiveLegend(undefined);
          });
      });
    }
  }, [refreshFlag, labelKey, valueKey]);

  const seriesData = useMemo(() => {
    return _.map(data.baseSeries, (subItem) => {
      const id = subItem.n9e_internal.id;
      return {
        ...subItem,
        show: activeLegend ? activeLegend === id : true,
      };
    });
  }, [dataRefresh, activeLegend]);

  const legendData = useMemo(() => {
    return getLegendData({
      frames: data.frames,
      baseSeries: seriesData,
      hexPalette,
      standardOptions: { unit },
    });
  }, [dataRefresh, activeLegend, JSON.stringify(seriesData), unit]);

  // useEffect(() => {
  //   if (refreshFlag === undefined) {
  //     setData({
  //       frames: [],
  //       baseSeries: [],
  //     });
  //   }
  // }, [refreshFlag]);

  return (
    <>
      <div className='flex-shrink-0 mb-[18px]'>
        <Space wrap align='start'>
          <Form.Item className='input-group-with-form-item-content-small' style={{ margin: 0 }}>
            <Radio.Group
              options={[
                {
                  label: t('query.sqlVizType.table'),
                  value: 'table',
                },
                {
                  label: t('query.sqlVizType.timeseries'),
                  value: 'timeseries',
                },
              ]}
              optionType='button'
              size='small'
              value={sqlVizType}
              onChange={(e) => {
                form.setFields([
                  {
                    name: ['query', 'sqlVizType'],
                    value: e.target.value,
                  },
                ]);
              }}
            />
          </Form.Item>
          <InputGroupWithFormItem
            size='small'
            label={
              <Space>
                {t('query.advancedSettings.valueKey')}
                <Tooltip title={t('query.advancedSettings.valueKey_tip')}>
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <Form.Item
              name={['query', 'keys', 'valueKey']}
              rules={[
                {
                  required: true,
                  message: t('query.advancedSettings.valueKey_required'),
                },
              ]}
              style={{ margin: 0 }}
            >
              <Select className='min-w-[120px] no-padding-small-multiple-select' mode='tags' open={false} size='small' />
            </Form.Item>
          </InputGroupWithFormItem>
          <InputGroupWithFormItem
            size='small'
            label={
              <Space>
                {t('query.advancedSettings.labelKey')}
                <Tooltip title={t('query.advancedSettings.labelKey_tip')}>
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <Form.Item name={['query', 'keys', 'labelKey']} style={{ margin: 0 }}>
              <Select className='min-w-[120px] no-padding-small-multiple-select' mode='tags' open={false} size='small' />
            </Form.Item>
          </InputGroupWithFormItem>
          <InputGroupWithFormItem label={t('common:unit')} size='small'>
            <Form.Item noStyle>
              <UnitPicker
                size='small'
                dropdownMatchSelectWidth={false}
                style={{
                  minWidth: 120,
                }}
                value={unit}
                onChange={(val) => {
                  setUnit(val);
                }}
              />
            </Form.Item>
          </InputGroupWithFormItem>
        </Space>
      </div>
      <>
        {!_.isEmpty(data.frames) ? (
          <div className='best-looking-scroll'>
            <div ref={eleRef} className='min-h-[480px] relative'>
              <div className='n9e-antd-table-height-full'>
                <Spin spinning={loading}>
                  {eleSize?.width && eleSize?.height && (
                    <Graph
                      width={eleSize.width}
                      height={eleSize.height}
                      frames={data.frames}
                      baseSeries={seriesData}
                      showResetZoomBtn={showResetZoomBtn}
                      unit={unit}
                      setShowResetZoomBtn={setShowResetZoomBtn}
                    />
                  )}
                </Spin>
              </div>
            </div>
            <div className='flex-1 min-h-0 renderer-timeseries-ng-legend-container'>
              <LegendTable
                panel={{ options: {} } as any}
                data={legendData}
                legendColumns={['max', 'min', 'avg', 'sum', 'last']}
                onRowClick={(record) => {
                  setActiveLegend(activeLegend !== record.id ? record.id : '');
                }}
              />
            </div>
          </div>
        ) : loading ? (
          <div className='flex justify-center'>
            <Empty
              className='ant-empty-normal'
              image='/image/img_executing.svg'
              description={t(`${logExplorerNS}:loading`)}
              imageStyle={{
                height: 80,
              }}
            />
          </div>
        ) : (
          <div className='flex justify-center'>
            <Empty
              className='ant-empty-normal'
              image='/image/img_empty.svg'
              description={t(`${logExplorerNS}:no_data`)}
              imageStyle={{
                height: 80,
              }}
            />
          </div>
        )}
      </>
    </>
  );
}
