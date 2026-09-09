import React, { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';
import _ from 'lodash';
import moment from 'moment';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Tooltip, Empty, Space } from 'antd';
import { CaretDownOutlined, CaretRightOutlined, CaretUpOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Virtuoso } from 'react-virtuoso';
import { useClickAway } from 'ahooks';

import NavigableDrawer from '@/components/NavigableDrawer';

import { NAME_SPACE } from '../../constants';
import { OnValueFilterParams, FieldValueType } from './types';
import LogViewer from './components/LogViewer';
import TextSearchIcon from './components/TextSearchIcon';
import LogFieldValue from './components/LogFieldValue';
import { LogsViewerStateContext } from './index';
import { shouldRenderMultilineValueAsSingleField } from './renderValue';
import { shouldIgnoreLogViewerClickAway } from './utils/clickAway';

const explorerOriginInlineCellClassName = 'inline-block mr-1 my-[2px] align-top';
const explorerOriginBreakCellClassName = 'break-all block mr-1 my-[2px]';
const explorerOriginFieldKeyClassName = 'bg-fc-300 rounded-sm text-hint inline-flex text-[12px] py-[1px] px-[3px]';
const explorerOriginFieldValClassName = 'inline text-main m-0 p-0 cursor-pointer';
const explorerOriginUlClassName = 'border-0 list-none bg-transparent p-0 m-0';
const explorerOriginLiClassName = 'relative ml-0 pl-0 ';

/** 无高亮时的稳定空对象引用，避免每次渲染新建 {} 打穿 RawCell 的 memo */
const EMPTY_HIGHLIGHT: { [key: string]: string[] } = {};

/**
 * 将行内提示层挂到虚拟列表的滚动容器中，使其随滚动区域裁剪。
 * 否则 Tooltip 默认渲染到 body，行仅剩一小部分可见时提示仍会溢出表格边界。
 */
function getRawRowTooltipContainer(triggerNode: HTMLElement) {
  return triggerNode.closest<HTMLElement>('.n9e-log-explorer-virtuoso-scroller') ?? document.body;
}

interface Props {
  /** 时间字段 */
  timeField?: string;
  /** 日志数据 */
  data: {
    [index: string]: any;
  }[];
  highlights?: {
    [key: string]: string[];
  }[];
  logsHash?: string;
  /** 日志格式配置项 */
  options: any;
  /** 过滤每行日志的字段，返回需要显示的字段数组 */
  filterFields?: (fieldKeys: string[]) => string[];
  /** 组织字段。参与 memo 比较：内联 filterFields 引用变化不可靠，需用 organizeFields 驱动展示刷新 */
  organizeFields?: string[];
  /** 字段下钻、格式化相关配置（影响时间列/字段值展示，按引用参与 memo 比较） */
  fieldConfig?: any;
  /** 每行日志前面的额外内容 */
  rowPrefixRender?: (record: { [index: string]: any }) => React.ReactNode;
  /** 过滤每行日志的字段，返回需要显示的字段数组 */
  onValueFilter?: (parmas: OnValueFilterParams) => void;
  /** 排序反转回调 */
  onReverseChange: (reverse: boolean) => void;
  timeColumnWidth?: number;
  timeFieldColumnFormat?: (timeFieldValue: string | number) => React.ReactNode;
  linesColumnFormat?: (linesValue: number) => React.ReactNode;
  id_key: string;
  raw_key: string;
  logViewerExtraRender?: (log: { [index: string]: any }) => React.ReactNode;
  logViewerFilterFields?: (log: Record<string, any>) => string[];
  logViewerRenderCustomTagsArea?: (log: Record<string, any>) => React.ReactNode;
  adjustFieldValue?: (formatedValue: FieldValueType, highlightValue?: string[]) => React.ReactNode;
  showExistsAction?: boolean;
  customLogFieldRender?: (
    key: string,
    value: any,
    context: {
      rawValue: Record<string, any>;
      highlight?: { [index: string]: string[] };
      renderScene?: 'raw' | 'logViewer';
      onValueFilter?: (parmas: OnValueFilterParams) => void;
    },
  ) => React.ReactNode | false;
  hideTypeIcon?: boolean;
}

interface RenderValueProps {
  name: string;
  value: FieldValueType;
  parentKey?: string;
  onValueFilter?: Props['onValueFilter'];
  adjustFieldValue?: (formatedValue: FieldValueType, highlightValue?: string[]) => React.ReactNode;
  showExistsAction?: boolean;
}

export const RenderValue = React.memo(function RenderValue({ name, value, parentKey, onValueFilter, adjustFieldValue, showExistsAction }: RenderValueProps) {
  const { t } = useTranslation(NAME_SPACE);
  const { rawValue, highlight } = useContext(DataContext);
  const { enableLogTextSelectMenu } = useContext(LogsViewerStateContext);

  const [expand, setExpand] = useState(false);

  // 划词菜单依赖字段值对应唯一的 LogFieldValue 实例。若按换行拆分，
  // 每一行都会收到同一次 document mouseup，从而重复弹出菜单。
  if (shouldRenderMultilineValueAsSingleField(enableLogTextSelectMenu, value)) {
    return (
      <LogFieldValue
        parentKey={parentKey}
        name={name}
        value={value}
        onTokenClick={onValueFilter}
        rawValue={rawValue}
        highlight={highlight}
        fieldValueClassName='whitespace-pre-wrap'
        adjustFieldValue={adjustFieldValue}
        showExistsAction={showExistsAction}
      />
    );
  }

  if (typeof value === 'string' && value.indexOf('\n') > -1) {
    const allLines = value.split('\n');
    const LINE_LIMIT = 18;
    const exceedsLimit = allLines.length > LINE_LIMIT;
    const lines = !expand && exceedsLimit ? _.slice(allLines, 0, LINE_LIMIT) : allLines;
    return (
      <div className='inline text-main m-0 p-0'>
        {_.map(lines, (v, idx) => {
          const isLastLine = idx === lines.length - 1;
          return (
            <div key={idx}>
              <LogFieldValue
                parentKey={parentKey}
                name={name}
                value={v}
                onTokenClick={onValueFilter}
                rawValue={rawValue}
                highlight={highlight}
                adjustFieldValue={adjustFieldValue}
                showExistsAction={showExistsAction}
              />
              {isLastLine && exceedsLimit && (
                <a
                  onClick={() => {
                    setExpand(!expand);
                  }}
                  className='ml-2'
                >
                  <Space size={2}>
                    {expand ? t('logs.collapse') : t('logs.expand')}
                    {expand ? <LeftOutlined /> : <RightOutlined />}
                  </Space>
                </a>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <LogFieldValue
      parentKey={parentKey}
      name={name}
      value={value}
      onTokenClick={onValueFilter}
      rawValue={rawValue}
      highlight={highlight}
      adjustFieldValue={adjustFieldValue}
      showExistsAction={showExistsAction}
    />
  );
});

function RenderSubJSON({
  parentKey,
  label,
  subJSON,
  options,
  currentExpandLevel,
  onValueFilter,
  adjustFieldValue,
  showExistsAction,
}: {
  parentKey?: string;
  label: string;
  subJSON: any;
  options: any;
  currentExpandLevel: number;
  onValueFilter?: Props['onValueFilter'];
  adjustFieldValue?: Props['adjustFieldValue'];
  showExistsAction?: Props['showExistsAction'];
}) {
  const [expand, setExpand] = useState(currentExpandLevel <= options.jsonExpandLevel);

  useEffect(() => {
    setExpand(currentExpandLevel <= options.jsonExpandLevel);
  }, [options.jsonExpandLevel]);

  if (options.jsonDisplaType === 'tree') {
    return (
      <li className={explorerOriginLiClassName}>
        <div className='flex items-center gap-2'>
          <div
            onClick={() => {
              setExpand(!expand);
            }}
            className='cursor-pointer'
          >
            {expand ? <CaretDownOutlined className='text-link' /> : <CaretRightOutlined className='text-link' />}
            <span className={`${explorerOriginFieldKeyClassName} ml-[2px]`}>{label}</span>
          </div>
          <div className='text-link'>{_.isArray(subJSON) ? '[]' : '{}'}</div>
        </div>
        {expand && (
          <ul className='list-none pl-[30px]'>
            {_.map(subJSON, (v, k) => {
              if (_.isPlainObject(v) || _.isArray(v)) {
                return (
                  <ul className={explorerOriginUlClassName}>
                    {_.isEmpty(v) ? (
                      <>
                        <div className={explorerOriginFieldKeyClassName}>{k}</div>:<div className={explorerOriginFieldValClassName}>{`[]`}</div>
                      </>
                    ) : (
                      _.map(_.isArray(v) ? v : [v], (item, idx) => {
                        if (_.isPlainObject(item) || _.isArray(item)) {
                          return (
                            <RenderSubJSON
                              key={idx}
                              parentKey={parentKey ? parentKey + '.' + k : k}
                              label={_.isArray(v) ? `${k}[${idx}]` : k}
                              subJSON={item}
                              options={options}
                              currentExpandLevel={currentExpandLevel + 1}
                              onValueFilter={onValueFilter}
                              adjustFieldValue={adjustFieldValue}
                              showExistsAction={showExistsAction}
                            />
                          );
                        }
                        return (
                          <li key={idx}>
                            <div className={explorerOriginFieldKeyClassName}>{_.isArray(v) ? `${k}[${idx}]` : k}</div>:
                            <RenderValue
                              parentKey={parentKey ? parentKey + '.' + k : k}
                              name={_.isArray(v) ? `${k}[${idx}]` : k}
                              value={item}
                              onValueFilter={onValueFilter}
                              adjustFieldValue={adjustFieldValue}
                              showExistsAction={showExistsAction}
                            />
                          </li>
                        );
                      })
                    )}
                  </ul>
                );
              }
              return (
                <li key={k}>
                  <div className={explorerOriginFieldKeyClassName}>{k}</div>:
                  <RenderValue
                    parentKey={parentKey ? parentKey + '.' + k : k}
                    name={k}
                    value={v}
                    onValueFilter={onValueFilter}
                    adjustFieldValue={adjustFieldValue}
                    showExistsAction={showExistsAction}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  }

  // 默认为 jsonDisplaType: string 格式渲染
  return (
    <li className={explorerOriginLiClassName}>
      <div className={explorerOriginFieldKeyClassName}>{label}</div>:
      <div className={explorerOriginFieldValClassName}>
        <RenderValue name={label} value={JSON.stringify(subJSON)} onValueFilter={onValueFilter} adjustFieldValue={adjustFieldValue} showExistsAction={showExistsAction} />
      </div>
    </li>
  );
}

export const DataContext = React.createContext<{
  rawValue: { [index: string]: any };
  highlight: {
    [key: string]: string[];
  };
}>({
  rawValue: {},
  highlight: {},
});

/**
 * 稳定化 DataContext 的 value：rawValue/highlight 引用不变时 Provider 不重建，
 * 避免 Raw 重渲（如抽屉开关）时所有 Token 消费者跟着重渲。
 */
const RawCellDataContextProvider = React.memo(function RawCellDataContextProvider({
  rawValue,
  highlight,
  children,
}: {
  rawValue: { [index: string]: any };
  highlight: { [key: string]: string[] };
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ rawValue, highlight }), [rawValue, highlight]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
});

interface RawCellProps {
  item: { [index: string]: any };
  highlight: { [key: string]: string[] };
  options: any;
  organizeFields?: string[];
  filterFields?: (fieldKeys: string[]) => string[];
  rowPrefixRender?: (record: { [index: string]: any }) => React.ReactNode;
  onValueFilter?: (parmas: OnValueFilterParams) => void;
  adjustFieldValue?: (formatedValue: FieldValueType, highlightValue?: string[]) => React.ReactNode;
  showExistsAction?: boolean;
  customLogFieldRender?: Props['customLogFieldRender'];
}

/**
 * 单行单元格内容（P0-3）。
 * memo 比较仅针对数据类 props；函数类 props 不参与比较（其语义由 organizeFields/options 驱动，
 * 且 organizeFields 变化会通过 Raw 的 memo 比较触发重渲），避免插件内联函数引用变化打穿 memo。
 */
const RawCell = React.memo(
  function RawCell(props: RawCellProps) {
    const { item, highlight, options, filterFields, rowPrefixRender, onValueFilter, adjustFieldValue, showExistsAction, customLogFieldRender } = props;
    const fields = filterFields ? filterFields(_.keys(item)) : _.keys(item);

    return (
      <div className='w-full'>
        {rowPrefixRender && <>{rowPrefixRender(item)}</>}
        {_.map(fields, (key) => {
          const val = item[key];
          const valToObj = val;
          const subJSON = _.isArray(valToObj) ? valToObj : [valToObj];

          const result = customLogFieldRender
            ? customLogFieldRender(key, val, {
                rawValue: item,
                highlight,
                renderScene: 'raw',
                onValueFilter,
              })
            : false;

          if (result !== false) {
            return result;
          }

          return (
            <RawCellDataContextProvider rawValue={item} highlight={highlight} key={key}>
              <div
                className={classNames({
                  [explorerOriginInlineCellClassName]: options.lineBreak !== 'true',
                  [explorerOriginBreakCellClassName]: options.lineBreak === 'true',
                })}
              >
                {_.isPlainObject(valToObj) || (_.isArray(valToObj) && options?.jsonDisplaType === 'tree') ? (
                  <ul className={explorerOriginUlClassName}>
                    {_.isEmpty(subJSON) ? (
                      <>
                        <div className={explorerOriginFieldKeyClassName}>{key}</div>: <div className={explorerOriginFieldValClassName}>{`[]`}</div>
                      </>
                    ) : (
                      _.map(subJSON, (item, idx) => {
                        return (
                          <RenderSubJSON
                            key={idx}
                            parentKey={key}
                            label={_.isArray(valToObj) ? `${key}[${idx}]` : key}
                            subJSON={item}
                            options={options}
                            currentExpandLevel={1}
                            onValueFilter={onValueFilter}
                            adjustFieldValue={adjustFieldValue}
                            showExistsAction={showExistsAction}
                          />
                        );
                      })
                    )}
                  </ul>
                ) : _.isArray(valToObj) ? (
                  <>
                    <div className={explorerOriginFieldKeyClassName}>{key}</div>:{' '}
                    <RenderValue name={key} value={JSON.stringify(val)} onValueFilter={onValueFilter} adjustFieldValue={adjustFieldValue} showExistsAction={showExistsAction} />
                  </>
                ) : (
                  <>
                    <div className={explorerOriginFieldKeyClassName}>{key}</div>:{' '}
                    <RenderValue name={key} value={val} onValueFilter={onValueFilter} adjustFieldValue={adjustFieldValue} showExistsAction={showExistsAction} />
                  </>
                )}
              </div>
            </RawCellDataContextProvider>
          );
        })}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item === nextProps.item &&
      prevProps.highlight === nextProps.highlight &&
      prevProps.options === nextProps.options &&
      prevProps.organizeFields === nextProps.organizeFields &&
      prevProps.showExistsAction === nextProps.showExistsAction
    );
  },
);

interface RawHeaderProps {
  showLines: boolean;
  showTime: boolean;
  timeColumnWidth: number;
  sortOrder: 'ascend' | 'descend';
  onToggleSort: () => void;
}

/**
 * P1-2: Origin 模式自定义表头（替代 antd Table 的 thead）。
 * 复用 antd 的 thead/th/sorter 类名以获得一致的表头样式；时间列排序为本地状态切换，回调仍走 onReverseChange。
 */
const RawHeader = React.memo(function RawHeader({ showLines, showTime, timeColumnWidth, sortOrder, onToggleSort }: RawHeaderProps) {
  const { t } = useTranslation(NAME_SPACE);
  return (
    <div className='n9e-log-explorer-raw-header flex-shrink-0 overflow-hidden'>
      <table className='w-full' style={{ tableLayout: 'fixed' }}>
        <thead className='ant-table-thead'>
          <tr>
            <th className='ant-table-row-expand-icon-cell' style={{ width: 48 }} />
            {showLines && <th style={{ width: 50 }}>{t('logs.settings.lines')}</th>}
            {showTime && (
              <th className='ant-table-column-sort ant-table-column-has-sorters cursor-pointer select-none' style={{ width: timeColumnWidth }} onClick={onToggleSort}>
                <span className='ant-table-column-sorters'>
                  <span className='ant-table-column-title'>{t('logs.settings.time')}</span>
                  <span className='ant-table-column-sorter'>
                    <span className='ant-table-column-sorter-inner'>
                      <span className={`ant-table-column-sorter-up ${sortOrder === 'ascend' ? 'active' : ''}`}>
                        <CaretUpOutlined />
                      </span>
                      <span className={`ant-table-column-sorter-down ${sortOrder === 'descend' ? 'active' : ''}`}>
                        <CaretDownOutlined />
                      </span>
                    </span>
                  </span>
                </span>
              </th>
            )}
            <th>{t('logs.title')}</th>
          </tr>
        </thead>
      </table>
    </div>
  );
});

interface RawRowProps {
  item: { [index: string]: any };
  highlight: { [key: string]: string[] };
  index: number;
  options: any;
  organizeFields?: string[];
  filterFields?: (fieldKeys: string[]) => string[];
  rowPrefixRender?: (record: { [index: string]: any }) => React.ReactNode;
  onValueFilter?: (parmas: OnValueFilterParams) => void;
  adjustFieldValue?: (formatedValue: FieldValueType, highlightValue?: string[]) => React.ReactNode;
  showExistsAction?: boolean;
  customLogFieldRender?: Props['customLogFieldRender'];
  timeField?: string;
  timeColumnWidth: number;
  timeFieldColumnFormat?: (timeFieldValue: string | number) => React.ReactNode;
  linesColumnFormat?: (linesValue: number) => React.ReactNode;
  showTime: boolean;
  showLines: boolean;
  onOpenDrawer: (index: number) => void;
}

/**
 * P1-2: Origin 模式虚拟列表的单行（替代 antd Table 的 <tr> 与各列 render）。
 * memo 只比较数据类 props；函数类 props（filterFields/customLogFieldRender 等）不参与比较，
 * 其展示语义由 organizeFields/options 驱动（与 RawCell 的 memo 策略一致）。
 */
const RawRow = React.memo(
  function RawRow(props: RawRowProps) {
    const { t } = useTranslation(NAME_SPACE);
    const {
      item,
      highlight,
      index,
      options,
      organizeFields,
      filterFields,
      rowPrefixRender,
      onValueFilter,
      adjustFieldValue,
      showExistsAction,
      customLogFieldRender,
      timeField,
      timeColumnWidth,
      timeFieldColumnFormat,
      linesColumnFormat,
      showTime,
      showLines,
      onOpenDrawer,
    } = props;

    return (
      <div className='n9e-log-explorer-raw-row flex items-stretch w-full'>
        <div className='ant-table-row-expand-icon-cell' style={{ width: 48, flex: '0 0 48px' }}>
          <Tooltip title={t('log_viewer_drawer_trigger_tip')} getPopupContainer={getRawRowTooltipContainer}>
            <div
              className='absolute inset-0 flex items-center justify-center cursor-pointer'
              onClick={() => {
                onOpenDrawer(index);
              }}
            >
              <TextSearchIcon className='text-[14px]' />
            </div>
          </Tooltip>
        </div>
        {showLines && (
          <div
            className='relative flex items-center cursor-pointer'
            style={{ width: 50, flex: '0 0 50px' }}
            onClick={() => {
              onOpenDrawer(index);
            }}
          >
            <Tooltip title={t('log_viewer_drawer_trigger_tip')} getPopupContainer={getRawRowTooltipContainer}>
              <div className='absolute inset-0 flex items-center'>{linesColumnFormat ? linesColumnFormat(index + 1) : index + 1}</div>
            </Tooltip>
          </div>
        )}
        {showTime && timeField && (
          <div
            className='relative flex items-center cursor-pointer'
            style={{ width: timeColumnWidth, flex: `0 0 ${timeColumnWidth}px` }}
            onClick={() => {
              onOpenDrawer(index);
            }}
          >
            <Tooltip title={t('log_viewer_drawer_trigger_tip')} getPopupContainer={getRawRowTooltipContainer}>
              <div className='absolute inset-0 flex items-center px-2'>
                {timeFieldColumnFormat ? timeFieldColumnFormat(item[timeField]) : moment(item[timeField]).format('MM-DD HH:mm:ss.SSS')}
              </div>
            </Tooltip>
          </div>
        )}
        <div className='flex-1 min-w-0 px-2 py-2'>
          <RawCell
            item={item}
            highlight={highlight}
            options={options}
            organizeFields={organizeFields}
            filterFields={filterFields}
            rowPrefixRender={rowPrefixRender}
            onValueFilter={onValueFilter}
            adjustFieldValue={adjustFieldValue}
            showExistsAction={showExistsAction}
            customLogFieldRender={customLogFieldRender}
          />
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item === nextProps.item &&
      prevProps.highlight === nextProps.highlight &&
      prevProps.index === nextProps.index &&
      prevProps.options === nextProps.options &&
      prevProps.organizeFields === nextProps.organizeFields &&
      prevProps.showExistsAction === nextProps.showExistsAction &&
      prevProps.showTime === nextProps.showTime &&
      prevProps.showLines === nextProps.showLines &&
      prevProps.timeColumnWidth === nextProps.timeColumnWidth &&
      prevProps.timeField === nextProps.timeField &&
      prevProps.onOpenDrawer === nextProps.onOpenDrawer
    );
  },
);

function Raw(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const {
    timeField,
    data,
    highlights,
    logsHash,
    options,
    onValueFilter,
    onReverseChange,
    rowPrefixRender,
    filterFields,
    organizeFields,
    timeColumnWidth = 140,
    timeFieldColumnFormat,
    linesColumnFormat,
    id_key,
    raw_key,
    logViewerExtraRender,
    logViewerFilterFields,
    logViewerRenderCustomTagsArea,
    adjustFieldValue,
    showExistsAction,
    customLogFieldRender,
    hideTypeIcon,
  } = props;
  const [logViewerDrawerState, setLogViewerDrawerState] = useState<{ visible: boolean; currentIndex: number }>({ visible: false, currentIndex: -1 });
  // P1-2: 时间列排序方向。对齐原 antd Table（defaultSortOrder: 'descend'，sortDirections 在升/降之间循环）
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>('descend');
  const showTime = !!timeField && options.time === 'true';
  const showLines = options.lines === 'true';

  const openLogViewer = useCallback((index: number) => {
    setLogViewerDrawerState({ visible: true, currentIndex: index });
  }, []);

  const handleToggleSort = useCallback(() => {
    setSortOrder((prev) => {
      const next = prev === 'ascend' ? 'descend' : 'ascend';
      // 与原 onChange 逻辑一致：非 ascend 即 reverse
      onReverseChange(next !== 'ascend');
      return next;
    });
  }, [onReverseChange]);

  const computeRowKey = useCallback(
    (index: number) => {
      return data[index]?.[id_key] ?? index;
    },
    [data, id_key],
  );

  const navigableDrawerTitle = useMemo(() => {
    if (timeField) {
      const logItem = data[logViewerDrawerState.currentIndex];
      if (logItem && logItem[timeField]) {
        return timeFieldColumnFormat ? timeFieldColumnFormat(logItem[timeField]) : moment(logItem[timeField]).format('MM-DD HH:mm:ss.SSS');
      }
    }
    return t('log_viewer_drawer_title');
  }, [logsHash, timeField, logViewerDrawerState]);

  const drawerRef = useRef<HTMLDivElement>(null);

  useClickAway(
    (event) => {
      // 忽略点击发生在 ignore-click-away 内的情况
      // 还需要结合阻止事件冒泡一起使用
      const target = (event && (event as Event).target) as HTMLElement | null;
      if (shouldIgnoreLogViewerClickAway(target)) {
        return;
      }
      // 只有当 Drawer 打开时才尝试关闭
      if (logViewerDrawerState.currentIndex > -1) {
        setLogViewerDrawerState({ visible: false, currentIndex: -1 });
      }
    },
    [drawerRef],
    ['click'],
  );

  return (
    <div className='min-h-0 h-full' ref={drawerRef}>
      <div className='n9e-event-logs-table n9e-log-explorer-raw-table h-full min-h-0 flex flex-col'>
        <RawHeader showLines={showLines} showTime={showTime} timeColumnWidth={timeColumnWidth} sortOrder={sortOrder} onToggleSort={handleToggleSort} />
        {/* Virtuoso 默认 scroller 内联 height:100%，用 flex-1 包装层提供确定高度 */}
        <div className='flex-1 min-h-0'>
          <Virtuoso
            className='ant-table-body n9e-log-explorer-virtuoso-scroller'
            totalCount={data.length}
            computeItemKey={computeRowKey}
            overscan={400}
            itemContent={(index) => {
              const item = data[index];
              if (item == null) return null;
              const highlight = highlights?.[index] ?? EMPTY_HIGHLIGHT;
              return (
                <RawRow
                  item={item}
                  highlight={highlight}
                  index={index}
                  options={options}
                  organizeFields={organizeFields}
                  filterFields={filterFields}
                  rowPrefixRender={rowPrefixRender}
                  onValueFilter={onValueFilter}
                  adjustFieldValue={adjustFieldValue}
                  showExistsAction={showExistsAction}
                  customLogFieldRender={customLogFieldRender}
                  timeField={timeField}
                  timeColumnWidth={timeColumnWidth}
                  timeFieldColumnFormat={timeFieldColumnFormat}
                  linesColumnFormat={linesColumnFormat}
                  showTime={showTime}
                  showLines={showLines}
                  onOpenDrawer={openLogViewer}
                />
              );
            }}
            components={{
              EmptyPlaceholder: () => (
                <div className='flex items-center justify-center py-8'>
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
              ),
            }}
          />
        </div>
      </div>
      <NavigableDrawer
        className='log-explorer-ignore-click-away'
        title={navigableDrawerTitle}
        extra={logViewerExtraRender && logViewerExtraRender(data[logViewerDrawerState.currentIndex])}
        placement='right'
        onClose={() => {
          setLogViewerDrawerState({ visible: false, currentIndex: -1 });
        }}
        hasPrev={logViewerDrawerState.currentIndex > 0}
        hasNext={logViewerDrawerState.currentIndex !== -1 && logViewerDrawerState.currentIndex < data.length - 1}
        onPrev={() => {
          setLogViewerDrawerState({ visible: true, currentIndex: logViewerDrawerState.currentIndex - 1 });
        }}
        onNext={() => {
          setLogViewerDrawerState({ visible: true, currentIndex: logViewerDrawerState.currentIndex + 1 });
        }}
        visible={logViewerDrawerState.visible}
        destroyOnClose
      >
        {logViewerDrawerState.currentIndex > -1 ? (
          <LogViewer
            id_key={id_key}
            raw_key={raw_key}
            value={data[logViewerDrawerState.currentIndex]}
            highlight={highlights?.[logViewerDrawerState.currentIndex]}
            onValueFilter={(params) => {
              onValueFilter?.(params);
              setLogViewerDrawerState({ visible: false, currentIndex: -1 });
            }}
            logViewerFilterFields={logViewerFilterFields}
            logViewerRenderCustomTagsArea={logViewerRenderCustomTagsArea}
            customLogFieldRender={customLogFieldRender}
            hideTypeIcon={hideTypeIcon}
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </NavigableDrawer>
    </div>
  );
}

export default React.memo(Raw, (prevProps, nextProps) => {
  // P0-1: 只比较与渲染强相关的数据 prop。函数类 props（filterFields/customLogFieldRender 等）
  // 多为插件内联箭头函数，引用每次变化，参与比较会恒为 false 打穿 memo。
  // organizeFields 变化会影响字段过滤展示，必须参与比较；fieldConfig 异步加载后会影响时间列格式化，按引用比较。
  const pickKeys = ['logsHash', 'options', 'timeField', 'organizeFields'];
  return prevProps.fieldConfig === nextProps.fieldConfig && _.isEqual(_.pick(prevProps, pickKeys), _.pick(nextProps, pickKeys));
});
