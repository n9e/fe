import React, { useContext } from 'react';
import { Form, Space, Tooltip, Radio, Row, Col, Button } from 'antd';
import { QuestionCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Trans, useTranslation } from 'react-i18next';
import _ from 'lodash';

import PromQLInputNG from '@/components/PromQLInputNG';
import Severity from '@/pages/alertRules/Form/components/Severity';
import Inhibit from '@/pages/alertRules/Form/components/Inhibit';
import { FormStateContext } from '@/pages/alertRules/Form';
import RadioCard from '@/pages/alertRules/FormNG/components/RadioCard';
import FormItemLabel from '@/pages/alertRules/FormNG/components/FormItemLabel';
import CardContainer, { CardContainerHeader } from '@/pages/alertRules/FormNG/components/CardContainer';
import { IS_PLUS } from '@/utils/constant';
import { AiButton } from '@/components/AiChatNG/FlashAiButton';
import { buildPageFrom, getExplorerPrompts } from '@/components/AiChatNG/recommend';

import GraphPreview from './GraphPreview';
import PrometheusV2 from './PrometheusV2';
import VariablesConfig from './VariablesConfig';
import ChildVariablesConfigs from './VariablesConfig/ChildVariablesConfigs';
import AdvancedSettings from './components/AdvancedSettings';
import './style.less';

export default function index(props: { datasourceCate: string; datasourceValue: number }) {
  const { datasourceValue } = props;
  const { t } = useTranslation('alertRules');
  const { i18n } = useTranslation();
  const { disabled } = useContext(FormStateContext);
  const form = Form.useFormInstance();
  const ruleConfigVersion = Form.useWatch(['rule_config', 'version']);

  return (
    <>
      {IS_PLUS && (
        <Form.Item
          label={
            <Space>
              {t('ruleConfigPromVersion')}
              <Tooltip
                title={
                  <Trans
                    ns='alertRules'
                    i18nKey='ruleConfigPromVersion_tip'
                    components={{
                      br: <br />,
                    }}
                  />
                }
              >
                <QuestionCircleOutlined />
              </Tooltip>
            </Space>
          }
          name={['rule_config', 'version']}
          initialValue='v1'
        >
          <Radio.Group
            disabled={disabled}
            className='!grid grid-cols-1 md:grid-cols-2 gap-3 w-full'
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'v2') {
                const rule_config = form.getFieldValue('rule_config');
                form.setFieldsValue({
                  rule_config: {
                    ...rule_config,
                    queries: [
                      {
                        ref: 'A',
                        query: '',
                      },
                    ],
                    triggers: [
                      {
                        mode: 0,
                        expressions: [
                          {
                            ref: 'A',
                            comparisonOperator: '>',
                            value: 0,
                            logicalOperator: '&&',
                          },
                        ],
                        severity: 2,
                      },
                    ],
                  },
                });
              }
            }}
          >
            <RadioCard value='v1' disabled={disabled} label={t('ruleConfigPromVersion_v1')} description={t('ruleConfigPromVersion_v1_description')} />
            <RadioCard value='v2' disabled={disabled} label={t('ruleConfigPromVersion_v2')} description={t('ruleConfigPromVersion_v2_description')} />
          </Radio.Group>
        </Form.Item>
      )}
      {ruleConfigVersion === 'v2' ? (
        <PrometheusV2 {...props} />
      ) : (
        <Form.List name={['rule_config', 'queries']}>
          {(fields, { add, remove }) => (
            <div>
              <FormItemLabel>
                <Space>
                  <span>{t('form_ng.queries_and_threshold')}</span>
                  <Inhibit triggersKey='queries' />
                </Space>
              </FormItemLabel>
              <div>
                {fields.map((field) => (
                  <CardContainer key={field.key} onClose={fields.length > 1 ? () => remove(field.name) : undefined}>
                    <CardContainerHeader>
                      <VariablesConfig prefixName={['rule_config', 'queries']} field={field} />
                    </CardContainerHeader>
                    <Row gutter={8} wrap={false}>
                      <Col flex='auto' className='min-w-0'>
                        <Form.Item
                          {...field}
                          name={[field.name, 'prom_ql']}
                          validateTrigger={['onBlur']}
                          trigger='onChange'
                          rules={[{ required: true, message: t('promQLInput:required') }]}
                        >
                          <PromQLInputNG readOnly={disabled} datasourceValue={datasourceValue} showBuiltinMetrics durationVariablesCompletion={false} />
                        </Form.Item>
                      </Col>
                      <Col flex='none'>
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
                            const queries = [...(ruleConfig.queries || [])];
                            const queryFieldName = ruleConfigVersion === 'v2' ? 'query' : 'prom_ql';

                            if (!queries[field.name]) {
                              return;
                            }

                            queries[field.name] = {
                              ...queries[field.name],
                              [queryFieldName]: promql,
                            };

                            form.setFieldsValue({
                              rule_config: {
                                ...ruleConfig,
                                queries,
                              },
                            });
                          }}
                        />
                      </Col>
                    </Row>
                    <ChildVariablesConfigs
                      topPrefixName={['rule_config', 'queries']}
                      topField={field}
                      prefixName={['rule_config', 'queries', field.name, 'var_config', 'child_var_configs']}
                      level={1}
                    />
                    <div className='mb-4'>
                      <Severity field={field} />
                    </div>
                    {IS_PLUS && <AdvancedSettings field={field} />}
                    <div className='mt-4'>
                      <GraphPreview form={form} fieldName={field.name} />
                    </div>
                  </CardContainer>
                ))}
              </div>
              <Button
                className='w-full'
                type='dashed'
                onClick={() =>
                  add({
                    prom_ql: '',
                    severity: 2,
                  })
                }
                icon={<PlusOutlined />}
              >
                {t('form_ng.queries_and_threshold')}
              </Button>
            </div>
          )}
        </Form.List>
      )}
    </>
  );
}
