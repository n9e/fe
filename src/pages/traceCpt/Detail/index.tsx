import React, { useState } from 'react';
import { Space } from 'antd';
import { LeftOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import TraceDetailHeader from './Header';
import Timeline from './Timeline';
import { ViewRangeTimeUpdate, IViewRange, TUpdateViewRangeTimeFunction } from './types';
import { trackRange } from './index.track';
import { Trace } from '../type';
import ScrollManager from './Timeline/ScrollManager';
import { scrollBy, scrollTo } from './Timeline/scroll-page';
interface IProps {
  trace?: Trace;
  onBack?: () => void;
}

export default function TraceDetail(props: IProps) {
  const { trace, onBack } = props;
  const [collapseHeader, setCollapseHeader] = useState(false);
  const [viewRange, setViewRange] = useState<IViewRange>({
    time: {
      current: [0, 1],
    },
  });

  const updateViewRangeTime: TUpdateViewRangeTimeFunction = (start: number, end: number, trackSrc?: string) => {
    if (trackSrc) {
      trackRange(trackSrc, [start, end], viewRange.time.current);
    }
    const current: [number, number] = [start, end];
    const time = { current };
    setViewRange({ time });
  };

  const updateNextViewRangeTime = (update: ViewRangeTimeUpdate) => {
    const time = { ...viewRange.time, ...update };
    setViewRange({ time });
  };
  const _scrollManager: ScrollManager = new ScrollManager(undefined, {
    scrollBy,
    scrollTo,
  });

  return (
    <>
      <div className='ub-flex ub-items-center'>
        {onBack && <LeftOutlined onClick={() => onBack()} style={{ marginRight: 8 }} />}
        <div className='page-title' onClick={() => setCollapseHeader(!collapseHeader)} style={{ height: 32, lineHeight: '32px', margin: 0 }}>
          <Space>
            {trace?.traceName}
            {trace?.traceID}
            {collapseHeader ? <RightOutlined /> : <DownOutlined />}
          </Space>
        </div>
      </div>

      <div className='tracing-detail'>
        {trace && !collapseHeader && (
          <TraceDetailHeader trace={trace} viewRange={viewRange} updateViewRangeTime={updateViewRangeTime} updateNextViewRangeTime={updateNextViewRangeTime} />
        )}
        {trace && (
          <Timeline
            trace={trace}
            viewRange={viewRange}
            updateViewRangeTime={updateViewRangeTime}
            updateNextViewRangeTime={updateNextViewRangeTime}
            registerAccessors={_scrollManager.setAccessors}
            scrollToFirstVisibleSpan={_scrollManager.scrollToFirstVisibleSpan}
          />
        )}
      </div>
    </>
  );
}
