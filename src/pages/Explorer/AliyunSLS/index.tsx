import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Radio, Space, Switch, Button, Form, Row, Col } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import _ from 'lodash';
import { DatasourceCateEnum } from '@/utils/constant';
import TimeRangePicker from '@/components/TimeRangePicker';
import ProjectSelect from './ProjectSelect';
import LogstoreSelect from './LogstoreSelect';
import QueryInput from './Query';
import Raw from './Raw';
import Metric from './Metric';
import './style.less';

interface IProps {
  datasourceCate: DatasourceCateEnum.aliyunSLS;
  datasourceName: string;
  headerExtra: HTMLDivElement | null;
  form: FormInstance;
}

const ModeRadio = ({ mode, setMode }) => {
  return (
    <Radio.Group
      value={mode}
      onChange={(e) => {
        setMode(e.target.value);
      }}
      buttonStyle='solid'
    >
      <Radio.Button value='timeSeries'>时序值</Radio.Button>
      <Radio.Button value='raw'>日志原文</Radio.Button>
    </Radio.Group>
  );
};

export default function index(props: IProps) {
  const { datasourceCate, datasourceName, headerExtra, form } = props;
  const [mode, setMode] = useState('timeSeries');
  const rawRef = useRef<any>();
  const metricRef = useRef<any>();
  const onExecute = () => {
    form.validateFields().then((values) => {
      cacheDefaultValues(values.query);
      if (mode === 'raw') {
        if (rawRef.current && rawRef.current.fetchData) {
          rawRef.current.fetchData(datasourceCate, datasourceName, values);
        }
      }
      if (mode === 'timeSeries') {
        if (metricRef.current && metricRef.current.fetchData) {
          metricRef.current.fetchData(datasourceCate, datasourceName, values);
        }
      }
    });
  };

  return (
    <div>
      {headerExtra ? (
        createPortal(<ModeRadio mode={mode} setMode={setMode} />, headerExtra)
      ) : (
        <div style={{ marginBottom: 10 }}>
          <ModeRadio mode={mode} setMode={setMode} />
        </div>
      )}
      <Row gutter={8}>
        <Col flex='auto'>
          <Row gutter={8}>
            <Col span={12}>
              <ProjectSelect width='100%' datasourceCate={datasourceCate} datasourceName={datasourceName} prefixName={['query']} />
            </Col>
            <Col span={12}>
              <Form.Item shouldUpdate noStyle>
                {({ getFieldValue }) => {
                  const project = getFieldValue(['query', 'project']);
                  return <LogstoreSelect width='100%' datasourceCate={datasourceCate} datasourceName={datasourceName} project={project} prefixName={['query']} />;
                }}
              </Form.Item>
            </Col>
          </Row>
        </Col>
        <Col flex='550px'>
          <Space style={{ display: 'flex' }}>
            <Form.Item name={['query', 'range']} initialValue={{ start: 'now-1h', end: 'now' }}>
              <TimeRangePicker dateFormat='YYYY-MM-DD HH:mm:ss' />
            </Form.Item>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ lineHeight: '32px' }}>SQL增强</div>
              <Form.Item name={['query', 'power_sql']} valuePropName='checked'>
                <Switch />
              </Form.Item>
            </div>
            <Form.Item>
              <Button type='primary' onClick={onExecute}>
                查询
              </Button>
            </Form.Item>
          </Space>
        </Col>
        <Col span={24}>
          <QueryInput width='100%' prefixName={['query']} />
        </Col>
      </Row>

      {mode === 'timeSeries' && <Metric ref={metricRef} />}
      {mode === 'raw' && <Raw ref={rawRef} form={form} />}
    </div>
  );
}

export const cacheDefaultValues = (query: any) => {
  let queryStr = '';
  try {
    queryStr = JSON.stringify(query);
    localStorage.setItem('explorer_aliyunsls_query', queryStr);
  } catch (e) {}
};

export const setDefaultValues = (form: FormInstance) => {
  const queryStr = localStorage.getItem('explorer_aliyunsls_query');
  let query = {};
  try {
    query = JSON.parse(queryStr || '{}');
    form.setFieldsValue({
      query: _.omit(query, ['range']),
    });
  } catch (e) {}
};
