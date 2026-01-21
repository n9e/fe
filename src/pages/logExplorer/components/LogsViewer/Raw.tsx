import React, { useState, useEffect, useContext } from 'react';
import _ from 'lodash';
import moment from 'moment';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Table, Tooltip, Drawer, Empty } from 'antd';
import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons';

import { NAME_SPACE } from '../../constants';
import { OnValueFilterParams } from './types';
import LogViewer from './components/LogViewer';
import TextSearchIcon from './components/TextSearchIcon';
import LogFieldValue from './components/LogFieldValue';

const explorerOriginInlineCellClassName = 'inline-block mr-1';
const explorerOriginBreakCellClassName = 'break-all block mr-1';
const explorerOriginFieldKeyClassName = 'bg-fc-300 rounded-sm text-title inline-flex text-[12px] my-[2px] py-[1px] px-[3px]';
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
}

interface RenderValueProps {
  name: string;
  value: string;
  onValueFilter?: Props['onValueFilter'];
}

function RenderValue({ name, value, onValueFilter }: RenderValueProps) {
  const { rawValue } = useContext(DataContext);

  return <LogFieldValue name={name} value={value} onTokenClick={onValueFilter} rawValue={rawValue} />;
}

function RenderSubJSON({
  label,
  subJSON,
  options,
  currentExpandLevel,
  onValueFilter,
}: {
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
            <span
              className={explorerOriginFieldKeyClassName}
              style={{
                marginLeft: '2px',
              }}
            >
              {label}
            </span>
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
                        return <RenderSubJSON key={idx} label={k} subJSON={item} options={options} currentExpandLevel={currentExpandLevel + 1} onValueFilter={onValueFilter} />;
                      })
                    )}
                  </ul>
                );
              }
              return (
                <li key={k}>
                  <div className={explorerOriginFieldKeyClassName}>{k}</div>:
                  <RenderValue name={k} value={v} onValueFilter={onValueFilter} />
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  }
  if (options.jsonDisplaType === 'string') {
    return (
      <li className={explorerOriginLiClassName}>
        <div className={explorerOriginFieldKeyClassName}>{label}</div>:<div className={explorerOrigiFieldValClassName}>{JSON.stringify(subJSON)}</div>
      </li>
    );
  }
  return null;
}

export const DataContext = React.createContext({
  rawValue: {},
});

function Raw(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { timeField, data, options, onValueFilter, onReverseChange, rowPrefixRender, filterFields } = props;
  const [logViewerDrawerState, setLogViewerDrawerState] = useState<{ visible: boolean; value: any }>({ visible: false, value: null });
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
                          _.map(_.isArray(valToObj) ? valToObj : [valToObj], (item, idx) => {
                            return <RenderSubJSON key={idx} label={key} subJSON={item} options={options} currentExpandLevel={1} onValueFilter={onValueFilter} />;
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
      render: (val, record) => {
        return (
          <Tooltip title={t('log_viewer_drawer_trigger_tip')}>
            <div
              className='absolute inset-0 flex items-center cursor-pointer'
              onClick={() => {
                setLogViewerDrawerState({ visible: true, value: record });
              }}
            >
              {moment(val).format('MM-DD HH:mm:ss.SSS')}
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
                setLogViewerDrawerState({ visible: true, value: record });
              }}
            >
              {index + 1}
            </div>
          </Tooltip>
        );
      },
      onCell: () => ({
        style: { padding: 0, position: 'relative' },
      }),
    });
  }

  return (
    <>
      <Table
        className='n9e-event-logs-table n9e-log-explorer-raw-table'
        rowKey='___id___'
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
                  onClick={(e) => {
                    setLogViewerDrawerState({ visible: true, value: record });
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
      <Drawer
        title={t('log_viewer_drawer_title')}
        placement='right'
        width='55%'
        onClose={() => {
          setLogViewerDrawerState({ visible: false, value: null });
        }}
        visible={logViewerDrawerState.visible}
        destroyOnClose
      >
        {logViewerDrawerState.value ? (
          <LogViewer
            value={logViewerDrawerState.value}
            rawValue={logViewerDrawerState.value}
            onValueFilter={(params) => {
              onValueFilter?.(params);
              setLogViewerDrawerState({ visible: false, value: null });
            }}
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Drawer>
    </>
  );
}

export default React.memo(Raw, (prevProps, nextProps) => {
  const pickKeys = ['logsHash', 'options', 'timeField', 'filterFields'];
  return _.isEqual(_.pick(prevProps, pickKeys), _.pick(nextProps, pickKeys));
});
