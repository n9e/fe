import React from 'react';
import _ from 'lodash';
import { Button, Form } from 'antd';
import { PushpinOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import { DatasourceCateEnum } from '@/utils/constant';
import useOnClickOutside from '@/components/useOnClickOutside';
import { parseRange } from '@/components/TimeRangePicker';

import { NAME_SPACE } from '../../../constants';
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
  queryBuilderPinned: boolean;
  setQueryBuilderPinned: (pinned: boolean) => void;
}

export default function QueryBuilderCpt(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { snapRangeRef, executeQuery, visible, onClose, queryBuilderPinned, setQueryBuilderPinned } = props;

  const form = Form.useFormInstance();
  const datasourceValue = Form.useWatch(['datasourceValue']);

  const eleRef = React.useRef<HTMLDivElement>(null);

  useOnClickOutside(eleRef, () => {
    onClose();
  });

  return (
    <div
      ref={eleRef}
      className={classNames('w-full border border-antd rounded-sm mb-2 mt-1 p-4 bg-fc-100 left-0', {
        absolute: !queryBuilderPinned,
        'top-[32px]': !queryBuilderPinned,
        'border-primary': !queryBuilderPinned,
        relative: queryBuilderPinned,
      })}
      style={{
        zIndex: 2,
        display: visible ? 'block' : 'none',
      }}
    >
      <QueryBuilder
        eleRef={eleRef}
        explorerForm={form}
        datasourceValue={datasourceValue}
        visible={visible}
        onExecute={(values) => {
          const range = form.getFieldValue(['query', 'range']);
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
              refreshFlag: undefined,
              query: {
                ...queryValues,
                sql: res.sql,
                sqlVizType: res.mode,
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
          const range = form.getFieldValue(['query', 'range']);
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
            console.log('preview sql: ', res);
            onClose();

            const queryValues = form.getFieldValue('query') || {};
            form.setFieldsValue({
              refreshFlag: undefined,
              query: {
                ...queryValues,
                sql: res.sql,
                sqlVizType: res.mode,
                value_keys: res.value_keys,
                label_keys: res.label_keys,
              },
            });
          });
        }}
      />
      <Button
        className='absolute top-2 right-2'
        type='text'
        icon={<PushpinOutlined />}
        onClick={() => {
          setQueryBuilderPinned(!queryBuilderPinned);
        }}
      >
        {queryBuilderPinned ? t('builder.to_unpinned_btn') : t('builder.to_pinned_btn')}
      </Button>
    </div>
  );
}
