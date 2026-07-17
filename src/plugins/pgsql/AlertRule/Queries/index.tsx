import React, { useContext } from 'react';
import { Form, Space, Row, Col, Button, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CardContainer, { CardContainerHeader } from '@/pages/alertRules/FormNG/components/CardContainer';
import FormItemLabel from '@/pages/alertRules/FormNG/components/FormItemLabel';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { SqlMonacoEditor } from '@fc-components/monaco-editor';
import { WandSparkles } from 'lucide-react';
import { IS_PLUS } from '@/utils/constant';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import QueryName, { generateQueryName } from '@/components/QueryName';

import { NAME_SPACE, QUERY_KEY } from '../../constants';
import AdvancedSettings from '../../components/AdvancedSettings';
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
  const { t } = useTranslation(NAME_SPACE);
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
            <FormItemLabel>{t('datasource:query.title')}</FormItemLabel>
            {fields.map((field, index) => {
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
                          <InputGroupWithFormItem label={<Space>{t('query.query')}</Space>}>
                            <Form.Item
                              {...field}
                              name={[field.name, QUERY_KEY]}
                              validateTrigger={['onBlur']}
                              trigger='onChange'
                              rules={[{ required: true, message: t('datasource:query.query_required') }]}
                            >
                              <SqlMonacoEditor
                                disabled={disabled}
                                maxHeight={200}
                                placeholder='SELECT count(*) as count FROM db_name.table_name'
                                theme={darkMode ? 'dark' : 'light'}
                                enableAutocomplete={true}
                                enableFormat
                                renderFormatButton={() => {
                                  return (
                                    <Tooltip title={t('common:format_sql')}>
                                      <Button size='small' type='text' icon={<WandSparkles size={12} strokeWidth={1} />} />
                                    </Tooltip>
                                  );
                                }}
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
              {t('datasource:query.title')}
            </Button>
          </div>
        )}
      </Form.List>
    </>
  );
}
