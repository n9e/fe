import React, { useState, useContext, useMemo, useRef, useEffect, useCallback } from 'react';
import { Popover, Tooltip } from 'antd';
import moment from 'moment';
import purify from 'dompurify';

import { Link } from '@/pages/explorer/components/Links';
import { parseRange } from '@/components/TimeRangePicker';
import { getHighlightHtml, getTokenHighlights } from '@/pages/logExplorer/utils/highlight/highlight_html';
import { LOG_FIELD_SELECT_POPOVER_CLASS, LOG_VIEWER_IGNORE_CLICK_AWAY_CLASS } from '@/pages/logExplorer/components/LogsViewer/utils/clickAway';

import { TokenActionMenuContent } from './tokenActionMenu';
import { getHighlightSource, getTokenDisplayValue } from './tokenValue';
import { getNodeDebugName, getSelectionTextWithinRoot, getTextSelectionPopoverResult, isNodeInside, isTextSelectDebugEnabled } from './textSelect';
import { toString } from './util';
import { LogsViewerStateContext } from '../../index';
import { Field } from '../../../../types';
import renderFieldValue from '../../../../utils/renderFieldValue';
import { OnValueFilterParams } from '../../types';

interface Props {
  segmented: boolean;
  parentKey?: string; // 嵌套json渲染时可以传入，目前仅用在下钻的字段名判断中。目前仅在 sls 中使用
  name: string;
  value: string; // 单个 token 的值
  fieldValue: string; // 完整字段值
  tokenStart?: number;
  tokenEnd?: number;
  highlightKey?: string;
  onTokenClick?: (parmas: OnValueFilterParams) => void;
  rawValue?: { [key: string]: any };
  highlight?: { [key: string]: string[] };
  enableTooltip?: boolean;
  fieldValueClassName?: string;
  adjustFieldValue?: (formatedValue: string, highlightValue?: string[]) => React.ReactNode;
  showExistsAction?: boolean; // 是否展示 exists 操作，目前仅在 es 中使用
  /** 默认 click 打开菜单；textSelect 为划词后打开 */
  interactionMode?: 'popoverClick' | 'textSelect';
}

export default function Token(props: Props) {
  const { indexData } = useContext(LogsViewerStateContext);
  return <TokenWithContext {...props} indexData={indexData || []} />;
}

/** mousedown 的 target 可能是文本节点，需归一化后再调用 Element#closest */
function eventTargetToElement(target: EventTarget | null): Element | null {
  if (target == null || typeof (target as Node).nodeType !== 'number') return null;
  const node = target as Node;
  return node instanceof Element ? node : node.parentElement;
}

function TokenWithContext(props: Props & { indexData: Field[] }) {
  const { raw_key, fieldConfig, range, getAddToQueryInfo } = useContext(LogsViewerStateContext);

  const {
    segmented,
    parentKey,
    name,
    value,
    fieldValue,
    onTokenClick,
    rawValue,
    highlight,
    enableTooltip,
    fieldValueClassName,
    indexData,
    adjustFieldValue,
    showExistsAction,
    interactionMode = 'popoverClick',
  } = props;
  const highlightKey = props.highlightKey || (parentKey ? `${parentKey}.${name}` : name);
  const tokenStart = props.tokenStart ?? 0;
  const tokenEnd = props.tokenEnd ?? toString(fieldValue).length;

  const [popoverVisible, setPopoverVisible] = useState(false);
  const [anchorRect, setAnchorRect] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const [selectedFragment, setSelectedFragment] = useState('');
  const hostRef = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLSpanElement>(null);
  const selectionStartedInsideRef = useRef(false);

  const relatedLinks = fieldConfig?.linkArr?.filter((item) => (parentKey ? item.field === parentKey : item.field === name));

  const parsedRange = range ? parseRange(range) : null;
  const start = parsedRange ? moment(parsedRange.start).unix() : 0;
  const end = parsedRange ? moment(parsedRange.end).unix() : 0;

  const indexInfo = useMemo(() => {
    if (!getAddToQueryInfo) {
      return { isIndex: true, indexName: name };
    }
    if (!indexData?.length) {
      return { isIndex: false, indexName: name };
    }
    return getAddToQueryInfo({
      parentKey,
      fieldName: name,
      logRowData: (rawValue || {}) as { [index: string]: unknown },
      indexData,
    });
  }, [getAddToQueryInfo, name, parentKey, raw_key, JSON.stringify(rawValue?.[raw_key]), JSON.stringify(indexData)]);

  const displayValue = getTokenDisplayValue({
    value,
    fieldValue,
    name,
    fieldConfig,
  });

  const highlightSource = getHighlightSource(highlightKey, highlight);
  const tokenHighlights = getTokenHighlights(fieldValue, highlightSource, tokenStart, tokenEnd);

  const adjustedValue = adjustFieldValue ? (
    adjustFieldValue(displayValue, tokenHighlights)
  ) : tokenHighlights ? (
    <span dangerouslySetInnerHTML={{ __html: purify.sanitize(getHighlightHtml(displayValue, tokenHighlights)) }} />
  ) : (
    renderFieldValue(value)
  );

  const closePopover = useCallback(() => {
    setPopoverVisible(false);
  }, []);

  const getPopupContainer = useCallback((triggerNode?: HTMLElement) => {
    const host = triggerNode || hostRef.current;
    return host?.closest(`.${LOG_VIEWER_IGNORE_CLICK_AWAY_CLASS}`) || host?.closest('.ant-drawer-content') || document.body;
  }, []);

  const handleTextSelectMouseDownCapture = useCallback(() => {
    selectionStartedInsideRef.current = true;

    if (isTextSelectDebugEnabled()) {
      console.log('[TokenTextSelect] mousedown-capture', { name });
    }
  }, []);

  const handleTextSelectMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const root = rootRef.current;
    const debugEnabled = isTextSelectDebugEnabled();
    const selectionTextWithinRoot = selection && root ? getSelectionTextWithinRoot(selection, root) : '';

    if (debugEnabled) {
      console.log('[TokenTextSelect] before-evaluate', {
        name,
        selectionText: selection?.toString() || '',
        selectionTextWithinRoot,
        anchorNode: getNodeDebugName(selection?.anchorNode ?? null),
        focusNode: getNodeDebugName(selection?.focusNode ?? null),
        rangeCount: selection?.rangeCount ?? 0,
      });
    }

    const result = getTextSelectionPopoverResult({
      host: hostRef.current,
      root,
      selection,
      isNodeInside,
      selectionTextWithinRoot,
      onDebug: debugEnabled
        ? (payload) => {
            console.log('[TokenTextSelect] evaluate', { name, ...payload });
          }
        : undefined,
    });

    if (!result) {
      setPopoverVisible(false);

      if (debugEnabled) {
        console.log('[TokenTextSelect] popover-hidden', { name });
      }

      return;
    }

    setAnchorRect(result.anchorRect);
    setSelectedFragment(result.selectedFragment);
    setPopoverVisible(true);

    if (debugEnabled) {
      console.log('[TokenTextSelect] popover-visible', {
        name,
        selectedFragment: result.selectedFragment,
        anchorRect: result.anchorRect,
      });
    }
  }, []);

  useEffect(() => {
    if (interactionMode !== 'textSelect') return;

    const onDocMouseUp = () => {
      if (!selectionStartedInsideRef.current) return;
      selectionStartedInsideRef.current = false;

      if (isTextSelectDebugEnabled()) {
        console.log('[TokenTextSelect] doc-mouseup-captured', { name });
      }

      requestAnimationFrame(() => {
        handleTextSelectMouseUp();
      });
    };

    document.addEventListener('mouseup', onDocMouseUp);
    return () => document.removeEventListener('mouseup', onDocMouseUp);
  }, [interactionMode, handleTextSelectMouseUp]);

  useEffect(() => {
    if (interactionMode !== 'textSelect' || !popoverVisible) return;
    const onScrollClose = () => setPopoverVisible(false);
    window.addEventListener('scroll', onScrollClose, true);
    return () => window.removeEventListener('scroll', onScrollClose, true);
  }, [interactionMode, popoverVisible]);

  useEffect(() => {
    if (interactionMode !== 'textSelect' || !popoverVisible) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      const targetEl = eventTargetToElement(e.target);
      if (targetEl?.closest(`.${LOG_FIELD_SELECT_POPOVER_CLASS}`)) return;
      setPopoverVisible(false);
    };
    document.addEventListener('mousedown', onDocMouseDown, true);
    return () => document.removeEventListener('mousedown', onDocMouseDown, true);
  }, [interactionMode, popoverVisible]);

  const menuContent = (
    <TokenActionMenuContent
      close={closePopover}
      name={name}
      fieldValue={fieldValue}
      fragmentValue={interactionMode === 'textSelect' ? selectedFragment : value}
      showFragmentFilters={interactionMode === 'textSelect' ? !!selectedFragment.trim() : segmented}
      onTokenClick={onTokenClick}
      indexInfo={indexInfo}
      showExistsAction={showExistsAction}
      relatedLinks={relatedLinks}
      start={start}
      end={end}
      rawValue={rawValue}
      fieldConfig={fieldConfig}
    />
  );

  if (interactionMode === 'textSelect') {
    return (
      <span ref={hostRef} className='relative inline-flex max-w-full min-w-0 align-top'>
        <span ref={rootRef} className={`inline min-w-0 max-w-full break-all select-text ${fieldValueClassName ?? ''}`} onMouseDownCapture={handleTextSelectMouseDownCapture}>
          <Tooltip
            title={enableTooltip ? <pre className='whitespace-pre-wrap overflow-hidden mb-0 ant-tooltip-max-height-400 overflow-y-auto'>{adjustedValue}</pre> : undefined}
            placement='topLeft'
            overlayClassName='ant-tooltip-max-width-600'
          >
            {relatedLinks && relatedLinks.length > 0 ? (
              <Link
                text={adjustedValue}
                linkContext={{
                  rawValue: rawValue!,
                  name,
                  fieldConfig,
                  range,
                  parentKey,
                }}
              />
            ) : (
              <span className='inline break-all text-hint m-0 p-0 cursor-text'>{adjustedValue}</span>
            )}
          </Tooltip>
        </span>
        <Popover
          visible={popoverVisible}
          onVisibleChange={(visible) => {
            setPopoverVisible(visible);
          }}
          trigger='click'
          overlayClassName={LOG_FIELD_SELECT_POPOVER_CLASS}
          content={menuContent}
          getPopupContainer={getPopupContainer}
        >
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: anchorRect.left,
              top: anchorRect.top,
              width: 1,
              height: 1,
              pointerEvents: 'none',
            }}
          />
        </Popover>
      </span>
    );
  }

  return (
    <Popover
      visible={popoverVisible}
      onVisibleChange={(visible) => {
        setPopoverVisible(visible);
      }}
      trigger={['click']}
      overlayClassName='explorer-origin-field-val-popover'
      content={menuContent}
      getPopupContainer={getPopupContainer}
    >
      <Tooltip
        title={enableTooltip ? <pre className='whitespace-pre-wrap overflow-hidden mb-0 ant-tooltip-max-height-400 overflow-y-auto'>{adjustedValue}</pre> : undefined}
        placement='topLeft'
        overlayClassName='ant-tooltip-max-width-600'
      >
        {relatedLinks && relatedLinks.length > 0 ? (
          <Link
            text={adjustedValue}
            linkContext={{
              rawValue: rawValue!,
              name,
              fieldConfig,
              range,
              parentKey,
            }}
          />
        ) : (
          <div className={`inline text-hint m-0 p-0 cursor-pointer hover:underline ${fieldValueClassName ?? ''}`}>{adjustedValue}</div>
        )}
      </Tooltip>
    </Popover>
  );
}
