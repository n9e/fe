import React, { useContext, useRef } from 'react';
import _ from 'lodash';
import { useSize } from 'ahooks';

import { CommonStateContext } from '@/App';
import { IRawTimeRange } from '@/components/TimeRangePicker';

import { IPanel } from '../../../types';

import getDataFrameAndBaseSeries from './utils/getDataFrameAndBaseSeries';
import Main from './Main';
import './style.less';

export { getDataFrameAndBaseSeries };

interface Props {
  values: IPanel;
  series: any[];
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

export default function index(props: Props) {
  const { darkMode: appDarkMode } = useContext(CommonStateContext);
  // TODO 不建议，后面会删除。hoc打开的组件获取不到 App 中 useContext, 这里用localStorage兜底
  const darkMode = appDarkMode || localStorage.getItem('darkMode') === 'true';
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSize = useSize(containerRef);
  // 整理参数
  const mainProps = {
    panel: props.values,
    series: props.series,
    colors: props.colors,
    range: props.time,
    setRange: props.setRange,
    inDashboard: props.inDashboard,
    isPreview: props.isPreview,
    hideResetBtn: props.hideResetBtn,
    onClick: props.onClick,
    onZoomWithoutDefult: props.onZoomWithoutDefult,
  };

  return (
    <div className='p1' style={{ height: '100%' }}>
      <div ref={containerRef} className='renderer-timeseries-container'>
        {containerSize?.width && containerSize?.height && <Main {...mainProps} darkMode={darkMode} width={containerSize.width} height={containerSize.height} />}
      </div>
    </div>
  );
}
