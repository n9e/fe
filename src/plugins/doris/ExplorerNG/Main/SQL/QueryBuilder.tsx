import React from 'react';
import _ from 'lodash';
import { Button, Form, Space } from 'antd';
import { PushpinOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import useOnClickOutside from '@/components/useOnClickOutside';
import DocumentDrawer from '@/components/DocumentDrawer';

import { NAME_SPACE } from '../../../constants';
import QueryBuilder from '../../components/QueryBuilder';
import CommonStateContext from '../../components/QueryBuilder/commonStateContext';

type Keys = { value: string[]; label: string[] };

interface Props {
  datasourceValue?: number;
  database?: string;
  table?: string;
  time_field?: string;
  sql?: string;

  visible: boolean;
  onClose: () => void;
  queryBuilderPinned: boolean;
  setQueryBuilderPinned: (pinned: boolean) => void;
  onExecute: (keys: Keys) => void;
  onPreviewSQL: (keys: Keys) => void;
}

export default function QueryBuilderCpt(props: Props) {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { datasourceValue, database, table, time_field, sql, visible, onClose, queryBuilderPinned, setQueryBuilderPinned, onExecute, onPreviewSQL } = props;

  const form = Form.useFormInstance();

  const eleRef = React.useRef<HTMLDivElement>(null);
  const skipOutsideClickRef = React.useRef(false);

  useOnClickOutside(eleRef, (e) => {
    const target = (e as Event)?.target as HTMLElement | null;
    if (target && typeof target.closest === 'function' && target.closest('.doris-query-builder-popup')) {
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
          database={database}
          table={table}
          time_field={time_field}
          sqlValue={sql}
          visible={visible}
          onExecute={(res) => {
            onClose();

            const queryValues = form.getFieldValue('query') || {};
            form.setFieldsValue({
              refreshFlag: _.uniqueId('refreshFlag_'), // sql 直接更改 refreshFlag 触发查询即可
              query: {
                ...queryValues,
                sql: res.sql,
                sqlVizType: res.mode,
                keys: {
                  valueKey: res.value_key,
                  labelKey: res.label_key,
                },
              },
            });

            onExecute({
              value: res.value_key,
              label: res.label_key,
            });
          }}
          onPreviewSQL={(res) => {
            onClose();

            const queryValues = form.getFieldValue('query') || {};
            form.setFieldsValue({
              query: {
                ...queryValues,
                sql: res.sql,
                sqlVizType: res.mode,
                keys: {
                  valueKey: res.value_key,
                  labelKey: res.label_key,
                },
              },
            });

            onPreviewSQL({
              value: res.value_key,
              label: res.label_key,
            });
          }}
        />
        <div className='absolute top-2 right-2'>
          <Space size={0}>
            <Button
              type='link'
              onClick={(e) => {
                e.stopPropagation();
                DocumentDrawer({
                  language: i18n.language === 'zh_CN' ? 'zh_CN' : 'en_US',
                  title: t('common:document_title'),
                  type: 'iframe',
                  documentPath: 'https://flashcat.cloud/docs/content/flashcat/log/discover/what-is-sql-mode-in-doris-discover/',
                });
              }}
            >
              {t('common:document_title')}
            </Button>
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
