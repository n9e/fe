import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Input, Space, Select, InputNumber } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { ops, functions, functionsNameMap } from './configs';

export default function Rule({ restField, name, queryValues, form, defaultRuleOp }) {
  const [ruleOp, setRuleOp] = useState(defaultRuleOp || 'AND');

  useEffect(() => {
    setRuleOp(defaultRuleOp || 'AND');
  }, [defaultRuleOp]);

  function renderQueryAndFunc(subName) {
    return (
      <Input.Group>
        <span className='ant-input-group-addon'>
          <Form.Item noStyle {...restField} name={[subName, 'value']}>
            <Select>
              {_.map(queryValues, (item) => {
                return (
                  <Select.Option key={item.ref} value={item.ref}>
                    {item.ref}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </span>
        <Form.Item noStyle {...restField} name={[subName, 'func']}>
          <Select style={{ width: '100%' }}>
            {_.map(functions, (item) => {
              return (
                <Select.Option key={item} value={item}>
                  {functionsNameMap[item]}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
      </Input.Group>
    );
  }
  function renderOp(subName) {
    return (
      <Form.Item noStyle {...restField} name={[subName, 'op']}>
        <Select style={{ width: '100%' }}>
          {_.map(ops, (item) => {
            return (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            );
          })}
        </Select>
      </Form.Item>
    );
  }
  function renderThreshold(subName) {
    return (
      <Form.Item noStyle {...restField} name={[subName, 'threshold']}>
        <InputNumber style={{ width: '100%' }} placeholder='阈值' />
      </Form.Item>
    );
  }
  function renderRuleOp() {
    return (
      <Form.Item noStyle>
        <Select
          value={ruleOp}
          onChange={(val) => {
            setRuleOp(val);
            form.setFields([
              {
                name: ['query', 'rules', name, 'rule_op'],
                value: val,
              },
            ]);
          }}
        >
          <Select.Option value='AND'>AND</Select.Option>
          <Select.Option value='OR'>OR</Select.Option>
        </Select>
      </Form.Item>
    );
  }
  return (
    <Form.List {...restField} name={[name, 'rule']}>
      {(fields, { add, remove }) => {
        return (
          <div>
            {fields.map(({ key, name: subName }, index) => {
              return (
                <Row gutter={16} key={key} style={{ marginBottom: 16 }}>
                  <Col flex='auto'>
                    <Form.Item shouldUpdate noStyle>
                      {({ getFieldValue }) => {
                        const func = getFieldValue(['query', 'rules', name, 'rule', subName, 'func']);
                        if (func === 'cur') {
                          return (
                            <Row gutter={16}>
                              <Col span={7}>{renderQueryAndFunc(subName)}</Col>
                              <Col span={7}>{renderOp(subName)}</Col>
                              <Col span={8}>{renderThreshold(subName)}</Col>
                              <Col span={2}>{renderRuleOp()}</Col>
                            </Row>
                          );
                        }
                        if (_.includes(['diff', 'diff_abs', 'diff_percent', 'diff_percent_abs'], func)) {
                          return (
                            <Row gutter={16}>
                              <Col span={6}>{renderQueryAndFunc(subName)}</Col>
                              <Col span={5}>{renderOp(subName)}</Col>
                              <Col span={5}>{renderThreshold(subName)}</Col>
                              <Col span={6}>
                                <Input.Group>
                                  <span className='ant-input-group-addon'>相比</span>
                                  <Form.Item shouldUpdate noStyle>
                                    {({ getFieldValue }) => {
                                      const compare_time_unit = getFieldValue(['query', 'rules', name, 'rule', subName, 'compare_time_unit']);
                                      const maxMap = {
                                        min: 59,
                                        hour: 23,
                                        day: undefined,
                                      };
                                      return (
                                        <Form.Item name={[subName, 'compare_time']} noStyle>
                                          <InputNumber style={{ width: '100%' }} min={1} max={maxMap[compare_time_unit]} />
                                        </Form.Item>
                                      );
                                    }}
                                  </Form.Item>
                                  <span className='ant-input-group-addon'>
                                    <Form.Item name={[subName, 'compare_time_unit']} noStyle initialValue='min'>
                                      <Select>
                                        <Select.Option value='min'>分</Select.Option>
                                        <Select.Option value='hour'>小时</Select.Option>
                                        <Select.Option value='day'>天</Select.Option>
                                      </Select>
                                    </Form.Item>
                                  </span>
                                </Input.Group>
                              </Col>
                              <Col span={2}>{renderRuleOp()}</Col>
                            </Row>
                          );
                        }
                        if (func === 'query_percent') {
                          return (
                            <Row gutter={16}>
                              <Col span={6}>{renderQueryAndFunc(subName)}</Col>
                              <Col span={5}>{renderOp(subName)}</Col>
                              <Col span={5}>{renderThreshold(subName)}</Col>
                              <Col span={6}>
                                <Input.Group>
                                  <span className='ant-input-group-addon'>占比</span>
                                  <Form.Item name={[subName, 'compare_query']} noStyle>
                                    <InputNumber style={{ width: '100%' }} />
                                  </Form.Item>
                                </Input.Group>
                              </Col>
                              <Col span={2}>{renderRuleOp()}</Col>
                            </Row>
                          );
                        }
                        if (func === 'nodata') {
                          return (
                            <Row gutter={16}>
                              <Col span={22}>{renderQueryAndFunc(subName)}</Col>
                              <Col span={2}>{renderRuleOp()}</Col>
                            </Row>
                          );
                        }
                      }}
                    </Form.Item>
                  </Col>
                  <Col flex='40px' style={{ display: 'flex', alignItems: 'center' }}>
                    <Space>
                      <PlusCircleOutlined
                        style={{
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          add({
                            value: 'A',
                            func: functions[0],
                            op: ops[0],
                          });
                        }}
                      />
                      {fields.length > 1 && (
                        <MinusCircleOutlined
                          style={{
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            remove(name);
                          }}
                        />
                      )}
                    </Space>
                  </Col>
                </Row>
              );
            })}
          </div>
        );
      }}
    </Form.List>
  );
}
