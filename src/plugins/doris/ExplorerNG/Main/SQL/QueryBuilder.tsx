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
import CommonStateContext from '../../components/QueryBuilder/commonStateContext';

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
  onExecute: () => void;
  onPreviewSQL: () => void;
}

export default function QueryBuilderCpt(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { snapRangeRef, executeQuery, visible, onClose, queryBuilderPinned, setQueryBuilderPinned, onExecute, onPreviewSQL } = props;

  const form = Form.useFormInstance();
  const datasourceValue = Form.useWatch(['datasourceValue']);

  const eleRef = React.useRef<HTMLDivElement>(null);
  const skipOutsideClickRef = React.useRef(false);

  useOnClickOutside(eleRef, (e) => {
    if (skipOutsideClickRef.current) {
      skipOutsideClickRef.current = false;
      return;
    }
    onClose();
  });

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
          onExecute={(res) => {
            onClose();

            const queryValues = form.getFieldValue('query') || {};
            form.setFieldsValue({
              refreshFlag: undefined,
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

            onExecute();
            snapRangeRef.current = {
              from: undefined,
              to: undefined,
            };
            executeQuery();
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

            onPreviewSQL();
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
    </CommonStateContext.Provider>
  );
}
