import React from 'react';
import _ from 'lodash';
import { Form, Select, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

interface Props {
  field: any;
  tpls: any[];
}

export default function TplSettings(props: Props) {
  const { field, tpls } = props;
  const { t } = useTranslation('alertRules');

  return (
    <Row gutter={8}>
      <Col span={12}>
        <InputGroupWithFormItem label={t('task_tpls.tpl_id')}>
          <Form.Item
            {...field}
            name={[field.name, 'tpl_id']}
            rules={[
              {
                required: true,
                message: t('task_tpls.tpl_id_msg'),
              },
            ]}
          >
            <Select
              showSearch
              options={_.map(tpls, (item) => {
                return { label: item.title, value: item.id };
              })}
            />
          </Form.Item>
        </InputGroupWithFormItem>
      </Col>
      <Col span={12}>
        <InputGroupWithFormItem label={t('task_tpls.host')}>
          <Form.Item {...field} name={[field.name, 'host']}>
            <Select mode='tags' tokenSeparators={[' ']} open={false} placeholder={t('task_tpls.host_placeholder')} />
          </Form.Item>
        </InputGroupWithFormItem>
      </Col>
    </Row>
  );
}
