import React, { useState } from 'react';
import { Row, Col, Form, Input, Tooltip, Select } from 'antd';
import { DownOutlined, RightOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

interface IProps {
  span?: number;
  prefixName?: string[] | number[];
}

function AdvancedSettings(props: IProps) {
  const { span = 6, prefixName = [] } = props;
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <span
          onClick={() => {
            setOpen(!open);
          }}
          style={{ cursor: 'pointer' }}
        >
          {open ? <DownOutlined /> : <RightOutlined />} 辅助配置
        </span>
      </div>
      <div style={{ display: open ? 'block' : 'none' }}>
        <Row gutter={8}>
          <Col span={span}>
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
              <Form.Item name={[...prefixName, 'query', 'keys', 'valueKey']} style={{ width: '100%' }}>
                <Select mode='tags' placeholder='回车输入多个' />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
          <Col span={span}>
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
              <Form.Item name={[...prefixName, 'query', 'keys', 'labelKey']} style={{ width: '100%' }}>
                <Select mode='tags' placeholder='回车输入多个' />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
          <Col span={span}>
            <InputGroupWithFormItem
              label={
                <span>
                  TimeKey{' '}
                  <Tooltip title={'指定哪个字段是时间字段，作为绘制曲线图的x轴坐标'}>
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              }
              labelWidth={100}
            >
              <Form.Item name={[...prefixName, 'query', 'keys', 'timeKey']} style={{ width: '100%' }} initialValue='Time'>
                <Input />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
          <Col span={span}>
            <InputGroupWithFormItem
              label={
                <span>
                  TimeFormat{' '}
                  <Tooltip title={'时间的格式，会根据此格式将时间转为时间戳'}>
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              }
              labelWidth={105}
            >
              <Form.Item name={[...prefixName, 'query', 'keys', 'timeFormat']} style={{ width: '100%' }} initialValue='%H:%i:%s'>
                <Input />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default AdvancedSettings;
