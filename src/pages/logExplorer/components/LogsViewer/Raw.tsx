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
import { OnValueFilterParams } from './types';
import LogViewer from './components/LogViewer';
import TextSearchIcon from './components/TextSearchIcon';
import LogFieldValue from './components/LogFieldValue';

const explorerOriginInlineCellClassName = 'inline-block mr-1 my-[2px] align-top';
const explorerOriginBreakCellClassName = 'break-all block mr-1 my-[2px]';
const explorerOriginFieldKeyClassName = 'bg-fc-300 rounded-sm text-title inline-flex text-[12px] py-[1px] px-[3px]';
const explorerOrigiFieldValClassName = 'inline text-main m-0 p-0 cursor-pointer';
const explorerOriginUlClassName = 'border-0 list-none bg-transparent p-0 m-0';
const explorerOriginLiClassName = 'relative ml-0 pl-0 ';

interface Props {
  /** 时间字段 */
  timeField?: string;
  /** 日志数据 */
  data: {
    [index: string]: any;
  }[];
  logsHash?: string;
  /** 日志格式配置项 */
  options: any;
  /** 过滤每行日志的字段，返回需要显示的字段数组 */
  filterFields?: (fieldKeys: string[]) => string[];
  /** 每行日志前面的额外内容 */
  rowPrefixRender?: (record: { [index: string]: any }) => React.ReactNode;
  /** 过滤每行日志的字段，返回需要显示的字段数组 */
  onValueFilter?: (parmas: OnValueFilterParams) => void;
  /** 排序反转回调 */
  onReverseChange: (reverse: boolean) => void;
  timeFieldColumnFormat?: (timeFieldValue: string | number) => React.ReactNode;
  linesColumnFormat?: (linesValue: number) => React.ReactNode;
  id_key: string;
  raw_key: string;
  logViewerExtraRender?: (log: { [index: string]: any }) => React.ReactNode;
}

interface RenderValueProps {
  name: string;
  value: string;
  parentKey?: string;
  onValueFilter?: Props['onValueFilter'];
}

function RenderValue({ name, value, parentKey, onValueFilter }: RenderValueProps) {
  const { t } = useTranslation(NAME_SPACE);
  const { rawValue } = useContext(DataContext);

  const [expand, setExpand] = useState(false);

  if (typeof value === 'string' && value.indexOf('\n') > -1) {
    const lines = !expand ? _.slice(value.split('\n'), 0, 18) : value.split('\n');
    return (
      <div className='inline text-hint m-0 p-0'>
        {_.map(lines, (v, idx) => {
          return (
            <div key={idx}>
              <LogFieldValue parentKey={parentKey} name={name} value={v} onTokenClick={onValueFilter} rawValue={rawValue} />
              {idx === lines.length - 1 && (
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

  return <LogFieldValue parentKey={parentKey} name={name} value={value} onTokenClick={onValueFilter} rawValue={rawValue} />;
}

function RenderSubJSON({
  parentKey,
  label,
  subJSON,
  options,
  currentExpandLevel,
  onValueFilter,
}: {
  parentKey?: string;
  label: string;
  subJSON: any;
  options: any;
  currentExpandLevel: number;
  onValueFilter?: Props['onValueFilter'];
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
          <div className='text-link'>{`{}`}</div>
        </div>
        {expand && (
          <ul className='list-none pl-[30px]'>
            {_.map(subJSON, (v, k) => {
              if (_.isPlainObject(v) || _.isArray(v)) {
                return (
                  <ul className={explorerOriginUlClassName}>
                    {_.isEmpty(v) ? (
                      <>
                        <div className={explorerOriginFieldKeyClassName}>{k}</div>:<div className={explorerOrigiFieldValClassName}>{`[]`}</div>
                      </>
                    ) : (
                      _.map(_.isArray(v) ? v : [v], (item, idx) => {
                        return (
                          <RenderSubJSON
                            key={idx}
                            parentKey={parentKey ? parentKey + '.' + k : k}
                            label={k}
                            subJSON={item}
                            options={options}
                            currentExpandLevel={currentExpandLevel + 1}
                            onValueFilter={onValueFilter}
                          />
                        );
                      })
                    )}
                  </ul>
                );
              }
              return (
                <li key={k}>
                  <div className={explorerOriginFieldKeyClassName}>{k}</div>:
                  <RenderValue parentKey={parentKey ? parentKey + '.' + k : k} name={k} value={v} onValueFilter={onValueFilter} />
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
      <div className={explorerOrigiFieldValClassName}>
        <RenderValue name={label} value={JSON.stringify(subJSON)} onValueFilter={onValueFilter} />
      </div>
    </li>
  );
}

export const DataContext = React.createContext({
  rawValue: {},
});

function Raw(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const {
    timeField,
    data,
    logsHash,
    options,
    onValueFilter,
    onReverseChange,
    rowPrefixRender,
    filterFields,
    timeFieldColumnFormat,
    linesColumnFormat,
    id_key,
    raw_key,
    logViewerExtraRender,
  } = props;
  const [logViewerDrawerState, setLogViewerDrawerState] = useState<{ visible: boolean; currentIndex: number }>({ visible: false, currentIndex: -1 });
  const columns: any[] = [
    {
      title: t('logs.title'),
      render: (item) => {
        const fields = filterFields ? filterFields(_.keys(item)) : _.keys(item);

        return (
          <div className='w-full'>
            {rowPrefixRender && <>{rowPrefixRender(item)}</>}
            {_.map(fields, (key) => {
              const val = item[key];
              const valToObj = val;
              const subJSON = _.isArray(valToObj) ? valToObj : [valToObj];
              return (
                <DataContext.Provider value={{ rawValue: item }} key={key}>
                  <div
                    className={classNames({
                      [explorerOriginInlineCellClassName]: options.lineBreak !== 'true',
                      [explorerOriginBreakCellClassName]: options.lineBreak === 'true',
                    })}
                  >
                    {_.isPlainObject(valToObj) || _.isArray(valToObj) ? (
                      <ul className={explorerOriginUlClassName}>
                        {_.isEmpty(subJSON) ? (
                          <>
                            <div className={explorerOriginFieldKeyClassName}>{key}</div>: <div className={explorerOrigiFieldValClassName}>{`[]`}</div>
                          </>
                        ) : (
                          _.map(subJSON, (item, idx) => {
                            return <RenderSubJSON key={idx} parentKey={key} label={key} subJSON={item} options={options} currentExpandLevel={1} onValueFilter={onValueFilter} />;
                          })
                        )}
                      </ul>
                    ) : (
                      <>
                        <div className={explorerOriginFieldKeyClassName}>{key}</div>: <RenderValue name={key} value={val} onValueFilter={onValueFilter} />
                      </>
                    )}
                  </div>
                </DataContext.Provider>
              );
            })}
          </div>
        );
      },
    },
  ];

  if (timeField && options.time === 'true') {
    columns.unshift({
      title: t('logs.settings.time'),
      width: 140,
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
    columns.unshift({
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
      // 忽略点击发生在 log viewer drawer 内的情况
      const target = (event && (event as Event).target) as HTMLElement | null;
      if (target && typeof target.closest === 'function' && target.closest('.log-explorer-log-viewer-drawer')) {
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
        className='log-explorer-log-viewer-drawer'
        title={navigableDrawerTitle}
        extra={logViewerExtraRender && logViewerExtraRender(data[logViewerDrawerState.currentIndex])}
        placement='right'
        width='55%'
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
            rawValue={data[logViewerDrawerState.currentIndex]}
            onValueFilter={(params) => {
              onValueFilter?.(params);
              setLogViewerDrawerState({ visible: false, currentIndex: -1 });
            }}
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </NavigableDrawer>
    </div>
  );
}

export default React.memo(Raw, (prevProps, nextProps) => {
  const pickKeys = ['logsHash', 'options', 'timeField', 'filterFields'];
  return _.isEqual(_.pick(prevProps, pickKeys), _.pick(nextProps, pickKeys));
});
