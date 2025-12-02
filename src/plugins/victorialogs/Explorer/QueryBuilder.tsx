import React from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Form, Space, Input, Row, Col, InputNumber } from 'antd';

import { SIZE } from '@/utils/constant';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

import { NAME_SPACE } from '../constants';

interface Props {
  executeQuery: () => void;
}

export default function QueryBuilder(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { executeQuery } = props;

  return (
    <div>
      <Row gutter={SIZE}>
        <Col flex='auto'>
          <InputGroupWithFormItem label={<Space>{t('explorer.query')}</Space>}>
            <Form.Item
              name={['query', 'query']}
              rules={[
                {
                  required: true,
                  message: t('explorer.query_required'),
                },
              ]}
              initialValue='*'
            >
              <Input.TextArea onPressEnter={executeQuery} autoSize={{ minRows: 0 }} />
            </Form.Item>
          </InputGroupWithFormItem>
        </Col>
        <Col flex='none'>
          <InputGroupWithFormItem label={<Space>{t('explorer.limit')}</Space>}>
            <Form.Item name={['query', 'limit']} initialValue={500}>
              <InputNumber min={0} controls={false} />
            </Form.Item>
          </InputGroupWithFormItem>
        </Col>
      </Row>
    </div>
  );
}
