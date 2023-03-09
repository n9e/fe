import React, { useState } from 'react';
import { Row, Col, Form, Select, Tooltip } from 'antd';
import { DownOutlined, RightOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

interface IProps {
  prefixField?: any;
}

export default function AdvancedSettings(props: IProps) {
  const { prefixField = {} } = props;
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  return (
    <div style={{ marginBottom: advancedSettingsOpen ? 0 : 16 }}>
      <div style={{ marginBottom: 8 }}>
        <span
          onClick={() => {
            setAdvancedSettingsOpen(!advancedSettingsOpen);
          }}
          style={{ cursor: 'pointer' }}
        >
          {advancedSettingsOpen ? <DownOutlined /> : <RightOutlined />} 辅助配置
        </span>
      </div>
      <div style={{ display: advancedSettingsOpen ? 'block' : 'none' }}>
        <Row gutter={8}>
          <Col span={6}>
            <InputGroupWithFormItem
              label={
                <span>
                  ValueKey{' '}
                  <Tooltip
                    title={
                      '通过此字段从返回结果中提取的数值。例如 查询条件为 `* | select count(1) as PV` 返回结果为 PV:11，ValueKey 写了 PV，则会根据 PV 提取到 11，作为查询结果的值'
                    }
                  >
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              }
              labelWidth={100}
            >
              <Form.Item {...prefixField} name={[prefixField.name, 'keys', 'valueKey']} style={{ width: '100%' }}>
                <Select mode='tags' placeholder='回车输入多个' />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
          <Col span={6}>
            <InputGroupWithFormItem
              label={
                <span>
                  LabelKey{' '}
                  <Tooltip
                    title={
                      '将此字段以及期对应的 value，作为tag，追加到监控数据的标签中，例如 查询条件为  `* | select count(1) as PV group by host` 返回结果为 `[{PV:11 host:dev01},{PV:10 host:dev02}]`, LabelKey 写了 host, 则第一条返回数据 host=dev01 会作为tag'
                    }
                  >
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              }
              labelWidth={100}
            >
              <Form.Item {...prefixField} name={[prefixField.name, 'keys', 'labelKey']} style={{ width: '100%' }}>
                <Select mode='tags' placeholder='回车输入多个' />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
        </Row>
      </div>
    </div>
  );
}
