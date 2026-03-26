import React from 'react';
import { Form, Input, Row, Col, Button, Switch, Alert } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/es/form';
import { useTranslation } from 'react-i18next';

import { SIZE } from '@/utils/constant';

import { NS } from '../constants';
import ToolsList from './ToolsList';

interface Props {
  id?: number;
  form: FormInstance;
}

export default function FormCpt(props: Props) {
  const { t } = useTranslation(NS);
  const { id, form } = props;

  return (
    <Form form={form} layout='vertical'>
      <Row gutter={SIZE}>
        <Col flex='auto'>
          <Form.Item label={t('name')} name='name' rules={[{ required: true }]}>
            <Input placeholder={t('form.name_placeholder')} />
          </Form.Item>
        </Col>
        <Col flex='none'>
          <Form.Item label={t('enabled')} name='enabled' valuePropName='checked' initialValue={true}>
            <Switch />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label={t('description')} name='description'>
        <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} placeholder={t('form.description_placeholder')} />
      </Form.Item>
      <Form.Item label={t('url')} name='url' rules={[{ required: true }]}>
        <Input placeholder={t('form.url_placeholder')} />
      </Form.Item>
      <Form.Item label={t('form.headers')} tooltip={t('form.headers_tip')}>
        <Form.List name='headers'>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Row key={key} gutter={SIZE}>
                  <Col flex='auto'>
                    <Row gutter={SIZE}>
                      <Col span={12}>
                        <Form.Item {...restField} name={[name, 'key']} rules={[{ required: true, message: '' }]}>
                          <Input placeholder={t('form.headers_key')} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item {...restField} name={[name, 'value']} rules={[{ required: true, message: '' }]}>
                          <Input placeholder={t('form.headers_value')} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                  <Col flex='none'>
                    <Button type='text' onClick={() => remove(name)} icon={<MinusCircleOutlined />} />
                  </Col>
                </Row>
              ))}
              <Button className='w-full' type='dashed' onClick={() => add()} icon={<PlusOutlined />}>
                {t('form.add_header')}
              </Button>
            </>
          )}
        </Form.List>
      </Form.Item>
      <Alert message={t('form.help_title')} description={t('form.help_content')} type='info' />
      {id && <ToolsList id={id} />}
    </Form>
  );
}
