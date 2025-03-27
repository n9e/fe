import React, { useState, useEffect, useMemo } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Table, Form, Alert, Empty, Spin, Tooltip } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import { parseRange } from '@/components/TimeRangePicker';
import { DatasourceCateEnum } from '@/utils/constant';
import { useAntdResizableHeader } from 'use-antd-resizable-header';
import { getLogsQuery } from '../services';
import { setLocalQueryHistory } from '../components/HistoricalRecords';
import { CACHE_KEY } from '../constants';
import { useGlobalState } from '../globalState';

interface Props {
  form: FormInstance;
  datasourceValue: number;
  refreshFlag?: string;
  setRefreshFlag: (flag?: string) => void;
}

export default function TableCpt(props: Props) {
  const { form, datasourceValue, refreshFlag, setRefreshFlag } = props;
  const [mySQLTableFields, setMySQLTableFields] = useGlobalState('mySQLTableFields');
  const [columnsKeys, setColumnsKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [errorContent, setErrorContent] = useState('');
  const range = Form.useWatch(['query', 'range'], form);
  const query = Form.useWatch(['query', 'query'], form);
  const columns: any[] = _.map(columnsKeys, (item, index) => {
    return {
      title: item,
      dataIndex: item,
      key: item,
      ellipsis: {
        showTitle: false,
      },
      width: columnsKeys.length - 1 === index ? undefined : 150,
      render: (text) => {
        if (_.isPlainObject(text)) {
          text = JSON.stringify(text);
        }
        return (
          <Tooltip placement='topLeft' title={text}>
            {text}
          </Tooltip>
        );
      },
    };
  });
  const { components, resizableColumns, tableWidth, resetColumns } = useAntdResizableHeader({
    columns: useMemo(() => columns, [columnsKeys]),
    tooltipRender: (props) => <Tooltip {...props} />,
    defaultWidth: 150,
  });

  useEffect(() => {
    if (datasourceValue && refreshFlag && query && range) {
      const parsedRange = parseRange(range);
      const start = moment(parsedRange.start).unix();
      const end = moment(parsedRange.end).unix();
      setLoading(true);
      getLogsQuery({
        queries: [
          {
            ds_cate: DatasourceCateEnum.ck,
            ds_id: datasourceValue,
            ref: 'A',
            query: {
              ref: 'A',
              sql: query,
              from: start,
              to: end,
            },
          },
        ],
      })
        .then((res) => {
          const data = _.flatten(
            _.map(res, (item) => {
              return _.map(item?.data, (subItem) => {
                return subItem;
              });
            }),
          );
          const keys = _.union(
            _.flattenDeep(
              _.map(data, (item) => {
                return _.keys(item);
              }),
            ),
          );
          setErrorContent('');
          setData(data);
          setColumnsKeys(keys);
          setMySQLTableFields(
            _.filter(keys, (item) => {
              return item !== 'time'; // time 是特殊字段不会用于 valuekey 或是 labelkey
            }),
          );
          setLocalQueryHistory(`${CACHE_KEY}-${datasourceValue}`, query);
        })
        .catch((err) => {
          const msg = _.get(err, 'message');
          setErrorContent(`Error executing query: ${msg}`);
          setData([]);
          setColumnsKeys([]);
          setMySQLTableFields([]);
        })
        .finally(() => {
          setRefreshFlag();
          setLoading(false);
        });
    }
  }, [JSON.stringify(range), query, refreshFlag]);

  return (
    <div style={{ minHeight: 0 }}>
      {errorContent && <Alert style={{ marginBottom: 16 }} message={errorContent} type='error' />}
      {_.isEmpty(data) ? (
        <Spin spinning={loading}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </Spin>
      ) : (
        <>
          <Table
            size='small'
            className='explorer-main-table'
            loading={loading}
            rowKey={(record) => {
              return _.join(
                _.map(record, (val) => val),
                '-',
              );
            }}
            columns={resizableColumns}
            components={components}
            dataSource={data}
            pagination={false}
            scroll={{
              x: tableWidth,
              y: 'calc(100% - 36px)',
            }}
          />
        </>
      )}
    </div>
  );
}
