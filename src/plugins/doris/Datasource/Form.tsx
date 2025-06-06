import React, { useEffect, useRef } from 'react';
import { Form, Input, InputNumber, Row, Col, Card } from 'antd';
import _ from 'lodash';
import Name from '@/pages/datasource/components/items/Name';
import Description from '@/pages/datasource/components/items/Description';
import Footer from '@/pages/datasource/components/items/Footer';
import HTTP from '@/pages/datasource/components/items/HTTP';
import { useTranslation } from 'react-i18next';
import Cluster from '@/pages/datasource/components/items/Cluster';
import BasicAuth from '@/pages/datasource/components/items/BasicAuth';

interface IProps {
  data: any;
  onFinish: (values: any) => void;
  submitLoading: boolean;
}
export const formatInitVal = (val: any, type: string) => {
  const tempVal = _.cloneDeep(val);

  if (!_.isEmpty(tempVal.settings[`${type}.headers`])) {
    let tempHeaders = _.keys(tempVal.settings[`${type}.headers`]).map((el) => {
      return {
        key: el,
        value: tempVal.settings[`${type}.headers`][el + ''],
      };
    });

    tempVal.settings[`${type}.headers`] = tempHeaders;
  } else {
    tempVal.settings[`${type}.headers`] = [];
  }

  return tempVal;
};
export default function Doris(props: any) {
  const { t } = useTranslation('datasourceManage');
  const { action, data, onFinish, submitLoading } = props;
  const [form] = Form.useForm();
  const clusterRef = useRef<any>();
  useEffect(() => {
    data?.settings && form.setFieldsValue(formatInitVal(data, 'doris'));
  }, [data]);
  return (
    <Form
      form={form}
      layout='vertical'
      onFinish={onFinish} // data={_.merge({}, formatInitVal(props.data))}
      className='settings-source-form'
    >
      <Card title={t(`datasourceManage:${action}_title`)}>
        <Name />
        <div className='page-title'>FE node</div>
        <Form.Item
          label='URL'
          name={['settings', 'doris.addr']}
          rules={[
            { required: true },
            {
              validator: (_, value) => (!value.includes(' ') ? Promise.resolve() : Promise.reject(new Error(t('form.url_no_spaces_msg')))),
            },
          ]}
        >
          <Input placeholder={'localhost:9030'} />
        </Form.Item>
        <Form.Item label={t('form.timeout')} name={['settings', 'doris.timeout']} rules={[{ type: 'number', min: 0 }]} initialValue={10000}>
          <InputNumber style={{ width: '100%' }} controls={false} />
        </Form.Item>
        <div className='page-title'>{t('form.auth')}</div>
        <Row gutter={16}>
          <Col flex={'1'}>
            <Form.Item label={t('form.username')} name={['settings', 'doris.user']}>
              <Input autoComplete='off' />
            </Form.Item>
          </Col>
          <Col flex={'1'}>
            <Form.Item label={t('form.password')} name={['settings', 'doris.password']}>
              <Input.Password autoComplete='new-password' />
            </Form.Item>
          </Col>
        </Row>
        <Cluster clusterRef={clusterRef} form={form} />
        <Description />
      </Card>
      <Footer id={data?.id} submitLoading={submitLoading} />
    </Form>
  );
}
