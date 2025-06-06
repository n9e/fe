import React from 'react';
import { Table, Tag } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { getColumnsFromFields, getInnerTagKeys, toString } from './utils';
import { useContext } from 'react';
import { CommonStateContext } from '@/App';

interface IProps {
  data: any[];
  selectedFields: string[];
  scroll?: { x: number | string; y: number | string };
  dateField?: string;
  timeField?: boolean;
}

export default function RawTable(props: IProps) {
  const { data, selectedFields, scroll, dateField = '__time__', timeField = true } = props;

  return (
    <Table
      size='small'
      className='event-logs-table'
      tableLayout='fixed'
      rowKey={(record) => {
        return _.join(
          _.map(record, (val) => val),
          '-',
        );
      }}
      columns={getColumnsFromFields(selectedFields, dateField, timeField)}
      dataSource={data}
      expandable={{
        expandedRowRender: (record) => {
          const tagskeys = getInnerTagKeys(record);
          return (
            <div className='sls-discover-raw-content'>
              {!_.isEmpty(tagskeys) && (
                <div className='sls-discover-raw-tags'>
                  {_.map(tagskeys, (key) => {
                    return <Tag color='purple'>{record[key]}</Tag>;
                  })}
                </div>
              )}

              {_.map(_.omit(record, tagskeys), (val: any, key) => {
                return (
                  <dl key={key} className='event-logs-row'>
                    <dt>{key}: </dt>
                    <dd>{toString(val)}</dd>
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
