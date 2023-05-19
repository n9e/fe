import React from 'react';
import { Col, Form, Input, Row } from 'antd';

export default function Auth({ namePrefix, type }) {
  return (
    <>
      <div className='page-title'>授权</div>
      <Row gutter={16}>
        <Col flex={'1'}>
          <Form.Item label='AccessKey ID' name={[...namePrefix, `${type}.access_key_id`]} rules={[{ required: true }]}>
            <Input placeholder='请输入AccessKey ID' />
          </Form.Item>
        </Col>
        <Col flex={'1'}>
          <Form.Item label='AccessKey Secret' name={[...namePrefix, `${type}.access_key_secret`]} rules={[{ required: true }]}>
            <Input placeholder='请输入AccessKey Secret' />
          </Form.Item>
        </Col>
        <Col>
          <div style={{ width: '30px' }}></div>
        </Col>
      </Row>
    </>
  );
}
