import React, { useMemo } from 'react';
import _ from 'lodash';
import { Table as AntdTable, Form } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { Field } from './utils';
import { getColumnsFromFields } from './utils/getColumnsFromFields';
import LogView from './LogView';
import useFieldConfig from '../components/RenderValue/useFieldConfig';
interface Props {
  data: any[];
  onChange: (pagination, filters, sorter, extra) => void;
  getFields: () => Field[];
  selectedFields: Field[];
}

function Table(props: Props) {
  const { data, onChange, getFields, selectedFields } = props;
  const form = Form.useFormInstance();
  const indexPatternId = Form.useWatch(['query', 'indexPattern']);
  const fieldConfig = useFieldConfig('elasticsearch', indexPatternId);
  const columns = useMemo(() => {
    return getColumnsFromFields(selectedFields, form.getFieldValue(['query']), fieldConfig);
  }, [selectedFields, fieldConfig]);

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
          return <LogView value={record.json} fieldConfig={fieldConfig} fields={getFields()} highlight={record.highlight} range={form.getFieldValue(['query', 'range'])} />;
        },
        expandIcon: ({ expanded, onExpand, record }) => (expanded ? <DownOutlined onClick={(e) => onExpand(record, e)} /> : <RightOutlined onClick={(e) => onExpand(record, e)} />),
      }}
      scroll={{
        y: 'calc(100% - 36px)',
      }}
      pagination={false}
      onChange={onChange}
    />
  );
}

export default React.memo(Table, (prevProps, nextProps) => {
  return _.isEqual(prevProps.data, nextProps.data) && _.isEqual(prevProps.selectedFields, nextProps.selectedFields);
});
