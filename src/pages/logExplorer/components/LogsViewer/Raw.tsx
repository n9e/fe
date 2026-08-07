import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import _ from 'lodash';
import moment from 'moment';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Table, Tooltip, Empty, Space } from 'antd';
import { CaretDownOutlined, CaretRightOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useClickAway } from 'ahooks';

import NavigableDrawer from '@/components/NavigableDrawer';

import { NAME_SPACE } from '../../constants';
import { OnValueFilterParams, FieldValueType } from './types';
import LogViewer from './components/LogViewer';
import TextSearchIcon from './components/TextSearchIcon';
import LogFieldValue from './components/LogFieldValue';
import { shouldIgnoreLogViewerClickAway } from './utils/clickAway';

const explorerOriginInlineCellClassName = 'inline-block mr-1 my-[2px] align-top';
const explorerOriginBreakCellClassName = 'break-all block mr-1 my-[2px]';
const explorerOriginFieldKeyClassName = 'bg-fc-300 rounded-sm text-hint inline-flex text-[12px] py-[1px] px-[3px]';
const explorerOriginFieldValClassName = 'inline text-main m-0 p-0 cursor-pointer';
const explorerOriginUlClassName = 'border-0 list-none bg-transparent p-0 m-0';
const explorerOriginLiClassName = 'relative ml-0 pl-0 ';

/** 无高亮时的稳定空对象引用，避免每次渲染新建 {} 打穿 RawCell 的 memo */
const EMPTY_HIGHLIGHT: { [key: string]: string[] } = {};

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

  const [expand, setExpand] = useState(false);

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
  // P0-3: columns 用 useMemo，避免 Raw 无关重渲（如抽屉开关）时重建巨型 render 闭包
  const columns = useMemo(() => {
    const cols: any[] = [
      {
        title: t('logs.title'),
        render: (item, _record, index) => {
          const highlight = highlights?.[index] ?? EMPTY_HIGHLIGHT;
          return (
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
          );
        },
      },
    ];

    if (timeField && options.time === 'true') {
      cols.unshift({
        title: t('logs.settings.time'),
        width: timeColumnWidth,
        dataIndex: timeField,
        key: 'time',
        render: (val, record, index) => {
          return (
            <Tooltip title={t('log_viewer_drawer_trigger_tip')}>
              <div
                className='absolute inset-0 flex items-center cursor-pointer'
                onClick={() => {
                  setLogViewerDrawerState({ visible: true, currentIndex: index });
                }}
              >
                {timeFieldColumnFormat ? timeFieldColumnFormat(val) : moment(val).format('MM-DD HH:mm:ss.SSS')}
              </div>
            </Tooltip>
          );
        },
        defaultSortOrder: 'descend',
        sortDirections: ['ascend', 'descend', 'ascend'],
        sorter: true,
      });
    }
    if (options.lines === 'true') {
      cols.unshift({
        title: t('logs.settings.lines'),
        width: 50,
        render: (record, _row, index) => {
          return (
            <Tooltip title={t('log_viewer_drawer_trigger_tip')}>
              <div
                className='absolute inset-0 flex items-center cursor-pointer'
                onClick={() => {
                  setLogViewerDrawerState({ visible: true, currentIndex: index });
                }}
              >
                {linesColumnFormat ? linesColumnFormat(index + 1) : index + 1}
              </div>
            </Tooltip>
          );
        },
        onCell: () => ({
          style: { padding: 0, position: 'relative' },
        }),
      });
    }
    return cols;
  }, [
    t,
    timeField,
    options,
    timeColumnWidth,
    timeFieldColumnFormat,
    linesColumnFormat,
    highlights,
    filterFields,
    rowPrefixRender,
    onValueFilter,
    organizeFields,
    adjustFieldValue,
    showExistsAction,
    customLogFieldRender,
  ]);

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
      <Table
        className='n9e-event-logs-table n9e-log-explorer-raw-table'
        rowKey={id_key}
        size='small'
        pagination={false}
        expandable={{
          expandedRowRender: () => {
            return null;
          },
          expandIcon: ({ expanded, onExpand, record }) => {
            return (
              <Tooltip title={t('log_viewer_drawer_trigger_tip')}>
                <div
                  className='absolute inset-0 flex items-center justify-center cursor-pointer'
                  onClick={() => {
                    const index = _.findIndex(data, (d) => d[id_key] === record[id_key]);
                    setLogViewerDrawerState({ visible: true, currentIndex: index });
                  }}
                >
                  <TextSearchIcon className='text-[14px]' />
                </div>
              </Tooltip>
            );
          },
          columnWidth: 48,
          fixed: 'left',
        }}
        scroll={{ y: 'calc(100% - 40px)' }}
        onChange={(pagination, filters, sorter: any, extra) => {
          if (sorter.columnKey === 'time') {
            onReverseChange(sorter.order !== 'ascend');
          }
        }}
        dataSource={data}
        columns={columns}
      />
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
