import React, { useState, useEffect, useContext } from 'react';
import _ from 'lodash';
import { useDebounceFn } from 'ahooks';
import { Form, Row, Col, AutoComplete } from 'antd';
import { useTranslation } from 'react-i18next';
import { CommonStateContext } from '@/App';
import IndexSelect from '@/pages/dashboard/Editor/QueryEditor/Elasticsearch/IndexSelect';
import { getFullFields, Field } from '@/pages/explorer/Elasticsearch/services';
import { replaceExpressionVars } from '../../constant';

export default function index(props) {
  const { vars, id } = props;
  const { datasourceList } = useContext(CommonStateContext);
  const { t } = useTranslation('dashboard');
  const [dateFields, setDateFields] = useState<Field[]>([]);
  const form = Form.useFormInstance();
  let datasourceValue = Form.useWatch(['datasource', 'value']);
  datasourceValue = replaceExpressionVars({
    text: datasourceValue,
    variables: vars,
    limit: vars.length,
    dashboardId: id,
    datasourceList,
  });
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
  );
}
