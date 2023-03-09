import React from 'react';
import cx from 'classnames';
import memoizeOne from 'memoize-one';
import _isEqual from 'lodash/isEqual';
import { TraceSpan, Trace, TNil, Log, KeyValuePair } from '../../../type';
import ListView from '../ListView';
import { Accessors } from '../ScrollManager';
import DetailState from './DetailState';
import colorGenerator from '../../../utils/color-generator';
import { createViewedBoundsFunc, ViewedBoundsFunctionType } from '../../../utils';
import { spanContainsErredSpan, isErrorSpan } from './utils';
import SpanDetailRow from '../SpanDetailRow';
import SpanBarRow from '../SpanBarRow';
const NUM_TICKS = 5;
export const DEFAULT_HEIGHTS = {
  bar: 28,
  detail: 161,
  detailWithLogs: 197,
};

type RowState = {
  isDetail: boolean;
  span: TraceSpan;
  spanIndex: number;
};

export type TTraceTimeline = {
  childrenHiddenIDs: Set<string>;
  detailStates: Map<string, DetailState>;
  hoverIndentGuideIds: Set<string>;
  shouldScrollToFirstUiFindMatch: boolean;
  spanNameColumnWidth: number;
  traceID: string | TNil;
};

type TVirtualizedTraceViewOwnProps = {
  currentViewRangeTime: [number, number];
  findMatchesIDs: Set<string> | TNil;
  scrollToFirstVisibleSpan: () => void;
  registerAccessors: (accesors: Accessors) => void;
  trace: Trace;
};

type TDispatchProps = {
  childrenToggle: (spanID: string) => void;
  clearShouldScrollToFirstUiFindMatch: () => void;
  detailLogItemToggle: (spanID: string, log: Log) => void;
  detailLogsToggle: (spanID: string) => void;
  detailWarningsToggle: (spanID: string) => void;
  detailReferencesToggle: (spanID: string) => void;
  detailProcessToggle: (spanID: string) => void;
  detailTagsToggle: (spanID: string) => void;
  detailToggle: (spanID: string) => void;
  setSpanNameColumnWidth: (width: number) => void;
  setTrace: (trace: Trace | TNil, uiFind: string | TNil) => void;
  focusUiFindMatches: (trace: Trace, uiFind: string | TNil, allowHide?: boolean) => void;
};

type VirtualizedTraceViewProps = TVirtualizedTraceViewOwnProps & TTraceTimeline & TDispatchProps;

function generateRowStates(spans: TraceSpan[] | TNil, childrenHiddenIDs: Set<string>, detailStates: Map<string, DetailState | TNil>): RowState[] {
  if (!spans) {
    return [];
  }
  let collapseDepth: any = null;
  const rowStates: RowState[] = [];
  for (let i = 0; i < spans.length; i++) {
    const span = spans[i];
    const { spanID, depth } = span;
    let hidden = false;
    if (collapseDepth != null) {
      if (depth >= collapseDepth) {
        hidden = true;
      } else {
        collapseDepth = null;
      }
    }
    if (hidden) {
      continue;
    }
    if (childrenHiddenIDs.has(spanID)) {
      collapseDepth = depth + 1;
    }
    rowStates.push({
      span,
      isDetail: false,
      spanIndex: i,
    });
    if (detailStates.has(spanID)) {
      rowStates.push({
        span,
        isDetail: true,
        spanIndex: i,
      });
    }
  }
  return rowStates;
}

function generateRowStatesFromTrace(trace: Trace | TNil, childrenHiddenIDs: Set<string>, detailStates: Map<string, DetailState | TNil>): RowState[] {
  return trace ? generateRowStates(trace.spans, childrenHiddenIDs, detailStates) : [];
}

function getCssClasses(currentViewRange: [number, number]) {
  const [zoomStart, zoomEnd] = currentViewRange;
  return cx({
    'clipping-left': zoomStart > 0,
    'clipping-right': zoomEnd < 1,
  });
}

const memoizedGenerateRowStates = memoizeOne(generateRowStatesFromTrace);
const memoizedViewBoundsFunc = memoizeOne(createViewedBoundsFunc, _isEqual);
const memoizedGetCssClasses = memoizeOne(getCssClasses, _isEqual);

export default function VirtualizedTraceView(props: VirtualizedTraceViewProps) {
  const getRowStates = (): RowState[] => {
    const { childrenHiddenIDs, detailStates, trace } = props;
    return memoizedGenerateRowStates(trace, childrenHiddenIDs, detailStates);
  };
  const getRowHeight = (index: number) => {
    const { span, isDetail } = getRowStates()[index];
    if (!isDetail) {
      return DEFAULT_HEIGHTS.bar;
    }
    return DEFAULT_HEIGHTS.detail;
  };

  const getKeyFromIndex = (index: number) => {
    const { isDetail, span } = getRowStates()[index];
    return `${span.spanID}--${isDetail ? 'detail' : 'bar'}--${index}`;
  };

  const getIndexFromKey = (key: string) => {
    const parts = key.split('--');
    const _spanID = parts[0];
    const _isDetail = parts[1] === 'detail';
    const _index = parts[2];
    const max = getRowStates().length;
    for (let i = 0; i < max; i++) {
      const { span, isDetail } = getRowStates()[i];
      if (span.spanID === _spanID && isDetail === _isDetail && i === Number(_index)) {
        return i;
      }
    }
    return -1;
  };

  const renderRow = (key: string, style: React.CSSProperties, index: number, attrs: {}) => {
    const { isDetail, span, spanIndex } = getRowStates()[index];
    return isDetail ? renderSpanDetailRow(span, key, style, attrs) : renderSpanBarRow(span, spanIndex, key, style, attrs);
  };

  const linksGetter = (span: TraceSpan, items: KeyValuePair[], itemIndex: number) => [{ url: '', text: '' }];

  const renderSpanDetailRow = (span: TraceSpan, key: string, style: React.CSSProperties, attrs: {}) => {
    const { spanID } = span;
    const {
      detailLogItemToggle,
      detailLogsToggle,
      detailProcessToggle,
      detailReferencesToggle,
      detailWarningsToggle,
      detailStates,
      detailTagsToggle,
      detailToggle,
      spanNameColumnWidth,
      trace,
    } = props;
    const detailState = detailStates.get(spanID);
    if (!trace || !detailState) {
      return null;
    }
    const color = colorGenerator.getColorByKey(span.process.serviceName);
    return (
      <div className='VirtualizedTraceView--row' key={key} style={{ ...style, zIndex: 1 }} {...attrs}>
        <SpanDetailRow
          color={color}
          columnDivision={spanNameColumnWidth}
          onDetailToggled={detailToggle}
          detailState={detailState}
          linksGetter={linksGetter}
          logItemToggle={detailLogItemToggle}
          logsToggle={detailLogsToggle}
          processToggle={detailProcessToggle}
          referencesToggle={detailReferencesToggle}
          warningsToggle={detailWarningsToggle}
          span={span}
          tagsToggle={detailTagsToggle}
          traceStartTime={trace.startTime}
          focusSpan={() => {}}
        />
      </div>
    );
  };

  const renderSpanBarRow = (span: TraceSpan, spanIndex: number, key: string, style: React.CSSProperties, attrs: {}) => {
    const { spanID } = span;
    const { childrenHiddenIDs, childrenToggle, detailStates, detailToggle, findMatchesIDs, spanNameColumnWidth, trace } = props;

    // to avert flow error
    if (!trace) {
      return null;
    }
    const color = colorGenerator.getColorByKey(span.process.serviceName);
    const isCollapsed = childrenHiddenIDs.has(spanID);
    const isDetailExpanded = detailStates.has(spanID);
    const isMatchingFilter = findMatchesIDs ? findMatchesIDs.has(spanID) : false;
    const showErrorIcon = isErrorSpan(span) || (isCollapsed && spanContainsErredSpan(trace.spans, spanIndex));

    return (
      <div className='VirtualizedTraceView--row' key={key} style={style} {...attrs}>
        <SpanBarRow
          className={getClippingCssClasses()}
          color={color}
          columnDivision={spanNameColumnWidth}
          isChildrenExpanded={!isCollapsed}
          isDetailExpanded={isDetailExpanded}
          isMatchingFilter={isMatchingFilter}
          numTicks={NUM_TICKS}
          onDetailToggled={detailToggle}
          onChildrenToggled={childrenToggle}
          rpc={null}
          noInstrumentedServer={null}
          showErrorIcon={showErrorIcon}
          getViewedBounds={getViewedBounds()}
          traceStartTime={trace.startTime}
          span={span}
          focusSpan={() => {}}
        />
      </div>
    );
  };

  const getViewedBounds = (): ViewedBoundsFunctionType => {
    const { currentViewRangeTime, trace } = props;
    const [zoomStart, zoomEnd] = currentViewRangeTime;

    return memoizedViewBoundsFunc({
      min: trace.startTime,
      max: trace.startTime + trace.duration,
      viewStart: zoomStart,
      viewEnd: zoomEnd,
    });
  };

  const getClippingCssClasses = (): string => {
    const { currentViewRangeTime } = props;
    return memoizedGetCssClasses(currentViewRangeTime);
  };

  return (
    <div className='VirtualizedTraceView--spans'>
      <ListView
        dataLength={getRowStates().length}
        itemHeightGetter={getRowHeight}
        itemRenderer={renderRow}
        viewBuffer={300}
        viewBufferMin={100}
        itemsWrapperClassName='VirtualizedTraceView--rowsWrapper'
        getKeyFromIndex={getKeyFromIndex}
        getIndexFromKey={getIndexFromKey}
        windowScroller
      />
    </div>
  );
}
