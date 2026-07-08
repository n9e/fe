import React, { useState } from 'react';
import { Row, Col, Form, Select, Button, Input, InputNumber } from 'antd';
import { VerticalRightOutlined, VerticalLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { groupByCates } from './configs';

export default function Terms({ prefixField }) {
  const { t } = useTranslation('alertRules');
  const [expanded, setExpanded] = useState(false);
  return (
    <Row gutter={16}>
      <Col flex='auto'>
        <Row gutter={16}>
          <Col span={expanded ? 6 : 12}>
            <Form.Item {...prefixField} name={[prefixField.name, 'cate']} noStyle>
              <Select style={{ width: '100%' }}>
                {groupByCates.map((func) => (
                  <Select.Option key={func} value={func}>
                    {func}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={expanded ? 6 : 12}>
            <Form.Item {...prefixField} name={[prefixField.name, 'field']} noStyle>
              <Input placeholder='Field key' />
            </Form.Item>
          </Col>
          {expanded && (
            <>
              <Col span={6}>
                <Input.Group>
                  <span className='ant-input-group-addon'>{t('datasource:es.histogram.interval')}</span>
                  <Form.Item {...prefixField} name={[prefixField.name, 'size']} noStyle>
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                </Input.Group>
              </Col>
              <Col span={6}>
                <Input.Group>
                  <span className='ant-input-group-addon'>{t('datasource:es.terms.min_doc_count')}</span>
                  <Form.Item {...prefixField} name={[prefixField.name, 'min_doc_count']} noStyle>
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                </Input.Group>
              </Col>
            </>
          )}
        </Row>
      </Col>
      <Col flex='88px'>
        <Button
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          {t('datasource:es.terms.more')} {expanded ? <VerticalLeftOutlined /> : <VerticalRightOutlined />}
        </Button>
      </Col>
    </Row>
  );
}
