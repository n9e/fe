import React from 'react';
import { Form, Button } from 'antd';
import { FileSearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import ConditionHistoricalRecords from '@/components/HistoricalRecords/ConditionHistoricalRecords';

import { NAME_SPACE, QUERY_CACHE_KEY, QUERY_CACHE_PICK_KEYS } from '../../constants';

const SYNTAX_LABEL_MAP: Record<string, string> = { sql: 'SQL', kuery: 'KQL', lucene: 'Lucene' };

interface Props {
  executeQuery: () => void;
}

export default function QueryInputAddonAfter(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { executeQuery } = props;

  const form = Form.useFormInstance();
  const datasourceValue = Form.useWatch('datasourceValue');

  if (!datasourceValue) return null;

  return (
    <ConditionHistoricalRecords
      localKey={QUERY_CACHE_KEY}
      datasourceValue={datasourceValue}
      renderItem={(item, setVisible) => {
        return (
          <div
            className='flex flex-wrap items-center gap-y-1 cursor-pointer hover:bg-[var(--fc-fill-3)] p-1 rounded leading-[1.1] mb-1'
            key={JSON.stringify(item)}
            onClick={() => {
              form.setFieldsValue({
                query: {
                  ...item,
                  query: item.query || '',
                },
              });
              executeQuery();
              setVisible(false);
            }}
          >
            {_.map(_.pick(item, QUERY_CACHE_PICK_KEYS), (value, key) => {
              // SQL 模式下隐藏 query 字段；非 SQL 模式下隐藏 sql 字段
              if (key === 'sql' && item.syntax !== 'sql') return <span key={key} />;
              if (key === 'query' && item.syntax === 'sql') return <span key={key} />;
              // filters 是数组，单独处理
              if (key === 'filters') {
                if (!Array.isArray(value) || value.length === 0) return <span key={key} />;
                return (
                  <React.Fragment key={key}>
                    {value.map((filter: any, idx: number) => {
                      const label = filter.operator === 'EXISTS' ? `${filter.key}: exists` : `${filter.operator === 'NOT' ? 'NOT ' : ''}${filter.key}: ${filter.value}`;
                      return (
                        <span key={idx} className='whitespace-nowrap'>
                          <span className='bg-[var(--fc-fill-1)] inline-block p-1 mr-1'>{t('query.filters')}:</span>
                          <span className='pr-1'>{label}</span>
                        </span>
                      );
                    })}
                  </React.Fragment>
                );
              }
              if (!value) return <span key={key} />;
              const displayValue = key === 'syntax' ? SYNTAX_LABEL_MAP[value as string] ?? value : value;
              return (
                <span key={key} className='whitespace-nowrap'>
                  <span className='bg-[var(--fc-fill-1)] inline-block p-1 mr-1'>{t(`query.${key}`)}:</span>
                  <span className='pr-1'>{displayValue}</span>
                </span>
              );
            })}
          </div>
        );
      }}
      type='text'
    >
      <Button size='small' type='text' icon={<FileSearchOutlined />} />
    </ConditionHistoricalRecords>
  );
}
