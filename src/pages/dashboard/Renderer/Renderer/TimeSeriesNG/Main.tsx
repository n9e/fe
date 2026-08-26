import React, { useState, useRef, useMemo, useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { AlignedData, Options } from 'uplot';
import uPlot from 'uplot';
import _ from 'lodash';
import moment from 'moment';
import { useHistory, useLocation } from 'react-router-dom';
import querystring from 'query-string';
import { useTranslation } from 'react-i18next';

import UPlotChart, { tooltipPlugin, paddingSide, axisBuilder, seriesBuider, cursorBuider, scalesBuilder, getStackedDataAndBands, uplotsMap } from '@/components/UPlotChart';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { hexPalette } from '@/pages/dashboard/config';

import { IPanel } from '../../../types';
import valueFormatter from '../../utils/valueFormatter';
import { getMappedTextObj } from '../../utils/getCalculatedValuesBySeries';
import type { CalculatedSeries } from '../../utils/getCalculatedValuesBySeries';
import secondYAxisBuilder from './utils/secondYAxisBuilder';
import { defaultOptionsValues } from '../../../Editor/config';
import { useGlobalState } from '../../../globalState';
import useStableValue from '../../../hooks/useStableValue';
import type { DashboardAnnotation, IStandardOptions } from '@/pages/dashboard/types';

import getDataFrameAndBaseSeries, { BaseSeriesItem } from './utils/getDataFrameAndBaseSeries';
import drawThresholds from './utils/drawThresholds';
import { getScalesXMinMax, getScalesYRange } from './utils/getScalesMinMax';
import ResetZoomButton from './components/ResetZoomButton';
import annotationsPlugin, { Markers as AddAnnotatsMarkers } from './components/Annotation/annotationsPlugin';
import AddAnnotationButton from './components/Annotation/AddButton';
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
  series: CalculatedSeries[];
  annotations: DashboardAnnotation[];
  setAnnotationsRefreshFlag?: (flag: string) => void;
  colors?: string[];
  range?: IRawTimeRange;
  setRange?: (range: IRawTimeRange) => void;
  timezone?: string;
  inDashboard?: boolean; // 是否在仪表盘中
  isPreview?: boolean; // 是否在编辑面板的预览模式
  hideResetBtn?: boolean;
  onClick?: (event: Event, datetime: Date, value: number, points: unknown[]) => void;
  onZoomWithoutDefult?: (times: Date[]) => void;
  dataRevision?: number;
}

export default function index(props: Props) {
  const { t } = useTranslation('dashboard');
  const history = useHistory();
  const location = useLocation();
  const {
    frames,
    baseSeries,
    darkMode,
    width,
    height,
    panel,
    series,
    annotations,
    setAnnotationsRefreshFlag,
    colors,
    range,
    setRange,
    timezone,
    inDashboard,
    isPreview,
    hideResetBtn,
    onClick,
    onZoomWithoutDefult,
  } = props;
  const id = isPreview ? `${props.id}__view` : props.id;
  const { custom: rawCustom, options = {}, targets, overrides, queryOptionsTime } = panel;
  // custom 为 JsonObject（宽类型），按折线图面板实际使用的结构收窄
  const custom = rawCustom as {
    scaleDistribution?: { type?: 'log'; log?: number };
    lineWidth?: number;
    drawStyle?: string;
    lineInterpolation?: string;
    fillOpacity?: number;
    gradientMode?: string;
    showPoints?: string;
    pointSize?: number;
    spanNulls?: boolean;
    stack?: string;
    barAlignment?: -1 | 0 | 1;
    barWidthFactor?: number;
  };
  const stableCustom = useStableValue(custom);
  const stableOptions = useStableValue(options);
  const stableRange = useStableValue(range);
  const stableAnnotations = useStableValue(annotations);
  const stableOverrides = useStableValue(overrides);
  const stableQueryOptionsTime = useStableValue(queryOptionsTime);
  const [dashboardMeta] = useGlobalState('dashboardMeta');
  const uplotRef = useRef<uPlot>();
  // 保存 x 和 y 轴初始缩放范围
  const xScaleInitMinMaxRef = useRef<[number, number]>();
  const yScaleInitMinMaxRef = useRef<[number, number]>();
  const [showResetZoomBtn, setShowResetZoomBtn] = useState(false);
  const [annotationSettingUp, setAnnotationSettingUp] = useState(false);
  const rootRefs = useRef<Map<HTMLElement, Root>>(new Map());
  const xMinMax = useMemo(() => {
    return getScalesXMinMax({ range, queryOptionsTime });
  }, [stableRange, stableQueryOptionsTime]);

  // 当 Y 轴为 log 刻度时，将 ≤ 0 的数据值转为 null，避免 uPlot 内部 log 计算产生 -Infinity/NaN 导致崩溃
  const processedFrames = useMemo(() => {
    if (custom.scaleDistribution?.type === 'log') {
      const clone = _.cloneDeep(frames) as AlignedData;
      for (let i = 1; i < clone.length; i++) {
        const series = clone[i];
        if (!series) continue;
        for (let j = 0; j < series.length; j++) {
          if (series[j] != null && series[j]! <= 0) {
            series[j] = null;
          }
        }
      }
      return clone;
    }
    return frames;
  }, [frames, custom.scaleDistribution?.type]);

  const uOptions: Options = useMemo(() => {
    const yRange = getScalesYRange({ panel });
    return {
      width,
      height,
      padding: [paddingSide, paddingSide, paddingSide, paddingSide],
      legend: { show: false },
      plugins: [
        tooltipPlugin({
          id,
          mode: options.tooltip?.mode ?? 'single',
          sort: options.tooltip?.sort ?? 'none',
          pinningEnabled: true,
          zIndex: isPreview ? 1999 : 999, // 预览模式下 z-index 需要超过编辑面板的 z-index(1000)
          graphTooltip: dashboardMeta.graphTooltip === 'sharedCrosshair' || dashboardMeta.graphTooltip === 'sharedTooltip' ? dashboardMeta.graphTooltip : 'default',
          timeZone: timezone,
          renderFooter: (domNode: HTMLDivElement, closeOverlay: () => void) => {
            let root = rootRefs.current.get(domNode);
            if (!root) {
              root = createRoot(domNode);
              rootRefs.current.set(domNode, root);
            }
            root.render(
              <AddAnnotationButton
                panelID={id}
                timeZone={timezone}
                closeOverlay={closeOverlay}
                uplotRef={uplotRef}
                setAnnotationSettingUp={setAnnotationSettingUp}
                onOk={() => {
                  if (setAnnotationsRefreshFlag) {
                    setAnnotationsRefreshFlag(_.uniqueId('annotationsRefreshFlag_'));
                  }
                }}
              />,
            );
          },
          pointNameformatter: (val, point) => {
            let name = val;
            if (options?.standardOptions?.displayName) {
              name = options?.standardOptions?.displayName;
            }
            const override = _.find(overrides, (item) => item.matcher.value === point?.n9e_internal?.refId);
            const overrideStandardOptions = override?.properties?.standardOptions as IStandardOptions | undefined;
            if (override && overrideStandardOptions?.displayName) {
              name = overrideStandardOptions?.displayName;
            }
            return getMappedTextObj(name, options?.valueMappings)?.text as string;
          },
          pointValueformatter: (val, point) => {
            const override = _.find(overrides, (item) => item.matcher.value === point?.n9e_internal?.refId);
            if (override) {
              const overrideStandardOptions = override?.properties?.standardOptions as IStandardOptions | undefined;
              return valueFormatter(
                {
                  unit: overrideStandardOptions?.unit,
                  decimals: overrideStandardOptions?.decimals,
                  dateFormat: overrideStandardOptions?.dateFormat,
                },
                val,
              ).text as string;
            }
            return valueFormatter(
              {
                unit: options?.standardOptions?.unit,
                decimals: options?.standardOptions?.decimals,
                dateFormat: options?.standardOptions?.dateFormat,
              },
              val,
            ).text as string;
          },
        }),
        annotationsPlugin({
          annotations,
          renderMarkers: (xAxisEle) => {
            let root = rootRefs.current.get(xAxisEle);
            if (!root) {
              root = createRoot(xAxisEle);
              rootRefs.current.set(xAxisEle, root);
            }
            root.render(
              <AddAnnotatsMarkers
                annotations={annotations}
                uplotRef={uplotRef}
                timeZone={timezone}
                onEdit={() => {
                  if (setAnnotationsRefreshFlag) {
                    setAnnotationsRefreshFlag(_.uniqueId('annotationsRefreshFlag_'));
                  }
                }}
                onDelete={() => {
                  if (setAnnotationsRefreshFlag) {
                    setAnnotationsRefreshFlag(_.uniqueId('annotationsRefreshFlag_'));
                  }
                }}
              />,
            );
          },
        }),
      ],
      cursor: cursorBuider({}),
      scales: scalesBuilder({
        xMinMax,
        yRange,
        yDistr: custom.scaleDistribution?.type === 'log' ? 3 : 1,
        yLog: custom.scaleDistribution?.type === 'log' ? (custom.scaleDistribution?.log as 2 | 10 | undefined) : undefined,
      }),
      series: seriesBuider({
        baseSeries,
        colors: colors ?? hexPalette,
        width: custom.lineWidth,
        pathsType: custom.drawStyle === 'bars' ? 'bars' : custom.lineInterpolation === 'smooth' ? 'spline' : 'linear',
        fillOpacity: custom.fillOpacity,
        gradientMode: custom.gradientMode as 'none' | 'opacity' | undefined,
        points: { show: custom.showPoints === 'always', size: custom.showPoints === 'always' ? custom.pointSize : 6 },
        overrides,
        spanGaps: custom.spanNulls,
        barAlignment: custom.barAlignment,
        barWidthFactor: custom.barWidthFactor,
      }),
      axes: [
        axisBuilder({
          isTime: true,
          theme: darkMode ? 'dark' : 'light',
          timeZone: timezone,
        }),
        axisBuilder({
          scaleKey: 'y',
          theme: darkMode ? 'dark' : 'light',
          formatValue: (v) => {
            return valueFormatter(
              {
                unit: options?.standardOptions?.unit,
                decimals: options?.standardOptions?.decimals,
                dateFormat: options?.standardOptions?.dateFormat,
              },
              v,
            ).text as string;
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
                  mode: options.thresholdsStyle?.mode ?? 'dashed',
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
                  if (dashboardMeta.graphZoom === 'updateTimeRange') {
                    if (min && max) {
                      if (range && setRange) {
                        setRange({
                          start: moment.unix(min),
                          end: moment.unix(max),
                        });
                        // 开启了缩放后更新全局时间范围时，url 中保存时间范围数据
                        // history.replace({
                        //   pathname: location.pathname,
                        //   search: querystring.stringify({
                        //     ...(querystring.parse(location.search) || {}),
                        //     __from: moment.unix(min).valueOf(),
                        //     __to: moment.unix(max).valueOf(),
                        //   }),
                        // });
                      }
                    }
                  } else {
                    if (!annotationSettingUp) {
                      setShowResetZoomBtn(true);
                    }
                  }
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
  }, [
    width,
    height,
    colors,
    dashboardMeta.graphTooltip,
    dashboardMeta.graphZoom,
    stableCustom,
    stableOptions,
    stableRange,
    baseSeries,
    xMinMax,
    annotationSettingUp,
    stableAnnotations,
    stableOverrides,
    timezone,
  ]);
  let data = processedFrames;
  const barGeometryVersion = _.map(baseSeries, (item) => _.get(item, ['n9e_internal', 'bucketInterval'], '')).join(',');

  if (custom.stack === 'normal') {
    const stackedDataAndBands = getStackedDataAndBands(processedFrames);
    const stackedData = stackedDataAndBands.data;
    uOptions.bands = stackedDataAndBands.bands;
    uOptions.series = _.map(uOptions.series, (s, i) => {
      if (i === 0) return s;
      const seriesWithMetadata = s as typeof s & { n9e_internal?: Record<string, unknown> };
      return {
        ...s,
        n9e_internal: {
          ...seriesWithMetadata.n9e_internal,
          values: processedFrames[i], // 只用于堆叠图下保存原始数据
        },
      };
    });
    data = _.concat([processedFrames[0]], stackedData);
  }

  useEffect(() => {
    // 重置缩放按钮状态
    setShowResetZoomBtn(false);
  }, [xMinMax]);

  return (
    <>
      <div className='renderer-timeseries-ng-graph'>
        <UPlotChart
          key={`${id}:${barGeometryVersion}:${custom.barAlignment ?? 0}:${custom.barWidthFactor ?? 0.6}`}
          id={id}
          options={uOptions}
          data={data}
          onCreate={(id, uplot) => {
            uplotRef.current = uplot;
            uplotsMap.set(id, uplot);
            // 配置变更会重建图表并将坐标范围恢复为初始值，此时同步清除旧实例的缩放状态
            setShowResetZoomBtn(false);
          }}
          onDelete={(id) => {
            uplotsMap.delete(id);
            rootRefs.current.forEach((r) => r.unmount());
            rootRefs.current.clear();
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
            onReset={() => {
              setShowResetZoomBtn(false);
            }}
          />
        )}
      </div>
    </>
  );
}
