import React, { useState, forwardRef, useImperativeHandle } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Spin, Empty, Table } from 'antd';
import { parseRange } from '@/components/TimeRangePicker';
import getTextWidth from '@/pages/dashboard/Renderer/utils/getTextWidth';
import { logQuery } from '../../services';
import { toString, getFieldsFromSQLData } from '../utils';

function Metric(props, ref) {
  const { setExecuteLoading } = props;
  const [loading, setLoading] = useState(false);
  const [columnsKeys, setColumnsKeys] = useState<string[]>([]);
  const [data, setData] = useState<any[]>([]);

  useImperativeHandle(ref, () => ({
    fetchData: (datasourceCate, datasourceValue, values) => {
      const query = values.query;
      const requestParams = {
        cate: datasourceCate,
        datasource_id: datasourceValue,
        query: [
          {
            from: moment(parseRange(query.range).start).unix(),
            to: moment(parseRange(query.range).end).unix(),
            sql: query.query,
          },
        ],
      };
      setLoading(true);
      setExecuteLoading(true);
      logQuery(requestParams)
        .then((res) => {
          setData(res.list || []);
          setColumnsKeys(getFieldsFromSQLData(res.list || []));
        })
        .catch(() => {
          setData([]);
          setColumnsKeys([]);
        })
        .finally(() => {
          setLoading(false);
          setExecuteLoading(false);
        });
    },
  }));

  if (_.isEmpty(columnsKeys)) {
    return (
      <Spin spinning={loading}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Spin>
    );
  }

  return (
    <div className='n9e-antd-table-height-full'>
      <Table
        size='small'
        tableLayout='fixed'
        rowKey={(record, index) => {
          return _.join(
            _.map(record, (val, key) => {
              return `${index}-${key}-${val}`;
            }),
            '-',
          );
        }}
        columns={_.map(columnsKeys, (key) => {
          return {
            title: key,
            dataIndex: key,
            key: key,
            render: (text) => {
              return (
                <div
                  style={{
                    minWidth: getTextWidth(key) + 4,
                  }}
                >
                  {toString(text)}
                </div>
              );
            },
          };
        })}
        dataSource={data}
        pagination={false}
        loading={loading}
        scroll={{ x: 'max-content', y: 'calc(100% - 36px)' }}
      />
    </div>
  );
}

export default forwardRef(Metric);
