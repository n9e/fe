/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React from 'react';
import { Drawer, Row, Col, Space, Form, Input, Select, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';

interface Props {
  field: {
    name: string;
    type: string;
  };
  values: any;
  onOk: (values: any) => void;
}

function EditField(props: Props & ModalWrapProps) {
  const { t } = useTranslation('es-index-patterns');
  const { visible, destroy, field, values, onOk } = props;
  const [form] = Form.useForm();
  const formatType = Form.useWatch(['formatMap', field.name, 'type'], form);
  const formatTypeOptions = [
    {
      label: 'URL',
      value: 'url',
    },
  ];
  if (field.type === 'date') {
    formatTypeOptions.unshift({
      label: 'Date',
      value: 'date',
    });
  }

  return (
    <Drawer
      width={1000}
      destroyOnClose
      maskClosable={false}
      title={
        <Space>
          {t('field.edit_title')}
          <strong>{field.name}</strong>
        </Space>
      }
      visible={visible}
      onClose={destroy}
    >
      <Row gutter={32}>
        <Col span={12}>
          <Form
            layout='vertical'
            form={form}
            initialValues={values}
            onFinish={(values) => {
              onOk(values);
              destroy();
            }}
          >
            <Form.Item label={t('field.type')}>
              <Input value={field.type} disabled />
            </Form.Item>
            <Form.Item label={t('field.alias')} name={['attrs', field.name, 'alias']} tooltip={t('field.alias_tip')}>
              <Input />
            </Form.Item>

            <Form.Item label={t('field.format.type')} name={['formatMap', field.name, 'type']}>
              <Select allowClear options={formatTypeOptions} />
            </Form.Item>
            {formatType === 'date' && (
              <Form.Item
                label={t('field.format.params.date.pattern')}
                name={['formatMap', field.name, 'params', 'pattern']}
                tooltip={t('field.format.params.date.pattern_tip')}
                initialValue='YYYY-MM-DD HH:mm:ss.SSS'
              >
                <Input placeholder={t('field.format.params.date.pattern_placeholder')} />
              </Form.Item>
            )}
            {formatType === 'url' && (
              <>
                <Form.Item
                  label={t('field.format.params.url.urlTemplate')}
                  name={['formatMap', field.name, 'params', 'urlTemplate']}
                  tooltip={t('field.format.params.url.urlTemplateTip', { skipInterpolation: true })}
                >
                  <Input placeholder={t('field.format.params.url.urlTemplatePlaceholder', { skipInterpolation: true })} />
                </Form.Item>
                <Form.Item label={t('field.format.params.url.labelTemplate')} name={['formatMap', field.name, 'params', 'labelTemplate']} initialValue='{{value}}'>
                  <Input placeholder={t('field.format.params.url.labelTemplatePlaceholder', { skipInterpolation: true })} />
                </Form.Item>
              </>
            )}

            <Form.Item>
              <Button type='primary' htmlType='submit'>
                {t('common:btn.save')}
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Drawer>
  );
}

export default ModalHOC<Props>(EditField);
