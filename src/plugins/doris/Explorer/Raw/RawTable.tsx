import React from 'react';
import { Table } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { getColumnsFromFields, toString, filteredFields } from '../utils';
import { FieldValueWithFilter } from './RawList';

interface IProps {
  data: any[];
  scroll?: { x: number | string; y: number | string };
  options?: any;
  onValueFilter?: (parmas: { key: string; value: string; operator: 'AND' | 'NOT' }) => void;
}

export default function RawTable(props: IProps) {
  const { data, scroll, options, onValueFilter } = props;
  let fields = filteredFields(_.keys(data[0]), options?.organizeFields);
  fields = !_.isEmpty(options?.organizeFields) ? _.intersection(fields, options?.organizeFields) : fields;

  return (
    <Table
      size='small'
      className='n9e-event-logs-table'
      tableLayout='fixed'
      rowKey={(record) => {
        return _.join(
          _.map(record, (val) => val),
          '-',
        );
      }}
      columns={getColumnsFromFields(fields, options, onValueFilter)}
      dataSource={data}
      expandable={{
        expandedRowRender: (record) => {
          return (
            <div className='explorer-raw-table-content'>
              {_.map(_.omit(record, ['___raw___', '___id___']), (val: any, key) => {
                return (
                  <dl key={key} className='event-logs-row'>
                    <dt>{key}: </dt>
                    <dd>{onValueFilter ? <FieldValueWithFilter name={key} value={toString(val)} onValueFilter={onValueFilter} /> : toString(val)}</dd>
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
