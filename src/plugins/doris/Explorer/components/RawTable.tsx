import React from 'react';
import { Table } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import _ from 'lodash';

import { getColumnsFromFields, toString, filteredFields } from '../utils';
import FieldValueWithFilter from './FieldValueWithFilter';

interface IProps {
  time_field?: string;
  data: any[];
  options?: any;
  onValueFilter?: (parmas: { key: string; value: string; operator: 'AND' | 'NOT' }) => void;
}

export default function RawTable(props: IProps) {
  const { time_field, data, options, onValueFilter } = props;
  let fields = filteredFields(_.keys(data[0]), options?.organizeFields);
  fields = !_.isEmpty(options?.organizeFields) ? _.intersection(fields, options?.organizeFields) : fields;

  return (
    <Table
      size='small'
      tableLayout='fixed'
      rowKey={(record) => {
        return _.join(
          _.map(record, (val) => val),
          '-',
        );
      }}
      columns={getColumnsFromFields(fields, time_field, options, onValueFilter)}
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
      scroll={{ x: 'max-content', y: 'calc(100% - 34px)' }}
    />
  );
}
