import React, { useState } from 'react';
import { Row, Col, Form, Select, Button, Input, InputNumber } from 'antd';
import { VerticalRightOutlined, VerticalLeftOutlined } from '@ant-design/icons';
import { groupByCates } from './configs';

export default function Terms({ prefixField }) {
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
                  <span className='ant-input-group-addon'>步长</span>
                  <Form.Item {...prefixField} name={[prefixField.name, 'size']} noStyle>
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                </Input.Group>
              </Col>
              <Col span={6}>
                <Input.Group>
                  <span className='ant-input-group-addon'>文档最小值</span>
                  <Form.Item {...prefixField} name={[prefixField.name, 'min_value']} noStyle>
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
          高级设置 {expanded ? <VerticalLeftOutlined /> : <VerticalRightOutlined />}
        </Button>
      </Col>
    </Row>
  );
}
