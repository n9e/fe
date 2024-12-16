import React, { useState, useRef, useMemo } from 'react';
import uPlot, { AlignedData, Options } from 'uplot';
import _ from 'lodash';
import moment from 'moment';

import UPlotChart, { tooltipPlugin, paddingSide, axisBuilder, seriesBuider, cursorBuider, scalesBuilder, getStackedDataAndBands } from '@/components/UPlotChart';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { hexPalette } from '@/pages/dashboard/config';

import { IPanel } from '../../../types';
import valueFormatter from '../../utils/valueFormatter';
import { getMappedTextObj } from '../../utils/getCalculatedValuesBySeries';

import getDataFrameAndBaseSeries, { BaseSeriesItem } from './utils/getDataFrameAndBaseSeries';
import drawThresholds from './utils/drawThresholds';
import getScalesMinMax from './utils/getScalesMinMax';
import ResetZoomButton from './components/ResetZoomButton';
import './style.less';

export { getDataFrameAndBaseSeries };

interface Props {
  frames: AlignedData;
  baseSeries: BaseSeriesItem[];
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
  const { frames, baseSeries, darkMode, width, height, panel, series, colors, range, setRange, inDashboard, isPreview, hideResetBtn, onClick, onZoomWithoutDefult } = props;
  const { custom, options = {}, targets, overrides } = panel;
  const idRef = useRef<string>(`renderer-timeseries-${_.uniqueId()}`);
  const uPlotChartRef = useRef<any>();
  // 保存 x 和 y 轴初始缩放范围
  const xScaleInitMinMaxRef = useRef<[number, number]>();
  const yScaleInitMinMaxRef = useRef<[number, number]>();
  const [showResetZoomBtn, setShowResetZoomBtn] = useState(false);
  const uOptions: Options = useMemo(() => {
    const { xMinMax, yRange } = getScalesMinMax({ range, panel });
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
        xMinMax,
        yRange,
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
        draw: [
          (uplot) => {
            if (options.thresholds) {
              drawThresholds({
                uplot,
                thresholds: {
                  ...options.thresholds,
                  mode: 'absolute',
                },
                // thresholdsStyle: options.thresholdsStyle,
                thresholdsStyle: {
                  mode: 'dashed+area',
                },
              });
            }
          },
        ],
        setScale: [
          (u, scaleKey) => {
            if (scaleKey === 'x') {
              const min = u.scales.x.min;
              const max = u.scales.x.max;
              if (u.status === 0 && _.isNumber(min) && _.isNumber(max)) {
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
              if (u.status === 0 && _.isNumber(min) && _.isNumber(max)) {
                yScaleInitMinMaxRef.current = [min, max];
              }
            }
          },
        ],
      },
    };
  }, [width, height, custom, options, colors, JSON.stringify(range)]);
  let data = frames;

  if (custom.stack === 'noraml') {
    const stackedDataAndBands = getStackedDataAndBands(frames);
    const stackedData = stackedDataAndBands.data;
    uOptions.bands = stackedDataAndBands.bands;
    data = _.concat([frames[0]], stackedData) as any;
  }

  return (
    <>
      <div className='renderer-timeseries-ng-graph'>
        <UPlotChart ref={uPlotChartRef} options={uOptions} data={data} />
        {!hideResetBtn && (
          <ResetZoomButton
            showResetZoomBtn={showResetZoomBtn}
            uPlotChartRef={uPlotChartRef}
            xScaleInitMinMax={xScaleInitMinMaxRef.current}
            yScaleInitMinMax={yScaleInitMinMaxRef.current}
          />
        )}
      </div>
    </>
  );
}
