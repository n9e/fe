import React, { useContext, useMemo, useRef } from 'react';
import { Form, Space, Spin } from 'antd';
import moment from 'moment';
import { AlignedData, Options } from 'uplot';
import _ from 'lodash';
import { useSize } from 'ahooks';
import { useRequest } from 'ahooks';

import { CommonStateContext } from '@/App';
import { DatasourceCateEnum, PRIMARY_COLOR, IS_PLUS } from '@/utils/constant';
import UPlotChart, { tooltipPlugin, paddingSide, axisBuilder, seriesBuider, cursorBuider, scalesBuilder } from '@/components/UPlotChart';
import getDataFrameAndBaseSeries, { BaseSeriesItem } from '@/pages/dashboard/Renderer/Renderer/TimeSeriesNG/utils/getDataFrameAndBaseSeries';

import { useGlobalState, getGlobalState } from '../../globalState';
import { getDorisHistogram } from '../../services';

// @ts-ignore
import DownloadModal from 'plus:/components/LogDownload/DownloadModal';

const id = 'doris-histogram';
const format = 'YYYY-MM-DD HH:mm:ss';

function Main({
  width,
  height,
  baseSeries,
  frames,
  onBarClick,
}: {
  width: number;
  height: number;
  baseSeries: BaseSeriesItem[];
  frames: AlignedData;
  onBarClick?: (timestamp: number | null, step: number) => void;
}) {
  const { darkMode } = useContext(CommonStateContext);
  const form = Form.useFormInstance();

  // 保存 x 和 y 轴初始缩放范围
  const xScaleInitMinMaxRef = useRef<[number, number]>();

  // 图表实例引用
  const chartRef = useRef<any>(null);

  // 处理图表点击事件
  const handleChartClick = (e: MouseEvent) => {
    const u = chartRef.current;
    const [xIdx] = u.cursor.idxs;

    const xVal = u.data[0][xIdx];
    const xPrevVal = u.data[0][xIdx - 1];
    const xNextVal = u.data[0][xIdx + 1];
    // 如果 xNextVal 存在则 xStep = xNextVal - xVal
    // 如果 xNextVal 不存在但 xPrevVal 存在则 xStep = xVal - xPrevVal
    // 如果 xNextVal 和 xPrevVal 都不存在则 xStep = 0
    const xStep = xNextVal ? xNextVal - xVal : xPrevVal ? xVal - xPrevVal : 0;
    if (xStep) {
      onBarClick?.(xVal, xStep);
    }
  };

  const uOptions: Options = useMemo(() => {
    return {
      width,
      height,
      padding: [paddingSide, paddingSide, paddingSide, paddingSide],
      legend: { show: false },
      plugins: [
        tooltipPlugin({
          id,
          mode: 'single',
          sort: 'none',
        }),
        // 添加点击事件插件
        {
          hooks: {
            ready: [
              (u) => {
                chartRef.current = u;
                u.root.addEventListener('click', handleChartClick);
              },
            ],
            destroy: [
              (u) => {
                u.root.removeEventListener('click', handleChartClick);
              },
            ],
          },
        },
      ],
      cursor: cursorBuider({}),
      scales: scalesBuilder({}),
      series: seriesBuider({
        baseSeries,
        colors: [PRIMARY_COLOR],
        pathsType: 'bars',
        fillOpacity: 1,
        points: { show: false },
      }),
      axes: [
        axisBuilder({
          isTime: true,
          theme: darkMode ? 'dark' : 'light',
        }),
        axisBuilder({
          scaleKey: 'y',
          theme: darkMode ? 'dark' : 'light',
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
                if (!_.isEqual(xScaleInitMinMaxRef.current, [min, max])) {
                  if (min && max) {
                    form.setFieldsValue({
                      refreshFlag: _.uniqueId('refreshFlag_'),
                      query: {
                        range: { start: moment.unix(min), end: moment.unix(max) },
                      },
                    });
                  }
                }
              }
            }
          },
        ],
      },
    };
  }, [darkMode, width, height, JSON.stringify(baseSeries)]);

  return <UPlotChart id={id} options={uOptions} data={frames} />;
}

function RenderRange({ snapRange }: { snapRange: { start?: number; end?: number } }) {
  const [explorerParsedRange] = useGlobalState('explorerParsedRange');
  if (snapRange.start && snapRange.end) {
    return (
      <Space>
        {moment.unix(snapRange.start).format(format)} ~ {moment.unix(snapRange.end).format(format)}
      </Space>
    );
  }

  if (!explorerParsedRange?.start || !explorerParsedRange?.end) {
    return null;
  }

  return (
    <Space>
      {moment(explorerParsedRange?.start).format(format)} ~ {moment(explorerParsedRange?.end).format(format)}
    </Space>
  );
}

export default function Histogram() {
  const [explorerSnapRange, setExplorerSnapRange] = useGlobalState('explorerSnapRange');
  const form = Form.useFormInstance();
  const refreshFlag = Form.useWatch('refreshFlag');
  const datasourceValue = Form.useWatch('datasourceValue');
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSize = useSize(containerRef);

  const service = () => {
    const queryValues = form.getFieldValue('query');
    if (refreshFlag && datasourceValue && queryValues && queryValues.database && queryValues.table && queryValues.time_field) {
      const explorerParsedRange = getGlobalState('explorerParsedRange');
      const from = moment(explorerParsedRange.start).unix();
      const to = moment(explorerParsedRange.end).unix();
      return getDorisHistogram({
        cate: DatasourceCateEnum.doris,
        datasource_id: datasourceValue,
        query: [
          {
            database: queryValues.database,
            table: queryValues.table,
            time_field: queryValues.time_field,
            from,
            to,
            query: queryValues.query,
          },
        ],
      })
        .then((res) => {
          return _.map(res, (item) => {
            return {
              id: _.uniqueId('series_'),
              refId: '',
              name: '',
              metric: {},
              data: item.values,
            };
          });
        })
        .catch(() => {
          return [];
        });
    } else {
      return Promise.resolve(undefined);
    }
  };

  const { data, loading } = useRequest<any[] | undefined, any>(service, {
    refreshDeps: [refreshFlag],
  });

  const { frames, baseSeries } = useMemo(() => {
    return getDataFrameAndBaseSeries(data ?? []);
  }, [JSON.stringify(data)]);

  return (
    <div>
      <div className='flex justify-between items-center h-[21px]'>
        <Space>
          <Spin spinning={loading} size='small' />
        </Space>
        {data && (
          <Space>
            <RenderRange snapRange={explorerSnapRange} />
            {IS_PLUS && <DownloadModal queryData={{ ...form.getFieldsValue() }} />}
          </Space>
        )}
      </div>
      <div ref={containerRef} className='h-[100px]'>
        {containerSize?.width && containerSize?.height ? (
          <Main
            width={containerSize.width}
            height={containerSize.height}
            baseSeries={baseSeries}
            frames={frames}
            onBarClick={(timestamp, step) => {
              setExplorerSnapRange({
                start: timestamp ? timestamp : undefined,
                end: timestamp && step ? timestamp + step : undefined,
              });
              form.setFieldsValue({
                refreshFlag: _.uniqueId('refreshFlag_'),
              });
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
