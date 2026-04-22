import React from 'react';
import { Form, Input, Collapse, Row, Col, Button, Switch } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/es/form';
import { useTranslation } from 'react-i18next';

import { SIZE } from '@/utils/constant';

import { NS } from '../constants';

import './style.less';

interface Props {
  form: FormInstance;
}

export default function FormCpt(props: Props) {
  const { t } = useTranslation(NS);
  const { form } = props;

  return (
    <Form form={form} layout='vertical'>
      <Row gutter={SIZE}>
        <Col flex='auto'>
          <Form.Item label={t('form.name')} name='name' rules={[{ required: true }]}>
            <Input placeholder={t('form.name_placeholder')} />
          </Form.Item>
        </Col>
        <Col flex='none'>
          <Form.Item label={t('form.enabled')} name='enabled' valuePropName='checked' initialValue={true}>
            <Switch />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label={t('form.description')} name='description'>
        <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} placeholder={t('form.description_placeholder')} />
      </Form.Item>
      <Form.Item label={t('form.instructions')} name='instructions' rules={[{ required: true }]}>
        <Input.TextArea autoSize={{ minRows: 6, maxRows: 12 }} placeholder={t('form.instructions_placeholder')} />
      </Form.Item>
      {/* <Collapse ghost className='skills-form-collapse'>
        <Collapse.Panel key='advanced' header={t('form.advanced_settings')}>
          <Form.Item label={t('form.license')} name='license'>
            <Input placeholder={t('form.license_placeholder')} />
          </Form.Item>
          <Form.Item label={t('form.compatibility')} name='compatibility'>
            <Input placeholder={t('form.compatibility_placeholder')} />
          </Form.Item>
          <Form.Item label={t('form.allowed_tools')} name='allowed_tools'>
            <Input placeholder={t('form.allowed_tools_placeholder')} />
          </Form.Item>
          <Form.Item label={t('form.metadata')}>
            <Form.List name='metadata'>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row key={key} gutter={SIZE}>
                      <Col flex='auto'>
                        <Row gutter={SIZE}>
                          <Col span={12}>
                            <Form.Item {...restField} name={[name, 'key']} rules={[{ required: true, message: t('form.metadata_key_value_required') }]}>
                              <Input placeholder='Key' />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item {...restField} name={[name, 'value']} rules={[{ required: true, message: t('form.metadata_key_value_required') }]}>
                              <Input placeholder='Value' />
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
                    {t('form.add_metadata')}
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
        </Collapse.Panel>
      </Collapse> */}
    </Form>
  );
}
