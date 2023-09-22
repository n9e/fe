import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Table, Form, Alert, Empty } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import { parseRange } from '@/components/TimeRangePicker';
import { DatasourceCateEnum } from '@/utils/constant';
import getTextWidth from '@/pages/dashboard/Renderer/utils/getTextWidth';
import { getLogsQuery } from '../services';
import { cacheDefaultValues } from './index';

interface Props {
  form: FormInstance;
  datasourceValue: number;
  refreshFlag?: string;
  setRefreshFlag: (flag?: string) => void;
}

export default function TableCpt(props: Props) {
  const { form, datasourceValue, refreshFlag, setRefreshFlag } = props;
  const [columns, setColumns] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [errorContent, setErrorContent] = useState('');
  const range = Form.useWatch(['query', 'range'], form);
  const keys = Form.useWatch(['query', 'keys'], form);
  const query = Form.useWatch(['query', 'query'], form);

  useEffect(() => {
    if (datasourceValue && query && refreshFlag) {
      const parsedRange = parseRange(range);
      const start = moment(parsedRange.start).toISOString();
      const end = moment(parsedRange.end).toISOString();
      cacheDefaultValues(datasourceValue, query);
      getLogsQuery({
        cate: DatasourceCateEnum.tdengine,
        datasource_id: datasourceValue,
        query: [
          {
            query,
            from: start,
            to: end,
            keys,
          },
        ],
      })
        .then((res) => {
          const data = _.map(res?.data, (item) => {
            return _.reduce(
              item,
              (result, item, idx) => {
                if (res?.column_meta?.[idx]?.[0]) {
                  result[res?.column_meta?.[idx]?.[0]] = item;
                }
                return result;
              },
              {},
            );
          });
          setErrorContent('');
          setData(data);
          setColumns(
            _.map(res?.column_meta, (item) => {
              return item?.[0];
            }),
          );
        })
        .catch((err) => {
          const msg = _.get(err, 'message');
          setErrorContent(`Error executing query: ${msg}`);
          setData([]);
          setColumns([]);
        })
        .finally(() => {
          setRefreshFlag();
        });
    }
  }, [JSON.stringify(range), JSON.stringify(keys), query, refreshFlag]);

  return (
    <div style={{ minHeight: 0 }}>
      {errorContent && <Alert style={{ marginBottom: 16 }} message={errorContent} type='error' />}
      {_.isEmpty(data) ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Table
          size='small'
          rowKey='_ts'
          dataSource={data}
          columns={_.map(columns, (item) => {
            return {
              title: item,
              dataIndex: item,
              key: item,
              render: (text) => {
                return (
                  <div
                    style={{
                      minWidth: getTextWidth(item),
                    }}
                  >
                    {text}
                  </div>
                );
              },
            };
          })}
          pagination={false}
          scroll={{
            x: 'max-content',
            y: 'calc(100% - 36px)',
          }}
        />
      )}
    </div>
  );
}
