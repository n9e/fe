import React, { useContext } from 'react';
import { Form, Space, Row, Col, Button } from 'antd';
import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import QueryName, { generateQueryName } from '@/components/QueryName';
import LogQL from '@/components/LogQL';
import { DatasourceCateEnum, IS_PLUS } from '@/utils/constant';
import DocumentDrawer from '@/components/DocumentDrawer';
import FormItemLabel from '@/pages/alertRules/FormNG/components/FormItemLabel';
import CardContainer, { CardContainerHeader } from '@/pages/alertRules/FormNG/components/CardContainer';

import AdvancedSettings from '../../components/AdvancedSettings';
import { NAME_SPACE } from '../../constants';
import GraphPreview from './GraphPreview';

interface IProps {
  form: any;
  prefixField?: any;
  fullPrefixName?: string[]; // 完整的前置字段名，用于 getFieldValue 获取指定字段的值
  prefixName?: string[]; // 列表字段名
  disabled?: boolean;
  datasourceValue: number | number[];
}

export default function index({ form, prefixField = {}, fullPrefixName = [], prefixName = [], disabled, datasourceValue }: IProps) {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);
  const datasourceID = _.isArray(datasourceValue) ? datasourceValue[0] : datasourceValue;
  const queries = Form.useWatch(['rule_config', 'queries']);

  return (
    <>
      <Form.List
        {...prefixField}
        name={[...prefixName, 'queries']}
        initialValue={[
          {
            ref: 'A',
          },
        ]}
      >
        {(fields, { add, remove }) => (
          <div>
            <FormItemLabel>{t('alertRules:form_ng.query_statements')}</FormItemLabel>
            {fields.map((field) => {
              return (
                <CardContainer key={field.key} onClose={fields.length > 1 ? () => remove(field.name) : undefined}>
                  <CardContainerHeader>
                    <Row gutter={8}>
                      <Col flex='32px'>
                        <Form.Item {...field} name={[field.name, 'ref']} initialValue={generateQueryName(_.map(queries, 'ref'))}>
                          <QueryName existingNames={_.map(queries, 'ref')} />
                        </Form.Item>
                      </Col>
                      <Col flex='auto'>
                        <div className='tdengine-discover-query'>
                          <InputGroupWithFormItem
                            label={
                              <Space>
                                {t('query.query')}
                                <InfoCircleOutlined
                                  onClick={() => {
                                    DocumentDrawer({
                                      language: i18n.language,
                                      darkMode,
                                      title: t('common:page_help'),
                                      type: 'iframe',
                                      documentPath: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-rules/query-data/mysql/',
                                    });
                                  }}
                                />
                              </Space>
                            }
                          >
                            <Form.Item {...field} name={[field.name, 'sql']}>
                              <LogQL
                                datasourceCate={DatasourceCateEnum.mysql}
                                datasourceValue={datasourceID}
                                query={{}}
                                historicalRecords={[]}
                                placeholder={t('query.query_placeholder2')}
                              />
                            </Form.Item>
                          </InputGroupWithFormItem>
                        </div>
                      </Col>
                    </Row>
                  </CardContainerHeader>
                  <AdvancedSettings mode='graph' prefixField={field} prefixName={[field.name]} disabled={disabled} expanded showUnit={IS_PLUS} />
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue }) => {
                      const cate = getFieldValue('cate');
                      const query = getFieldValue([...fullPrefixName, ...prefixName, 'queries', field.name]);

                      return <GraphPreview cate={cate} datasourceValue={datasourceID} query={query} />;
                    }}
                  </Form.Item>
                </CardContainer>
              );
            })}
            <Button
              className='w-full'
              type='dashed'
              onClick={() => {
                add({
                  interval: 1,
                  interval_unit: 'min',
                });
              }}
              icon={<PlusOutlined />}
            >
              {t('alertRules:form_ng.query_statements')}
            </Button>
          </div>
        )}
      </Form.List>
    </>
  );
}
