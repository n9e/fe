import React from 'react';
import { Form, Row, Col, Input, Select } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import Rule from './Rule';
import { ops, functions } from './configs';

export const severityMap = ['一级告警', '二级告警', '三级告警'];

export default function index({ form }) {
  return (
    <Form.Item shouldUpdate noStyle>
      {({ getFieldValue }) => {
        const queryValues = getFieldValue(['query', 'values']);
        return (
          <Form.List name={['query', 'rules']}>
            {(fields, { add, remove }) => (
              <div>
                <div style={{ marginBottom: 8 }}>
                  告警条件{' '}
                  <PlusCircleOutlined
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      add({
                        rule: [
                          {
                            value: 'A',
                            func: functions[0],
                            op: ops[0],
                          },
                        ],
                        rule_op: 'AND',
                        severity: 1,
                      });
                    }}
                  />
                </div>
                {fields.map(({ key, name, ...restField }) => {
                  const ruleOp = getFieldValue(['query', 'rules', name, 'rule_op']);
                  return (
                    <div key={key} style={{ marginBottom: 16 }}>
                      <Row gutter={16}>
                        <Col flex='auto'>
                          <div
                            style={{
                              backgroundColor: '#FAFAFA',
                              padding: 16,
                            }}
                          >
                            <Rule restField={restField} name={name} queryValues={queryValues} form={form} defaultRuleOp={ruleOp} />
                            <Input.Group>
                              <span className='ant-input-group-addon'>触发</span>
                              <Form.Item name={[name, 'severity']} noStyle>
                                <Select style={{ width: '100%' }}>
                                  <Select.Option value={1}>一级告警</Select.Option>
                                  <Select.Option value={2}>二级告警</Select.Option>
                                  <Select.Option value={3}>三级告警</Select.Option>
                                </Select>
                              </Form.Item>
                            </Input.Group>
                            <Form.Item name={[name, 'rule_op']} noStyle hidden>
                              <div />
                            </Form.Item>
                          </div>
                        </Col>
                        {fields.length > 1 && (
                          <Col flex='40px' style={{ display: 'flex', alignItems: 'center' }}>
                            <div
                              onClick={() => {
                                remove(name);
                              }}
                            >
                              <MinusCircleOutlined style={{ cursor: 'pointer' }} />
                            </div>
                          </Col>
                        )}
                      </Row>
                    </div>
                  );
                })}
              </div>
            )}
          </Form.List>
        );
      }}
    </Form.Item>
  );
}
