import React, { useContext, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import { useSize } from 'ahooks';

import { CommonStateContext } from '@/App';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { hexPalette } from '@/pages/dashboard/config';

import { IPanel } from '../../../types';

import getDataFrameAndBaseSeries from './utils/getDataFrameAndBaseSeries';
import getLegendData from './utils/getLegendData';
import getChartContainerSize from './utils/getChartContainerSize';
import { LegendList, LegendTable } from './components/Legend';
import Main from './Main';
import './style.less';

export { getDataFrameAndBaseSeries };

interface Props {
  dashboardID: number;
  id?: string;
  values: IPanel;
  series: any[];
  annotations: any[];
  setAnnotationsRefreshFlag?: (flag: string) => void;
  colors?: string[];
  time?: IRawTimeRange;
  setRange?: (range: IRawTimeRange) => void;
  inDashboard?: boolean;
  isPreview?: boolean;
  chartHeight?: string;
  tableHeight?: string;
  themeMode?: 'dark';
  hideResetBtn?: boolean;
  onClick?: (event: any, datetime: Date, value: number, points: any[]) => void;
  onZoomWithoutDefult?: (times: Date[]) => void;
}

const PADDING = 8;

export default function index(props: Props) {
  const { darkMode: appDarkMode } = useContext(CommonStateContext);
  // TODO 不建议，后面会删除。hoc打开的组件获取不到 App 中 useContext, 这里用localStorage兜底
  const darkMode = appDarkMode || localStorage.getItem('darkMode') === 'true';
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSize = useSize(containerRef);
  const legendRef = useRef<HTMLDivElement>(null);
  const legendSize = useSize(legendRef);

  // 整理参数
  const mainProps = {
    panel: props.values,
    series: props.series,
    annotations: props.annotations,
    setAnnotationsRefreshFlag: props.setAnnotationsRefreshFlag,
    colors: props.colors ?? hexPalette,
    range: props.time,
    setRange: props.setRange,
    inDashboard: props.inDashboard,
    isPreview: props.isPreview,
    hideResetBtn: props.hideResetBtn,
    onClick: props.onClick,
    onZoomWithoutDefult: props.onZoomWithoutDefult,
  };
  const options = mainProps.panel.options;
  const legend = options?.legend;
  const legendDisplayMode = options.legend?.displayMode || 'table';
  const legendColumns = !_.isEmpty(options.legend?.columns) ? options.legend?.columns : legendDisplayMode === 'table' ? ['max', 'min', 'avg', 'sum', 'last'] : [];
  const legendBehaviour = options.legend?.behaviour || 'showItem';
  const legendSelectMode = options.legend?.selectMode || 'single';
  const chartContainerSize = getChartContainerSize(PADDING, containerSize, legendSize, legendDisplayMode, legend?.placement);
  const [dataRefresh, setDataRefresh] = useState(_.uniqueId('dataRefresh_'));
  const [activeLegend, setActiveLegend] = useState<string>(); // legendSelectMode === 'single'
  const [activeLegends, setActiveLegends] = useState<string[]>([]); // legendSelectMode === 'multiple'
  const { frames, baseSeries } = useMemo(() => {
    setDataRefresh(_.uniqueId('dataRefresh_'));
    // TODO: 数据刷新后 series.id 会变化，这里暂时重置 activeLegend 和 activeLegends
    // 后续需要考虑通过 series.metric 生成 hash 值，来判断是否是同一个 series
    setActiveLegend(undefined);
    setActiveLegends([]);
    return getDataFrameAndBaseSeries(mainProps.series as any);
  }, [JSON.stringify(mainProps.series)]);
  const seriesData = useMemo(() => {
    if (legendSelectMode === 'multiple') {
      return _.map(baseSeries, (subItem) => {
        const id = subItem.n9e_internal.id;
        return {
          ...subItem,
          show: activeLegends.length ? (legendBehaviour === 'hideItem' ? !activeLegends.includes(id) : activeLegends.includes(id)) : true,
        };
      });
    }
    return _.map(baseSeries, (subItem) => {
      const id = subItem.n9e_internal.id;
      return {
        ...subItem,
        show: activeLegend ? (legendBehaviour === 'hideItem' ? activeLegend !== id : activeLegend === id) : true,
      };
    });
  }, [dataRefresh, activeLegend, JSON.stringify(activeLegends)]);
  const legendData = useMemo(() => {
    const { options, overrides } = mainProps.panel;
    if (legend?.displayMode !== 'hidden') {
      return getLegendData({
        frames,
        baseSeries: seriesData,
        hexPalette: mainProps.colors,
        standardOptions: options?.standardOptions,
        valueMappings: options?.valueMappings,
        thresholds: options?.thresholds,
        overrides,
      });
    }
    return [];
  }, [dataRefresh, legend?.displayMode, JSON.stringify(mainProps.panel), JSON.stringify(seriesData)]);

  return (
    <div
      ref={containerRef}
      className='renderer-timeseries-ng-container'
      style={{
        flexDirection: legend?.placement === 'right' ? 'row' : 'column',
        padding: PADDING,
      }}
    >
      <div className='renderer-timeseries-ng-graph-container'>
        {props.id && chartContainerSize.width && chartContainerSize.height && (
          <Main
            {...mainProps}
            dashboardID={props.dashboardID}
            id={props.id}
            darkMode={darkMode}
            width={chartContainerSize.width}
            height={chartContainerSize.height}
            frames={frames}
            baseSeries={seriesData}
          />
        )}
      </div>
      {(legendDisplayMode === 'list' || legendDisplayMode === 'table') && (
        <div
          ref={legendRef}
          className='renderer-timeseries-ng-legend-container'
          style={{
            maxHeight: legend?.placement === 'bottom' ? (legend?.heightInPercentage || 30) + '%' : 'unset',
            maxWidth: legend?.placement === 'right' ? (legend?.widthInPercentage || 60) + '%' : 'unset',
          }}
        >
          {legendDisplayMode === 'list' && (
            <LegendList
              panel={mainProps.panel}
              range={mainProps.range}
              data={legendData}
              legendColumns={legendColumns}
              placement={legend?.placement}
              onRowClick={(record) => {
                if (legendSelectMode === 'multiple') {
                  setActiveLegends(_.xor(activeLegends, [record.id]));
                } else {
                  setActiveLegend(activeLegend !== record.id ? record.id : '');
                }
              }}
            />
          )}
          {legendDisplayMode === 'table' && (
            <LegendTable
              panel={mainProps.panel}
              range={mainProps.range}
              data={legendData}
              legendColumns={legendColumns}
              onRowClick={(record) => {
                if (legendSelectMode === 'multiple') {
                  setActiveLegends(_.xor(activeLegends, [record.id]));
                } else {
                  setActiveLegend(activeLegend !== record.id ? record.id : '');
                }
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
