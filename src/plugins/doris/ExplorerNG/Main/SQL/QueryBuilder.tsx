import React from 'react';
import _ from 'lodash';
import { Form } from 'antd';
import moment from 'moment';

import { DatasourceCateEnum } from '@/utils/constant';
import useOnClickOutside from '@/components/useOnClickOutside';
import { parseRange } from '@/components/TimeRangePicker';

import { buildSql } from '../../../services';
import QueryBuilder from '../../components/QueryBuilder';

interface Props {
  snapRangeRef: React.MutableRefObject<{
    from?: number;
    to?: number;
  }>;
  executeQuery: () => void;

  visible: boolean;
  onClose: () => void;
}

export default function QueryBuilderCpt(props: Props) {
  const { snapRangeRef, executeQuery, visible, onClose } = props;

  const form = Form.useFormInstance();
  const datasourceValue = Form.useWatch(['datasourceValue']);
  const database = Form.useWatch(['query', 'database']);
  const table = Form.useWatch(['query', 'table']);
  const time_field = Form.useWatch(['query', 'time_field']);
  const range = Form.useWatch(['query', 'range']);

  const eleRef = React.useRef<HTMLDivElement>(null);

  useOnClickOutside(eleRef, () => {
    onClose();
  });

  return (
    <div
      ref={eleRef}
      className='w-full border border-primary rounded-sm mb-2 mt-1 p-4'
      style={{
        display: visible ? 'block' : 'none',
      }}
    >
      <QueryBuilder
        eleRef={eleRef}
        datasourceValue={datasourceValue}
        range={range}
        visible={visible}
        defaultValues={{
          database,
          table,
          time_field,
        }}
        onExecute={(values) => {
          if (!range) return;
          const parsedRange = parseRange(range);
          buildSql({
            cate: DatasourceCateEnum.doris,
            datasource_id: datasourceValue,
            query: [
              {
                database: values.database,
                table: values.table,
                time_field: values.time_field,
                from: moment(parsedRange.start).unix(),
                to: moment(parsedRange.end).unix(),
                filters: values.filters,
                aggregates: values.aggregates,
                group_by: values.group_by,
                order_by: values.order_by,
                mode: values.mode,
                limit: values.limit,
              },
            ],
          }).then((res) => {
            onClose();

            const queryValues = form.getFieldValue('query') || {};
            form.setFieldsValue({
              query: {
                ...queryValues,
                sql: res.sql,
                value_keys: res.value_keys,
                label_keys: res.label_keys,
              },
            });
            snapRangeRef.current = {
              from: undefined,
              to: undefined,
            };
            executeQuery();
          });
        }}
        onPreviewSQL={(values) => {
          if (!range) return;
          const parsedRange = parseRange(range);
          buildSql({
            cate: DatasourceCateEnum.doris,
            datasource_id: datasourceValue,
            query: [
              {
                database: values.database,
                table: values.table,
                time_field: values.time_field,
                from: moment(parsedRange.start).unix(),
                to: moment(parsedRange.end).unix(),
                filters: values.filters,
                aggregates: values.aggregates,
                group_by: values.group_by,
                order_by: values.order_by,
                mode: values.mode,
                limit: values.limit,
              },
            ],
          }).then((res) => {
            onClose();

            const queryValues = form.getFieldValue('query') || {};
            form.setFieldsValue({
              query: {
                ...queryValues,
                sql: res.sql,
                value_keys: res.value_keys,
                label_keys: res.label_keys,
              },
            });
          });
        }}
      />
    </div>
  );
}
