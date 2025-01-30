import React, { useMemo } from 'react';
import _ from 'lodash';
import { Table as AntdTable } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { Field } from './utils';
import { getColumnsFromFields } from './utils/getColumnsFromFields';
import LogView from './LogView';

interface Props {
  data: any[];
  fetchData: () => void;
  sorterRef: any;
  form: any;
  getFields: () => Field[];
  selectedFields: Field[];
}

function Table(props: Props) {
  const { data, fetchData, sorterRef, form, getFields, selectedFields } = props;
  const columns = useMemo(() => {
    return getColumnsFromFields(selectedFields, form.getFieldValue(['query']), form.getFieldValue(['fieldConfig']));
  }, [selectedFields]);

  return (
    <AntdTable
      size='small'
      className='es-discover-logs-table'
      tableLayout='fixed'
      rowKey='id'
      columns={columns}
      dataSource={data}
      expandable={{
        expandedRowRender: (record) => {
          return <LogView value={record.json} fieldConfig={form.getFieldValue(['fieldConfig'])} fields={getFields()} highlight={record.highlight} range={form.getFieldValue(['query','range'])} />;
        },
        expandIcon: ({ expanded, onExpand, record }) => (expanded ? <DownOutlined onClick={(e) => onExpand(record, e)} /> : <RightOutlined onClick={(e) => onExpand(record, e)} />),
      }}
      scroll={{
        y: 'calc(100% - 36px)',
      }}
      pagination={false}
      onChange={(pagination, filters, sorter: any, extra) => {
        sorterRef.current = _.map(_.isArray(sorter) ? sorter : [sorter], (item) => {
          return {
            field: item.columnKey,
            order: item.order === 'ascend' ? 'asc' : 'desc',
          };
        });
        fetchData();
      }}
    />
  );
}

export default React.memo(Table, (prevProps, nextProps) => {
  return _.isEqual(prevProps.data, nextProps.data) && _.isEqual(prevProps.selectedFields, nextProps.selectedFields);
});
