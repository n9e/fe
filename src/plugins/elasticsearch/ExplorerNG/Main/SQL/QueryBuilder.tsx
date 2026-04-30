import React from 'react';
import _ from 'lodash';
import { Button, Form, Space, message } from 'antd';
import { PushpinOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import moment from 'moment';

import useOnClickOutside from '@/components/useOnClickOutside';
import { parseRange } from '@/components/TimeRangePicker';
import { IS_PLUS, DatasourceCateEnum } from '@/utils/constant';

import { NAME_SPACE } from '../../../constants';

// @ts-ignore
import QueryBuilder from 'plus:/datasource/elasticsearch/ExplorerNG/components/QueryBuilder';
// @ts-ignore
import CommonStateContext from 'plus:/datasource/elasticsearch/ExplorerNG/components/QueryBuilder/commonStateContext';
// @ts-ignore
import { esQueryBuilder } from 'plus:/datasource/elasticsearch/ExplorerNG/services';

interface Props {
  datasourceValue?: number;
  index?: string;
  date_field?: string;
  sql?: string;

  visible: boolean;
  onClose: () => void;
  queryBuilderPinned: boolean;
  setQueryBuilderPinned: (pinned: boolean) => void;
  onExecute: (values: Record<string, any>) => void;
  onPreviewSQL: (values: Record<string, any>) => void;
}

export default function QueryBuilderCpt(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { datasourceValue, index, date_field, sql, visible, onClose, queryBuilderPinned, setQueryBuilderPinned, onExecute, onPreviewSQL } = props;

  if (!IS_PLUS) return null;

  const form = Form.useFormInstance();

  const eleRef = React.useRef<HTMLDivElement>(null);
  const skipOutsideClickRef = React.useRef(false);

  useOnClickOutside(eleRef, (e) => {
    const target = (e as Event)?.target as HTMLElement | null;
    if (target && typeof target.closest === 'function' && target.closest('.es-query-builder-popup')) {
      return;
    }
    if (skipOutsideClickRef.current) {
      skipOutsideClickRef.current = false;
      return;
    }
    onClose();
  });

  if (!datasourceValue) return null;

  return (
    <CommonStateContext.Provider
      value={{
        ignoreNextOutsideClick: () => {
          skipOutsideClickRef.current = true;
        },
      }}
    >
      <div
        ref={eleRef}
        className={classNames('w-full border border-antd rounded-sm mb-2 mt-1 bg-fc-100 left-0 p-4 pt-2 shadow-lg', {
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
          explorerForm={form}
          datasourceValue={datasourceValue}
          index={index}
          date_field={date_field}
          sqlValue={sql}
          visible={visible}
          onExecute={(values) => {
            onClose();

            const range = form.getFieldValue(['query', 'range']);
            if (!range) {
              message.error(t('builder.range_required'));
              return;
            }
            const parsedRange = parseRange(range);

            esQueryBuilder({
              cate: DatasourceCateEnum.elasticsearch,
              datasource_id: datasourceValue!,
              query: [
                {
                  mode: values.mode,
                  index: values.index || index,
                  time_field: values.date_field || date_field,
                  from: moment(parsedRange.start).unix(),
                  to: moment(parsedRange.end).unix(),
                  filters: values.filters,
                  aggregates: values.aggregates,
                  group_by: values.group_by,
                  order_by: values.order_by,
                  limit: values.limit,
                },
              ],
            })
              .then((result) => {
                const queryValues = form.getFieldValue('query') || {};
                form.setFieldsValue({
                  refreshFlag: _.uniqueId('refreshFlag_'),
                  query: {
                    ...queryValues,
                    sql: result.sql,
                    sqlVizType: result.mode,
                    keys: {
                      valueKey: result.value_key,
                      labelKey: result.label_key,
                    },
                  },
                });

                onExecute(result);
              })
              .catch((err) => {
                message.error(err?.message || t('builder.execute_failed'));
              });
          }}
          onPreviewSQL={(values) => {
            onClose();

            const range = form.getFieldValue(['query', 'range']);
            if (!range) {
              message.error(t('builder.range_required'));
              return;
            }
            const parsedRange = parseRange(range);

            esQueryBuilder({
              cate: DatasourceCateEnum.elasticsearch,
              datasource_id: datasourceValue!,
              query: [
                {
                  mode: values.mode,
                  index: values.index || index,
                  time_field: values.date_field || date_field,
                  from: moment(parsedRange.start).unix(),
                  to: moment(parsedRange.end).unix(),
                  filters: values.filters,
                  aggregates: values.aggregates,
                  group_by: values.group_by,
                  order_by: values.order_by,
                  limit: values.limit,
                },
              ],
            })
              .then((result) => {
                const queryValues = form.getFieldValue('query') || {};
                form.setFieldsValue({
                  query: {
                    ...queryValues,
                    sql: result.sql,
                    sqlVizType: result.mode,
                    keys: {
                      valueKey: result.value_key,
                      labelKey: result.label_key,
                    },
                  },
                });

                onPreviewSQL(result);
              })
              .catch((err) => {
                message.error(err?.message || t('builder.preview_sql_failed'));
              });
          }}
        />
        <div className='absolute top-2 right-2'>
          <Space size={0}>
            <Button
              type='text'
              icon={<PushpinOutlined />}
              onClick={() => {
                setQueryBuilderPinned(!queryBuilderPinned);
              }}
            >
              {queryBuilderPinned ? t('builder.to_unpinned_btn') : t('builder.to_pinned_btn')}
            </Button>
          </Space>
        </div>
      </div>
    </CommonStateContext.Provider>
  );
}
