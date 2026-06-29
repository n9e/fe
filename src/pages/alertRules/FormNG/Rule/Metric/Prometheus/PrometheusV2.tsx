import React, { useContext } from 'react';
import { Form, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { IS_PLUS } from '@/utils/constant';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { FormStateContext } from '@/pages/alertRules/Form';
import QueryName, { generateQueryName } from '@/components/QueryName';
import PromQLInputNG from '@/components/PromQLInputNG';
import { AiButton } from '@/components/AiChatNG/FlashAiButton';
import { buildPageFrom, getExplorerPrompts } from '@/components/AiChatNG/recommend';
import FormItemLabel from '@/pages/alertRules/FormNG/components/FormItemLabel';
import CardContainer, { CardContainerHeader } from '@/pages/alertRules/FormNG/components/CardContainer';
import Triggers from '@/pages/alertRules/FormNG/components/Triggers';

import GraphPreview from './GraphPreview';
import AdvancedSettings from './components/AdvancedSettings';

interface Props {
  datasourceValue: number;
}

export default function PrometheusV2(props: Props) {
  const { datasourceValue } = props;
  const { t } = useTranslation('alertRules');
  const { i18n } = useTranslation();
  const { disabled } = useContext(FormStateContext);
  const form = Form.useFormInstance();
  const queries = Form.useWatch(['rule_config', 'queries']);

  return (
    <>
      <Form.List name={['rule_config', 'queries']}>
        {(fields, { add, remove }) => (
          <div>
            <FormItemLabel>{t('form_ng.query_statements')}</FormItemLabel>
            {fields.map((field) => (
              <CardContainer key={field.key} onClose={fields.length > 1 ? () => remove(field.name) : undefined}>
                <CardContainerHeader>
                  <div className='flex gap-2'>
                    <div className='flex-shrink-0'>
                      <Form.Item {...field} name={[field.name, 'ref']}>
                        <QueryName existingNames={_.map(queries, 'ref')} />
                      </Form.Item>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <InputGroupWithFormItem label='PromQL'>
                        <Form.Item
                          {...field}
                          name={[field.name, 'query']}
                          validateTrigger={['onBlur']}
                          trigger='onChange'
                          rules={[{ required: true, message: t('promQLInput:required') }]}
                        >
                          <PromQLInputNG readOnly={disabled} datasourceValue={datasourceValue} durationVariablesCompletion={false} />
                        </Form.Item>
                      </InputGroupWithFormItem>
                    </div>
                    <div className='flex-shrink-0'>
                      <AiButton
                        queryPageFrom={buildPageFrom({
                          param: {
                            datasource_type: 'prometheus',
                            datasource_id: datasourceValue,
                          },
                        })}
                        queryAction={{
                          key: 'query_generator',
                          param: {
                            datasource_type: 'prometheus',
                            datasource_id: datasourceValue,
                          },
                        }}
                        promptList={getExplorerPrompts(i18n.language)}
                        onExecuteQueryForQueryContent={(promql) => {
                          const ruleConfig = form.getFieldValue('rule_config') || {};
                          const nextQueries = [...(ruleConfig.queries || [])];
                          if (!nextQueries[field.name]) return;
                          nextQueries[field.name] = {
                            ...nextQueries[field.name],
                            query: promql,
                          };
                          form.setFieldsValue({
                            rule_config: {
                              ...ruleConfig,
                              queries: nextQueries,
                            },
                          });
                        }}
                      />
                    </div>
                  </div>
                </CardContainerHeader>
                {IS_PLUS && (
                  <div className='mb-4'>
                    <AdvancedSettings field={field} />
                  </div>
                )}
                <div>
                  <GraphPreview form={form} fieldName={field.name} promqlFieldName='query' />
                </div>
              </CardContainer>
            ))}
            <Button
              className='w-full'
              type='dashed'
              onClick={() => {
                add({
                  ref: generateQueryName(_.map(queries, 'ref')),
                  query: '',
                });
              }}
              icon={<PlusOutlined />}
            >
              {t('form_ng.query_statements')}
            </Button>
          </div>
        )}
      </Form.List>
      <div className='mt-4'>
        <Triggers prefixName={['rule_config']} queries={queries} disabled={disabled} />
      </div>
    </>
  );
}
