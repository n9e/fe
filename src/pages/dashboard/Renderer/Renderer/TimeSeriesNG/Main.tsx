import React, { useState, useRef, useEffect, useMemo } from 'react';
import uPlot, { Options } from 'uplot';
import _ from 'lodash';

import UPlotChart, { tooltipPlugin, paddingSide, axisBuilder, seriesBuider, cursorBuider, scalesBuilder, getStackedDataAndBands } from '@/components/UPlotChart';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { hexPalette } from '@/pages/dashboard/config';

import { IPanel } from '../../../types';
import valueFormatter from '../../utils/valueFormatter';
import { getLegendValues, getMappedTextObj } from '../../utils/getCalculatedValuesBySeries';

import getDataFrameAndBaseSeries from './utils/getDataFrameAndBaseSeries';
import './style.less';
import { Button } from 'antd';

export { getDataFrameAndBaseSeries };

interface Props {
  darkMode: boolean;
  width: number;
  height: number;
  panel: IPanel;
  series: any[];
  colors?: string[];
  range?: IRawTimeRange;
  setRange?: (range: IRawTimeRange) => void;
  inDashboard?: boolean; // 是否在仪表盘中
  isPreview?: boolean; // 是否在编辑面板的预览模式
  hideResetBtn?: boolean;
  onClick?: (event: any, datetime: Date, value: number, points: any[]) => void;
  onZoomWithoutDefult?: (times: Date[]) => void;
}

export default function index(props: Props) {
  const { darkMode, width, height, panel, series, colors, range, setRange, inDashboard, isPreview, hideResetBtn, onClick, onZoomWithoutDefult } = props;
  const { custom, options = {}, targets, overrides } = panel;
  console.log('custom', custom);
  const idRef = useRef<string>(`renderer-timeseries-${_.uniqueId()}`);
  const uPlotChartRef = useRef<any>();
  const xScaleRange = useRef<[number, number]>(); // 保存 x 轴初始缩放范围
  const [showResetZoomBtn, setShowResetZoomBtn] = useState(false);
  const { frames, baseSeries } = getDataFrameAndBaseSeries(series as any);
  const uOptions: Options = useMemo(() => {
    return {
      width,
      height,
      padding: [paddingSide, paddingSide, paddingSide, paddingSide],
      legend: { show: false },
      plugins: [
        tooltipPlugin({
          id: idRef.current + '-tooltip',
          pointNameformatter: (val, point) => {
            let name = val;
            if (options?.standardOptions?.displayName) {
              name = options?.standardOptions?.displayName;
            }
            const override = _.find(overrides, (item) => item.matcher.value === point?.n9e_internal?.refId);
            if (override && override?.properties?.standardOptions?.displayName) {
              name = override?.properties?.standardOptions?.displayName;
            }
            return getMappedTextObj(name, options?.valueMappings)?.text;
          },
          pointValueformatter: (val, point) => {
            const override = _.find(overrides, (item) => item.matcher.value === point?.n9e_internal?.refId);
            if (override) {
              return valueFormatter(
                {
                  unit: override?.properties?.standardOptions?.util,
                  decimals: override?.properties?.standardOptions?.decimals,
                  dateFormat: override?.properties?.standardOptions?.dateFormat,
                },
                val,
              ).text;
            }
            return valueFormatter(
              {
                unit: options?.standardOptions?.util,
                decimals: options?.standardOptions?.decimals,
                dateFormat: options?.standardOptions?.dateFormat,
              },
              val,
            ).text;
          },
        }),
      ],
      cursor: cursorBuider({}),
      scales: scalesBuilder({
        yDistr: custom.scaleDistribution?.type === 'log' ? 3 : 1,
        yLog: custom.scaleDistribution?.type === 'log' ? custom.scaleDistribution?.log : undefined,
      }),
      series: seriesBuider({
        baseSeries,
        colors: colors ?? hexPalette,
        width: custom.lineWidth,
        pathsType: custom.drawStyle === 'bars' ? 'bars' : custom.lineInterpolation === 'smooth' ? 'spline' : 'linear',
        fillOpacity: custom.fillOpacity,
        gradientMode: custom.gradientMode,
        points: { show: custom.showPoints === 'always', size: custom.showPoints === 'always' ? custom.pointSize : 6 },
      }),
      axes: [
        axisBuilder({
          isTime: true,
          theme: darkMode ? 'dark' : 'light',
        }),
        axisBuilder({
          theme: darkMode ? 'dark' : 'light',
          formatValue: (v) => {
            return valueFormatter(
              {
                unit: options?.standardOptions?.util,
                decimals: options?.standardOptions?.decimals,
                dateFormat: options?.standardOptions?.dateFormat,
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
              if (u.status === 0 && _.isNumber(min) && _.isNumber(max)) {
                xScaleRange.current = [min, max];
              } else if (u.status === 1) {
                if (_.isEqual(xScaleRange.current, [min, max])) {
                  setShowResetZoomBtn(false);
                } else {
                  setShowResetZoomBtn(true);
                }
              }
            }
          },
        ],
      },
    };
  }, [width, height, custom, options, colors]);
  // const { data: stackedData, bands } = getStackedDataAndBands(frames);
  // options.bands = bands;

  return (
    <>
      <div className='renderer-timeseries-graph'>
        <UPlotChart ref={uPlotChartRef} options={uOptions} data={frames} />
        <Button
          className='renderer-timeseries-graph-zoom-resetBtn'
          style={{
            display: showResetZoomBtn ? 'block' : 'none',
          }}
          onClick={() => {
            const uPlot = uPlotChartRef.current && uPlotChartRef.current.getChartInstance();
            if (uPlot && xScaleRange.current) {
              uPlot.setScale('x', { min: xScaleRange.current[0], max: xScaleRange.current[1] });
            }
          }}
        >
          Reset zoom
        </Button>
      </div>
    </>
  );
}
