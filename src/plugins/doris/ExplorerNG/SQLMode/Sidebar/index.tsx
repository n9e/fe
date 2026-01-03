import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Segmented, Select, message } from 'antd';
import _ from 'lodash';

import { DatasourceCateEnum } from '@/utils/constant';
import Meta from '@/components/Meta';

import { NAME_SPACE, DATE_TYPE_LIST } from '../../../constants';
import { getDorisIndex } from '../../../services';

interface Props {
  disabled?: boolean;
  datasourceValue: number;
  executeQuery: () => void;
}

export default function QueryBuilder(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { disabled, datasourceValue, executeQuery } = props;
  const form = Form.useFormInstance();
  const submode = Form.useWatch(['query', 'submode']);

  return (
    <div className='min-h-0 flex-1 h-full flex flex-col'>
      <div className='flex-shrink-0'>
        <Form.Item name={['query', 'submode']} initialValue='raw'>
          <Segmented
            disabled={disabled}
            block
            options={[
              {
                label: t('query.submode.raw'),
                value: 'raw',
              },
              {
                label: t('query.submode.timeSeries'),
                value: 'timeSeries',
              },
            ]}
          />
        </Form.Item>
        {submode === 'timeSeries' && (
          <>
            <Form.Item
              name={['query', 'keys', 'valueKey']}
              rules={[
                {
                  required: true,
                  message: t('query.advancedSettings.valueKey_required'),
                },
              ]}
            >
              <Select mode='tags' open={false} disabled={disabled} placeholder={t('query.advancedSettings.tags_placeholder')} />
            </Form.Item>
            <Form.Item name={['query', 'keys', 'labelKey']}>
              <Select mode='tags' open={false} disabled={disabled} placeholder={t('query.advancedSettings.tags_placeholder')} />
            </Form.Item>
          </>
        )}
      </div>
      <div className='min-h-0 flex-1 border border-fc-300 rounded-sm'>
        <Meta
          datasourceCate={DatasourceCateEnum.doris}
          datasourceValue={datasourceValue}
          onTreeNodeClick={(nodeData) => {
            const query = form.getFieldValue(['query']);

            getDorisIndex({ cate: DatasourceCateEnum.doris, datasource_id: datasourceValue, database: nodeData.database, table: nodeData.table })
              .then((res) => {
                let dateField = 'timestamp';
                const firstDateField = _.find(res, (item) => {
                  return _.includes(DATE_TYPE_LIST, item.type.toLowerCase());
                })?.field;
                if (firstDateField) {
                  dateField = firstDateField;
                }
                _.set(query, 'query', `select * from ${nodeData.database}.${nodeData.table} WHERE $__timeFilter(${dateField}) limit 20;`);
                form.setFieldsValue({
                  query,
                });
                executeQuery();
              })
              .catch(() => {
                message.warning(t('query.get_index_fail'));
                _.set(query, 'query', `select * from ${nodeData.database}.${nodeData.table} WHERE $__timeFilter(timestamp) limit 20;`);
                form.setFieldsValue({
                  query,
                });
                executeQuery();
              });
          }}
        />
      </div>
    </div>
  );
}
