import React from 'react';
import { Table as AntdTable } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import _ from 'lodash';

import getColumnsFromFields from './utils/getColumnsFromFields';
import toString from './utils/toString';
import getFieldsFromTableData from './utils/getFieldsFromTableData';
import FieldValueWithFilter from './components/FieldValueWithFilter';

interface Props {
  /** 时间字段 */
  timeField?: string;
  /** 日志数据 */
  data: {
    [index: string]: any;
  }[];
  /** 日志格式配置项 */
  options?: any;
  /** 表格滚动配置 */
  scroll?: { x: number | string; y: number | string };
  /** 过滤每行日志的字段，返回需要显示的字段数组 */
  filterFields?: (fieldKeys: string[]) => string[];
  /** 过滤每行日志的字段，返回需要显示的字段数组 */
  onValueFilter?: (parmas: { key: string; value: string; operator: 'AND' | 'NOT' }) => void;
}

export default function Table(props: Props) {
  const { timeField, data, options, scroll, filterFields, onValueFilter } = props;
  let fields = getFieldsFromTableData(data);
  fields = filterFields ? filterFields(fields) : fields;

  return (
    <AntdTable
      className='n9e-event-logs-table'
      size='small'
      tableLayout='auto'
      rowKey={(record) => {
        return _.join(
          _.map(record, (val) => val),
          '-',
        );
      }}
      columns={getColumnsFromFields(fields, timeField, options, onValueFilter)}
      dataSource={data}
      expandable={{
        expandedRowRender: (record) => {
          return (
            <div>
              {_.map(_.omit(record, ['___raw___', '___id___']), (val: any, key) => {
                return (
                  <dl key={key} className='mb-[4px]'>
                    <dt className='inline-block n9e-fill-color-4 px-[4px] py-[2px] mr-[4px] whitespace-nowrap'>{key}: </dt>
                    <dd className='inline'>{onValueFilter ? <FieldValueWithFilter name={key} value={toString(val)} onValueFilter={onValueFilter} /> : toString(val)}</dd>
                  </dl>
                );
              })}
            </div>
          );
        },
        expandIcon: ({ expanded, onExpand, record }) => (expanded ? <DownOutlined onClick={(e) => onExpand(record, e)} /> : <RightOutlined onClick={(e) => onExpand(record, e)} />),
      }}
      pagination={false}
      scroll={scroll}
    />
  );
}
