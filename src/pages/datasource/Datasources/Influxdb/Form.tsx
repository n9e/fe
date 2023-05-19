import React, { useEffect, useState, useRef } from 'react';
import { Form, InputNumber, Input, Row, Col, Select } from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import Name from '../../components/items/Name';
import Description from '../../components/items/Description';
import Footer from '../../components/items/Footer';
import { getServerClusters } from '../../services';

export default function FormCpt({ data, onFinish, submitLoading }: any) {
  const { t } = useTranslation('datasourceManage');
  const [form] = Form.useForm();
  const [clusters, setClusters] = useState<any[]>([]);
  const clusterRef = useRef<any>();
  const names = ['settings'];

  useEffect(() => {
    getServerClusters().then((res) => {
      setClusters(res);
    });
  }, []);

  return (
    <Form
      form={form}
      layout='vertical'
      onFinish={(values) => {
        onFinish(values, clusterRef.current);
      }}
      initialValues={data}
      className='settings-source-form'
    >
      <Name />
      <>
        <div className='page-title'>HTTP</div>
        <Form.Item label='URL' name={[...names, 'influxdb.addr']} rules={[{ required: true }]}>
          <Input placeholder='http://localhost:9090' />
        </Form.Item>
        <Form.Item label={t('form.timeout')} name={[...names, 'influxdb.timeout']} rules={[{ type: 'number', min: 0 }]} initialValue={10000}>
          <InputNumber style={{ width: '100%' }} controls={false} />
        </Form.Item>
      </>
      <>
        <div className='page-title'>{t('form.auth')}</div>
        <Form.Item noStyle name={[...names, 'influxdb.basic', 'influxdb.auth.enable']} initialValue={true} hidden>
          <div />
        </Form.Item>
        <Row gutter={16}>
          <Col flex={'1'}>
            <Form.Item label={t('form.username')} name={[...names, 'influxdb.basic', 'influxdb.user']}>
              <Input autoComplete='off' />
            </Form.Item>
          </Col>
          <Col flex={'1'}>
            <Form.Item label={t('form.password')} name={[...names, 'influxdb.basic', 'influxdb.password']}>
              <Input.Password autoComplete='new-password' />
            </Form.Item>
          </Col>
        </Row>
      </>
      <>
        <Form.List name={[...names, 'influxdb.headers']}>
          {(fields, { add, remove }) => (
            <>
              <div className='page-title' style={{ marginTop: '8px' }}>
                {t('form.headers')} <PlusCircleOutlined style={{ marginLeft: '16px', cursor: 'pointer', fontSize: '14px' }} onClick={() => add()} />
              </div>
              {fields.map(({ key, name }) => (
                <Row gutter={16} align='middle' key={key}>
                  <Col flex={1}>
                    <Form.Item label='Header' name={[name, 'key']}>
                      <Input placeholder='X-Custom-Header' />
                    </Form.Item>
                  </Col>
                  <Col flex={1}>
                    <Form.Item label='Value' name={[name, 'value']}>
                      <Input placeholder='Header Value' />
                    </Form.Item>
                  </Col>
                  <Col>
                    <MinusCircleOutlined style={{ cursor: 'pointer', fontSize: '14px', margin: '8px 16px 0 0' }} onClick={() => remove(name)} />
                  </Col>
                </Row>
              ))}
            </>
          )}
        </Form.List>
      </>
      <Form.Item label={t('form.cluster')} name='cluster_name'>
        <Select ref={clusterRef}>
          {_.map(clusters, (item) => {
            return (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            );
          })}
        </Select>
      </Form.Item>
      <Description />
      <div className='mt16'>
        <Footer id={data?.id} submitLoading={submitLoading} />
      </div>
    </Form>
  );
}
