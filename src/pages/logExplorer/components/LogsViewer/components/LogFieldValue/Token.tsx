import React, { useState, useContext, useMemo, useRef, useEffect, useCallback } from 'react';
import { Popover, Space, Tooltip } from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined, CopyOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import purify from 'dompurify';

import { copy2ClipBoard } from '@/utils';
import IconFont from '@/components/IconFont';
import { Link, handleNav } from '@/pages/explorer/components/Links';
import type { ILogExtract, ILogMappingParams } from '@/pages/log/IndexPatterns/types';
import { parseRange } from '@/components/TimeRangePicker';
import ExistsIcon from '@/pages/explorer/components/RenderValue/ExistsIcon';
import { getHighlightHtml, getTokenHighlights } from '@/pages/logExplorer/utils/highlight/highlight_html';
import { LOG_FIELD_SELECT_POPOVER_CLASS, LOG_VIEWER_IGNORE_CLICK_AWAY_CLASS } from '@/pages/logExplorer/components/LogsViewer/utils/clickAway';

import { toString } from './util';
import { LogsViewerStateContext } from '../../index';
import { Field } from '../../../../types';
import { NAME_SPACE } from '../../../../constants';
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

/** handleNav / 外链菜单用到的 fieldConfig 子集 */
interface TokenMenuFieldConfig {
  regExtractArr?: ILogExtract[];
  mappingParamsArr?: ILogMappingParams[];
}

interface TokenActionMenuContentProps {
  close: () => void;
  name: string;
  fieldValue: string;
  fragmentValue: string;
  showFragmentFilters: boolean;
  onTokenClick?: (parmas: OnValueFilterParams) => void;
  indexInfo: { isIndex: boolean; indexName: string };
  showExistsAction?: boolean;
  relatedLinks?: { name: string; urlTemplate: string; field?: string }[];
  start: number;
  end: number;
  rawValue?: Record<string, unknown>;
  fieldConfig?: TokenMenuFieldConfig;
}

function TokenActionMenuContent(props: TokenActionMenuContentProps) {
  const { t } = useTranslation(NAME_SPACE);
  const { close, name, fieldValue, fragmentValue, showFragmentFilters, onTokenClick, indexInfo, showExistsAction, relatedLinks, start, end, rawValue, fieldConfig } = props;

  return (
    <ul className='ant-dropdown-menu ant-dropdown-menu-root ant-dropdown-menu-vertical ant-dropdown-menu-light'>
      <li
        className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
        onClick={() => {
          close();
          copy2ClipBoard(`${name}:${fieldValue}`);
        }}
      >
        <Space>
          <CopyOutlined />
          {t('common:btn.copy')}
        </Space>
      </li>
      <li
        className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
        onClick={() => {
          close();
          copy2ClipBoard(fieldValue);
        }}
      >
        <Space>
          <CopyOutlined />
          {t('logs.copy_field_value')}
        </Space>
      </li>
      {onTokenClick && (
        <>
          {indexInfo.isIndex && (
            <>
              {showFragmentFilters && (
                <>
                  <li
                    className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
                    onClick={() => {
                      close();
                      onTokenClick?.({
                        key: name,
                        value: fragmentValue,
                        assignmentOperator: ':',
                        operator: 'AND',
                        indexName: indexInfo.indexName,
                      });
                    }}
                  >
                    <Space>
                      <PlusCircleOutlined />
                      {t('logs.filterAnd', {
                        token: toString(fragmentValue),
                      })}
                    </Space>
                  </li>
                  <li
                    className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
                    onClick={() => {
                      close();
                      onTokenClick?.({
                        key: name,
                        value: fragmentValue,
                        assignmentOperator: ':',
                        operator: 'NOT',
                        indexName: indexInfo.indexName,
                      });
                    }}
                  >
                    <Space>
                      <MinusCircleOutlined />
                      {t('logs.filterNot', {
                        token: toString(fragmentValue),
                      })}
                    </Space>
                  </li>
                </>
              )}
              <li
                className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
                onClick={() => {
                  close();
                  onTokenClick?.({
                    key: name,
                    value: fieldValue,
                    assignmentOperator: '=',
                    operator: 'AND',
                    indexName: indexInfo.indexName,
                  });
                }}
              >
                <Space>
                  <PlusCircleOutlined />
                  {t('logs.filterAllAnd')}
                </Space>
              </li>
              <li
                className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
                onClick={() => {
                  close();
                  onTokenClick?.({
                    key: name,
                    value: fieldValue,
                    assignmentOperator: '=',
                    operator: 'NOT',
                    indexName: indexInfo.indexName,
                  });
                }}
              >
                <Space>
                  <MinusCircleOutlined />
                  {t('logs.filterAllNot')}
                </Space>
              </li>
              {showExistsAction && (
                <li
                  className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
                  onClick={() => {
                    close();
                    onTokenClick?.({
                      key: name,
                      value: fieldValue,
                      assignmentOperator: '=',
                      operator: 'EXISTS',
                      indexName: indexInfo.indexName,
                    });
                  }}
                >
                  <Space>
                    <ExistsIcon />
                    {t('logs.filterExists')}
                  </Space>
                </li>
              )}
            </>
          )}

          {relatedLinks && relatedLinks.length > 0 && <li className='ant-dropdown-menu-item-divider'></li>}
          {relatedLinks?.map((i, idx) => {
            return (
              <li
                key={`${i.name}-${idx}`}
                className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
                style={{ textDecoration: 'underline' }}
                onClick={() => {
                  const valueObjected = Object.entries(rawValue || {}).reduce<Record<string, unknown>>((acc, [key, val]) => {
                    if (typeof val === 'string') {
                      try {
                        acc[key] = JSON.parse(val);
                      } catch (e) {
                        acc[key] = val;
                      }
                    } else {
                      acc[key] = val;
                    }
                    return acc;
                  }, {});

                  handleNav(i.urlTemplate, valueObjected, { start, end }, fieldConfig?.regExtractArr, fieldConfig?.mappingParamsArr);
                }}
              >
                {i.name}
                <span style={{ background: 'var(--fc-fill-4)', marginLeft: 6, display: 'inline-flex', padding: 3, borderRadius: 2 }}>
                  <IconFont type='icon-ic_arrow_right' style={{ color: 'var(--fc-fill-primary)', height: 12 }} />
                </span>
              </li>
            );
          })}
        </>
      )}
    </ul>
  );
}

export default function Token(props: Props) {
  const { indexData } = useContext(LogsViewerStateContext);
  return <TokenWithContext {...props} indexData={indexData || []} />;
}

function isNodeInside(root: HTMLElement, node: Node | null): boolean {
  if (!node) return false;
  const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);
  if (!el) return false;
  return root.contains(el);
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

  // ES 数据源的自定义格式化
  let displayValue = toString(value);
  const fieldAttr = fieldConfig?.arr?.find((i) => i.field === name);
  if (fieldAttr?.formatMap?.type === 'date' && fieldAttr?.formatMap?.params?.pattern) {
    displayValue = moment(fieldValue).format(fieldAttr?.formatMap?.params?.pattern);
  }
  if (fieldAttr?.formatMap?.type === 'url' && fieldAttr?.formatMap?.params?.urlTemplate) {
    displayValue = fieldAttr?.formatMap?.params?.labelTemplate.replace('{{value}}', fieldValue);
  }

  const topLevelHighlightKey = highlightKey.split('.')[0];
  const highlightSource = highlight?.[highlightKey] || (topLevelHighlightKey !== highlightKey ? highlight?.[topLevelHighlightKey] : undefined);
  const tokenHighlights = getTokenHighlights(fieldValue, highlightSource, tokenStart, tokenEnd);

  const adjustedValue = adjustFieldValue ? (
    adjustFieldValue(displayValue, tokenHighlights)
  ) : tokenHighlights ? (
    <span dangerouslySetInnerHTML={{ __html: purify.sanitize(getHighlightHtml(displayValue, tokenHighlights)) }} />
  ) : (
    renderFieldValue(displayValue)
  );

  const closePopover = useCallback(() => {
    setPopoverVisible(false);
  }, []);

  const getPopupContainer = useCallback((triggerNode?: HTMLElement) => {
    const host = triggerNode || hostRef.current;
    return host?.closest(`.${LOG_VIEWER_IGNORE_CLICK_AWAY_CLASS}`) || host?.closest('.ant-drawer-content') || document.body;
  }, []);

  const handleTextSelectMouseUp = useCallback(() => {
    const host = hostRef.current;
    const root = rootRef.current;
    if (!host || !root) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      setPopoverVisible(false);
      return;
    }
    const range = sel.getRangeAt(0);
    if (range.collapsed) {
      setPopoverVisible(false);
      return;
    }
    const text = sel.toString();
    if (!text.trim()) {
      setPopoverVisible(false);
      return;
    }
    if (!root.contains(range.commonAncestorContainer)) {
      setPopoverVisible(false);
      return;
    }
    if (!isNodeInside(root, sel.anchorNode) || !isNodeInside(root, sel.focusNode)) {
      setPopoverVisible(false);
      return;
    }
    const rect = range.getBoundingClientRect();
    const hostRect = host.getBoundingClientRect();
    setAnchorRect({
      left: rect.left - hostRect.left,
      top: rect.bottom - hostRect.top,
    });
    setSelectedFragment(text);
    setPopoverVisible(true);
  }, []);

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
        <span ref={rootRef} className={`inline min-w-0 max-w-full break-all select-text ${fieldValueClassName ?? ''}`} onMouseUp={handleTextSelectMouseUp}>
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
