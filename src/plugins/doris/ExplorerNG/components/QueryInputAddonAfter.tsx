import React from 'react';
import { Form } from 'antd';
import { FileSearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import ConditionHistoricalRecords from '@/components/HistoricalRecords/ConditionHistoricalRecords';
import HistoricalRecords from '@/components/HistoricalRecords';

import { NAME_SPACE, NG_QUERY_CACHE_KEY, NG_QUERY_CACHE_PICK_KEYS, NG_SQL_CACHE_KEY } from '../../constants';

interface Props {
  executeQuery: () => void;
}

export default function QueryInputAddonAfter(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { executeQuery } = props;
  const form = Form.useFormInstance();
  const datasourceValue = Form.useWatch('datasourceValue');
  const syntax = Form.useWatch(['query', 'syntax']);

  if (!datasourceValue) return null;

  if (syntax === 'query') {
    return (
      <ConditionHistoricalRecords
        localKey={NG_QUERY_CACHE_KEY}
        datasourceValue={datasourceValue}
        renderItem={(item, setVisible) => {
          return (
            <div
              className='flex flex-wrap items-center gap-y-1 cursor-pointer hover:bg-[var(--fc-fill-3)] p-1 rounded leading-[1.1] mb-1'
              key={JSON.stringify(item)}
              onClick={() => {
                form.setFieldsValue({ query: item });
                executeQuery();
                setVisible(false);
              }}
            >
              {_.map(_.pick(item, NG_QUERY_CACHE_PICK_KEYS), (value, key) => {
                if (!value) return <span key={key} />;
                return (
                  <span key={key} className='whitespace-nowrap'>
                    <span className='bg-[var(--fc-fill-1)] inline-block p-1 mr-1'>{t(`query.${key}`)}:</span>
                    <span className='pr-1'>{value}</span>
                  </span>
                );
              })}
            </div>
          );
        }}
        type='text'
      >
        <FileSearchOutlined />
      </ConditionHistoricalRecords>
    );
  }

  if (syntax === 'sql') {
    return (
      <HistoricalRecords
        localKey={NG_SQL_CACHE_KEY}
        datasourceValue={datasourceValue}
        onSelect={(query) => {
          form.setFieldsValue({
            query: {
              query,
            },
          });
          executeQuery();
        }}
        type='text'
      >
        <FileSearchOutlined />
      </HistoricalRecords>
    );
  }

  return null;
}
