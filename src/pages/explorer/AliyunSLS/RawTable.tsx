import React, { useState } from 'react';
import { Table, Tag } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { getColumnsFromFields, getInnerTagKeys } from './utils';

interface IProps {
  data: any[];
  selectedFields: string[];
  scroll?: { x: number | string; y: number | string };
}

export default function RawTable(props: IProps) {
  const { data, selectedFields, scroll } = props;
  const [isMore, setIsMore] = useState(true);
  return (
    <Table
      size='small'
      className='event-logs-table'
      tableLayout='auto'
      rowKey={(record) => {
        return _.join(
          _.map(record, (val) => val),
          '-',
        );
      }}
      columns={getColumnsFromFields(selectedFields, '__time__')}
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
                    <dd>{val}</dd>
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
      footer={
        !isMore
          ? () => {
              return '只能查询您搜索匹配的前 500 个日志，请细化您的过滤条件。';
            }
          : undefined
      }
    />
  );
}
