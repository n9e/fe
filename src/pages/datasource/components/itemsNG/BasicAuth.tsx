import React from 'react';
import { Input, Form, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';

interface Props {
  cate: string;
}

export default function BasicAuth(props: Props) {
  const { t } = useTranslation('datasourceManage');
  const { cate } = props;

  return (
    <>
      <div className='page-title'>{t('form.auth')}</div>
      <Form.Item name={['settings', `${cate}.basic`, `${cate}.is_encrypt`]} hidden initialValue={false}>
        <div />
      </Form.Item>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label={t('form.username')} name={['settings', `${cate}.basic`, `${cate}.user`]}>
            <Input autoComplete='off' />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t('form.password')} name={['settings', `${cate}.basic`, `${cate}.password`]}>
            <Input.Password autoComplete='new-password' />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}
