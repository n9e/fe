import React, { useContext, useState, useEffect } from 'react';
import { Form, Input, Space, Tooltip, Row, Col, AutoComplete } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { useDebounceFn } from 'ahooks';

import { CommonStateContext } from '@/App';
import DocumentDrawer from '@/components/DocumentDrawer';
import IndexSelect from '@/pages/dashboard/Editor/QueryEditor/Elasticsearch/IndexSelect';
import { getFullFields, Field } from '@/pages/explorer/Elasticsearch/services';

export default function VariableQuerybuilder() {
  const { t, i18n } = useTranslation('dashboard');
  const { darkMode } = useContext(CommonStateContext);
  const [dateFields, setDateFields] = useState<Field[]>([]);
  const form = Form.useFormInstance();
  const datasourceValue = Form.useWatch(['datasource', 'value']);
  const definition = Form.useWatch(['definition']);
  const indexValue = Form.useWatch(['config', 'index']);

  const { run: onIndexChange } = useDebounceFn(
    (val) => {
      if (datasourceValue && val) {
        getFullFields(datasourceValue, val, {
          type: 'date',
        }).then((res) => {
          setDateFields(res.fields);
          const config = form.getFieldValue('config');
          const dateField = _.find(res.fields, { name: config.date_field })?.name;
          const defaultDateField = _.find(res.fields, { name: '@timestamp' })?.name || res.fields[0]?.name;
          form.setFieldsValue({
            config: {
              ...config,
              date_field: config.date_field || dateField || defaultDateField,
            },
          });
        });
      }
    },
    {
      wait: 500,
    },
  );

  useEffect(() => {
    if (indexValue) {
      onIndexChange(indexValue);
    }
  }, [indexValue]);

  return (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <IndexSelect name={['config', 'index']} cate='elasticsearch' datasourceValue={datasourceValue} />
        </Col>
        <Col span={12}>
          <Form.Item label={t('datasource:es.date_field')} name={['config', 'date_field']} rules={[{ required: true, message: t('datasource:es.date_field_msg') }]}>
            <AutoComplete
              dropdownMatchSelectWidth={false}
              showSearch
              options={_.map(dateFields, (item) => {
                return {
                  label: item.name,
                  value: item.name,
                };
              })}
            />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        label={
          <Space size={4}>
            {t('var.definition')}
            <Tooltip title={t('common:click_to_view_doc')}>
              <QuestionCircleOutlined
                onClick={() => {
                  DocumentDrawer({
                    language: i18n.language,
                    darkMode,
                    title: t('var.definition'),
                    documentPath: '/docs/dashboards/variables/query/elasticsearch',
                  });
                }}
              />
            </Tooltip>
          </Space>
        }
        name='definition'
        rules={[
          () => ({
            validator(_) {
              if (definition) {
                try {
                  JSON.parse(definition);
                  return Promise.resolve();
                } catch (e) {
                  return Promise.reject(t('var.definition_msg2'));
                }
              } else {
                return Promise.reject(new Error(t('var.definition_msg1')));
              }
            },
          }),
        ]}
        required
      >
        <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
      </Form.Item>
    </>
  );
}
