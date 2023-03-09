import React, { useState } from 'react';
import { Form, InputNumber, Select, Checkbox, Space } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';

export default function index() {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const names = ['rule_config', 'algo_params'];

  return (
    <>
      <Form.Item label='使用算法' name={['rule_config', 'algorithm']} hidden>
        <Select>
          <Select.Option value='holtwinters'>holtwinters</Select.Option>
        </Select>
      </Form.Item>
      <Space style={{ marginBottom: 10 }}>
        高级配置
        <a onClick={() => setSettingsVisible(!settingsVisible)}>{settingsVisible ? '收起' : '展开'}</a>
      </Space>
      <div
        style={{
          display: settingsVisible ? 'block' : 'none',
        }}
      >
        <div>
          季节性周期时间为：
          <Form.Item noStyle name={[...names, 'seasonal_duration']}>
            <Select style={{ width: 100 }}>
              <Select.Option value={3600}>小时</Select.Option>
              <Select.Option value={86400}>天</Select.Option>
              <Select.Option value={604800}>周</Select.Option>
              <Select.Option value={2592000}>月</Select.Option>
            </Select>
          </Form.Item>{' '}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 10 }}>
          <div style={{ marginRight: 16 }}>偏离</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <Form.Item
                noStyle
                name={[...names, 'upper_bound']}
                valuePropName='checked'
                getValueFromEvent={(e) => {
                  return e.target.checked ? 1 : 0;
                }}
              >
                <Checkbox>上界</Checkbox>
              </Form.Item>
              <Form.Item noStyle name={[...names, 'upper_times_num']}>
                <InputNumber />
              </Form.Item>{' '}
              倍误差
            </div>
            <div>
              <Form.Item
                noStyle
                name={[...names, 'lower_bound']}
                valuePropName='checked'
                getValueFromEvent={(e) => {
                  return e.target.checked ? 1 : 0;
                }}
              >
                <Checkbox>下界</Checkbox>
              </Form.Item>
              <Form.Item noStyle name={[...names, 'lower_times_num']}>
                <InputNumber />
              </Form.Item>{' '}
              倍误差
            </div>
          </div>
        </div>
        <div>
          <Form.List name={[...names, 'compares']}>
            {(fields, { add, remove }) => (
              <>
                <div style={{ marginBottom: 10 }}>
                  同环比{' '}
                  <PlusCircleOutlined
                    onClick={() => {
                      add({
                        operator: 1,
                        offset: 86400,
                        bound_type: 0,
                      });
                    }}
                  />
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 10 }} align='baseline'>
                    <Form.Item {...restField} name={[name, 'operator']}>
                      <Select>
                        <Select.Option value={1}>且</Select.Option>
                        <Select.Option value={0}>或</Select.Option>
                      </Select>
                    </Form.Item>
                    <span>相比</span>
                    <Form.Item {...restField} name={[name, 'offset']}>
                      <Select>
                        <Select.Option value={1 * 86400}>1</Select.Option>
                        <Select.Option value={2 * 86400}>2</Select.Option>
                        <Select.Option value={3 * 86400}>3</Select.Option>
                        <Select.Option value={4 * 86400}>4</Select.Option>
                        <Select.Option value={5 * 86400}>5</Select.Option>
                        <Select.Option value={6 * 86400}>6</Select.Option>
                        <Select.Option value={7 * 86400}>7</Select.Option>
                      </Select>
                    </Form.Item>
                    <span>天前同时期</span>
                    <Form.Item {...restField} name={[name, 'bound_type']}>
                      <Select>
                        <Select.Option value={0}>偏离</Select.Option>
                        <Select.Option value={1}>上升</Select.Option>
                        <Select.Option value={2}>下降</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'value']}>
                      <InputNumber />
                    </Form.Item>
                    {' %'}
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
              </>
            )}
          </Form.List>
        </div>
      </div>
    </>
  );
}
