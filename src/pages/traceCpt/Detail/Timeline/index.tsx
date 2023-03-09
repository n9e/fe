import React, { useEffect, useState, useRef } from 'react';
import createGlobalState from 'react-use/esm/factory/createGlobalState';
import { throttle } from 'lodash';
import TimelineHeaderRow from './TimelineHeaderRow';
import VirtualizedTraceView from './VirtualizedTraceView';
import { Accessors } from './ScrollManager';
import { TTraceTimeline } from './VirtualizedTraceView';
import DetailState from './SpanDetail/DetailState';
import { Trace } from '../../type';
import { IViewRange, ViewRangeTimeUpdate, TUpdateViewRangeTimeFunction } from '../types';

interface IProps {
  trace: Trace;
  viewRange: IViewRange;
  updateNextViewRangeTime: (update: ViewRangeTimeUpdate) => void;
  updateViewRangeTime: TUpdateViewRangeTimeFunction;
  registerAccessors: (accessors: Accessors) => void;
  scrollToFirstVisibleSpan: () => void;
}

export type TSpanIdValue = { span_id: string };

function newInitialState(): TTraceTimeline {
  return {
    childrenHiddenIDs: new Set(),
    detailStates: new Map(),
    hoverIndentGuideIds: new Set(),
    shouldScrollToFirstUiFindMatch: false,
    spanNameColumnWidth: 0.25,
    traceID: null,
  };
}
export const useTraceTimeline = createGlobalState<TTraceTimeline>(newInitialState());

export default function TraceDetailTimeline(props: IProps) {
  const contentRef = useRef<any>(null);
  const { trace, viewRange, updateNextViewRangeTime, updateViewRangeTime, registerAccessors, scrollToFirstVisibleSpan } = props;
  const [spanNameColumnWidth, setSpanNameColumnWidth] = useState(0.25);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [traceTimeLine, setTraceTimeLine] = useTraceTimeline();
  function childrenToggle(span_id) {
    const childrenHiddenIDs = new Set(traceTimeLine.childrenHiddenIDs);
    if (childrenHiddenIDs.has(span_id)) {
      childrenHiddenIDs.delete(span_id);
    } else {
      childrenHiddenIDs.add(span_id);
    }
    setTraceTimeLine({ ...traceTimeLine, childrenHiddenIDs });
  }

  function detailToggle(spanID) {
    const detailStates = new Map(traceTimeLine.detailStates);
    if (detailStates.has(spanID)) {
      detailStates.delete(spanID);
    } else {
      detailStates.set(spanID, new DetailState());
    }
    setTraceTimeLine({ ...traceTimeLine, detailStates });
  }

  function detailSubsectionToggle(subSection: 'tags' | 'process' | 'logs' | 'warnings' | 'references', spanID) {
    const old = traceTimeLine.detailStates.get(spanID);
    if (!old) {
      return traceTimeLine;
    }
    let detailState;
    if (subSection === 'tags') {
      detailState = old.toggleTags();
    } else if (subSection === 'process') {
      detailState = old.toggleProcess();
    } else if (subSection === 'warnings') {
      detailState = old.toggleWarnings();
    } else if (subSection === 'references') {
      detailState = old.toggleReferences();
    } else {
      detailState = old.toggleLogs();
    }
    const detailStates = new Map(traceTimeLine.detailStates);
    detailStates.set(spanID, detailState);
    setTraceTimeLine({ ...traceTimeLine, detailStates });
  }

  const detailTagsToggle = detailSubsectionToggle.bind(null, 'tags');
  const detailProcessToggle = detailSubsectionToggle.bind(null, 'process');
  const detailLogsToggle = detailSubsectionToggle.bind(null, 'logs');
  const detailWarningsToggle = detailSubsectionToggle.bind(null, 'warnings');
  const detailReferencesToggle = detailSubsectionToggle.bind(null, 'references');

  function detailLogItemToggle(spanID, logItem) {
    const old = traceTimeLine.detailStates.get(spanID);
    if (!old) {
      return traceTimeLine;
    }
    const detailState = old.toggleLogItem(logItem);
    const detailStates = new Map(traceTimeLine.detailStates);
    detailStates.set(spanID, detailState);
    setTraceTimeLine({ ...traceTimeLine, detailStates });
  }

  function setTrace(trace: Trace) {
    const { traceID, spans } = trace;
    if (traceID === traceTimeLine.traceID) {
      return traceTimeLine;
    }
    const { spanNameColumnWidth } = traceTimeLine;

    setTraceTimeLine({ ...newInitialState(), spanNameColumnWidth, traceID: traceID });
  }

  const calcRow = () => {
    if (contentRef.current) {
      const { clientWidth, clientHeight } = contentRef.current;
      if (clientHeight && clientWidth) {
        setContentHeight(clientHeight);
      }
    }
  };

  const resizeTable = throttle(() => {
    calcRow();
  }, 100);

  useEffect(() => {
    calcRow();
    window.addEventListener('resize', resizeTable);
    return () => {
      window.removeEventListener('resize', resizeTable);
    };
  }, []);

  useEffect(() => {
    calcRow();
  }, [traceTimeLine]);

  return (
    <div className='tracing-detail-timeline' ref={contentRef}>
      <TimelineHeaderRow
        contentHeight={contentHeight}
        duration={trace.duration}
        nameColumnWidth={spanNameColumnWidth}
        numTicks={5}
        onCollapseAll={() => {}}
        onCollapseOne={() => {}}
        onColummWidthChange={setSpanNameColumnWidth}
        onExpandAll={() => {}}
        onExpandOne={() => {}}
        viewRangeTime={viewRange.time}
        updateNextViewRangeTime={updateNextViewRangeTime}
        updateViewRangeTime={updateViewRangeTime}
      />
      <VirtualizedTraceView
        {...traceTimeLine}
        spanNameColumnWidth={spanNameColumnWidth}
        childrenToggle={childrenToggle}
        detailToggle={detailToggle}
        detailTagsToggle={detailTagsToggle}
        detailProcessToggle={detailProcessToggle}
        detailLogsToggle={detailLogsToggle}
        detailWarningsToggle={detailWarningsToggle}
        detailReferencesToggle={detailReferencesToggle}
        detailLogItemToggle={detailLogItemToggle}
        currentViewRangeTime={viewRange.time.current}
        setTrace={setTrace}
        setSpanNameColumnWidth={setSpanNameColumnWidth}
        focusUiFindMatches={() => {}}
        clearShouldScrollToFirstUiFindMatch={() => {}}
        findMatchesIDs={null}
        trace={trace}
        scrollToFirstVisibleSpan={scrollToFirstVisibleSpan}
        registerAccessors={registerAccessors}
      />
    </div>
  );
}
