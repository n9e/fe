import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Segmented, Button, Tooltip, message } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';

import { DatasourceCateEnum } from '@/utils/constant';
import { OutlinedSelect } from '@/components/OutlinedSelect';
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
              <OutlinedSelect
                label={t('query.advancedSettings.valueKey')}
                suffix={
                  <Tooltip title={t('query.advancedSettings.valueKey_tip')}>
                    <Button icon={<QuestionCircleOutlined />} />
                  </Tooltip>
                }
                mode='tags'
                open={false}
                disabled={disabled}
              />
            </Form.Item>
            <Form.Item name={['query', 'keys', 'labelKey']}>
              <OutlinedSelect
                label={t('query.advancedSettings.labelKey')}
                suffix={
                  <Tooltip title={t('query.advancedSettings.labelKey_tip')}>
                    <Button icon={<QuestionCircleOutlined />} />
                  </Tooltip>
                }
                mode='tags'
                open={false}
                disabled={disabled}
              />
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
                if (query.submode === 'raw') {
                  _.set(query, 'query', `select * from \`${nodeData.database}\`.\`${nodeData.table}\` WHERE $__timeFilter(\`${dateField}\`) limit 20;`);
                } else if (query.submode === 'timeSeries') {
                  _.set(
                    query,
                    'query',
                    `SELECT count(*) as cnt, $__timeGroup(\`${dateField}\`, 1m) as time 
FROM \`${nodeData.database}\`.\`${nodeData.table}\`
WHERE $__timeFilter(\`${dateField}\`) 
GROUP BY time`,
                  );
                  _.set(query, 'keys.valueKey', ['cnt']);
                }
                form.setFieldsValue({
                  query,
                });
                executeQuery();
              })
              .catch(() => {
                message.warning(t('query.get_index_fail'));
                if (query.submode === 'raw') {
                  _.set(query, 'query', `select * from \`${nodeData.database}\`.\`${nodeData.table}\` WHERE $__timeFilter(\`timestamp\`) limit 20;`);
                } else if (query.submode === 'timeSeries') {
                  _.set(
                    query,
                    'query',
                    `SELECT count(*) as cnt, $__timeGroup(\`timestamp\`, 1m) as time 
FROM \`${nodeData.database}\`.\`${nodeData.table}\`
WHERE $__timeFilter(\`timestamp\`) 
GROUP BY time`,
                  );
                  _.set(query, 'keys.valueKey', ['cnt']);
                }
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
