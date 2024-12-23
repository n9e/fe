import React, { useState, useRef, useMemo } from 'react';
import uplot, { AlignedData, Options } from 'uplot';
import _ from 'lodash';

import UPlotChart, { tooltipPlugin, paddingSide, axisBuilder, seriesBuider, cursorBuider, scalesBuilder, getStackedDataAndBands, uplotsMap } from '@/components/UPlotChart';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { hexPalette } from '@/pages/dashboard/config';

import { IPanel } from '../../../types';
import valueFormatter from '../../utils/valueFormatter';
import { getMappedTextObj } from '../../utils/getCalculatedValuesBySeries';
import secondYAxisBuilder from './utils/secondYAxisBuilder';
import { defaultOptionsValues } from '../../../Editor/config';
import { useGlobalState } from '../../../globalState';

import getDataFrameAndBaseSeries, { BaseSeriesItem } from './utils/getDataFrameAndBaseSeries';
import drawThresholds from './utils/drawThresholds';
import getScalesMinMax from './utils/getScalesMinMax';
import ResetZoomButton from './components/ResetZoomButton';
import './style.less';

export { getDataFrameAndBaseSeries };

interface Props {
  id: string;
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
  const { id, frames, baseSeries, darkMode, width, height, panel, series, colors, range, setRange, inDashboard, isPreview, hideResetBtn, onClick, onZoomWithoutDefult } = props;
  const { custom, options = {}, targets, overrides } = panel;
  const [dashboardMeta] = useGlobalState('dashboardMeta');
  const uplotRef = useRef<any>();
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
          id,
          mode: options.tooltip?.mode ?? (defaultOptionsValues.tooltip.mode as any),
          sort: options.tooltip?.sort ?? (defaultOptionsValues.tooltip.sort as any),
          graphTooltip: dashboardMeta.graphTooltip as any,
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
        overrides,
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
                unit: options?.standardOptions?.util,
                decimals: options?.standardOptions?.decimals,
                dateFormat: options?.standardOptions?.dateFormat,
              },
              v,
            ).text;
          },
        }),
        ...secondYAxisBuilder(panel, darkMode),
      ],
      hooks: {
        draw: [
          (uplot) => {
            if (options.thresholds) {
              const mode = options.thresholds.mode ?? defaultOptionsValues.thresholds.mode;
              drawThresholds({
                uplot,
                thresholds: {
                  ...options.thresholds,
                  mode,
                },
                thresholdsStyle: {
                  mode: options.thresholdsStyle?.mode ?? (defaultOptionsValues.thresholdsStyle.mode as any),
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
        <UPlotChart
          id={id}
          options={uOptions}
          data={data}
          onCreate={(id, uplot) => {
            uplotRef.current = uplot;
            uplotsMap.set(id, uplot);
          }}
          onDelete={(id) => {
            uplotsMap.delete(id);
          }}
        />
        {!hideResetBtn && (
          <ResetZoomButton
            showResetZoomBtn={showResetZoomBtn}
            getUplot={() => {
              return uplotRef.current;
            }}
            xScaleInitMinMax={xScaleInitMinMaxRef.current}
            yScaleInitMinMax={yScaleInitMinMaxRef.current}
          />
        )}
      </div>
    </>
  );
}