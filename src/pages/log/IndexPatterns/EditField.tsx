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
import React, { useEffect, useState } from 'react';
import { PlusCircleOutlined, MinusCircleOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons';
import { Drawer, Row, Col, Space, Form, Input, Select, Button, FormInstance } from 'antd';
import { useTranslation } from 'react-i18next';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { getESIndexPattern, putESIndexPattern } from './services';
import { getFullFields } from '@/pages/explorer/Elasticsearch/services';
import { FieldConfigVersion2 } from './types';
import _ from 'lodash';

interface IField {
  name: string;
  type: string;
}

interface Props {
  id: number;
  onOk: (values: any, name: string) => void;
}

function EditField(props: Props & ModalWrapProps) {
  const { t } = useTranslation('es-index-patterns');
  const { visible, destroy, id, onOk } = props;
  const [fieldsAll, setFields] = useState<IField[]>([]);
  const [name, setName] = useState('');
  const [editting, setEditting] = useState(false);
  useEffect(() => {
    if (id) {
      getESIndexPattern(id).then((res) => {
        setName(res.name);
        let fieldConfig: FieldConfigVersion2;
        try {
          fieldConfig = JSON.parse(res.fields_format);
          form.setFieldsValue(fieldConfig);
        } catch (error) {
          console.error(error);
        }
        getFullFields(res.datasource_id, res.name).then((res) => {
          setFields(res.allFields);
        });
      });
    }
  }, [id]);
  const [form] = Form.useForm();

  return (
    <Drawer
      width={1000}
      destroyOnClose
      title={
        <Space>
          {t('field.edit_title')}
          {editting ? <Input size='small' style={{ width: 200 }} value={name} onChange={(e) => setName(e.target.value)} /> : <strong>{name}</strong>}
          {editting ? <CheckOutlined onClick={() => setEditting(false)} /> : <EditOutlined onClick={() => setEditting(true)} />}
        </Space>
      }
      visible={visible}
      onClose={destroy}
    >
      <Form
        layout='vertical'
        form={form}
        onFinish={(values) => {
          onOk(values, name);
          destroy();
        }}
      >
        <Form.List name='arr' initialValue={[{}]}>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name }) => (
                <FieldRow key={key} name={name} remove={remove} form={form} add={add} fields={fieldsAll} />
              ))}
            </>
          )}
        </Form.List>

        <Form.Item>
          <Button type='primary' htmlType='submit'>
            {t('common:btn.save')}
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
}

export default ModalHOC<Props>(EditField);

function FieldRow({ key, name, form, remove, add, fields }: { key: number; name: number; form: FormInstance; remove: (v) => void; add: () => void; fields: IField[] }) {
  const { t } = useTranslation('es-index-patterns');
  const formatType = Form.useWatch(['arr', name, 'formatMap', 'type'], form);
  return (
    <Row gutter={16} key={key}>
      <Col flex='150px'>
        <Form.Item label={t('keyword')} name={[name, 'field']}>
          <Select
            dropdownMatchSelectWidth={false}
            showSearch
            filterOption={(input, option: any) => {
              return option.value.indexOf(input) >= 0;
            }}
            onChange={(v) => {
              const type = fields.find((i) => i.name === v)?.type || '';
              form.setFields([{ name: ['arr', name, 'type'], value: type }]);
            }}
          >
            {fields.map((item) => (
              <Select.Option value={item.name}>{item.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col flex='84px'>
        <Form.Item label={t('field.type')} name={[name, 'type']}>
          <Input disabled />
        </Form.Item>
      </Col>
      <Col flex='84px'>
        <Form.Item label={t('field.alias')} name={[name, 'attrs', 'alias']} tooltip={t('field.alias_tip')}>
          <Input />
        </Form.Item>
      </Col>

      <Form.Item shouldUpdate={(prev, cur) => _.get(prev, ['arr', name, 'type']) !== _.get(cur, ['arr', name, 'type'])} noStyle>
        {({ getFieldValue }) => {
          const type = getFieldValue(['arr', name, 'type']);
          const formatTypeOptions = [
            {
              label: 'URL',
              value: 'url',
            },
          ];
          if (type === 'date') {
            formatTypeOptions.unshift({
              label: 'Date',
              value: 'date',
            });
          }
          return (
            <>
              <Col flex='105px'>
                <Form.Item label={t('field.format.type')} name={[name, 'formatMap', 'type']} initialValue={'url'}>
                  <Select allowClear options={formatTypeOptions} />
                </Form.Item>
              </Col>
              <>
                {formatType === 'date' && (
                  <Col flex='184px'>
                    <Form.Item
                      label={t('field.format.params.date.pattern')}
                      name={[name, 'formatMap', 'params', 'pattern']}
                      tooltip={t('field.format.params.date.pattern_tip')}
                      initialValue='YYYY-MM-DD HH:mm:ss.SSS'
                    >
                      <Input placeholder={t('field.format.params.date.pattern_placeholder')} />
                    </Form.Item>
                  </Col>
                )}
                {formatType === 'url' && (
                  <>
                    <Col flex='184px'>
                      <Form.Item
                        label={t('field.format.params.url.urlTemplate')}
                        name={[name, 'formatMap', 'params', 'urlTemplate']}
                        tooltip={{
                          title: (
                            <div>
                              {t('field.format.params.url.urlTemplateTip', { skipInterpolation: true })}
                              <div>{t('field.format.params.url.urlTemplateTip1', { skipInterpolation: true })}</div>
                            </div>
                          ),
                          overlayInnerStyle: { width: 550 },
                        }}
                      >
                        <Input placeholder={t('field.format.params.url.urlTemplatePlaceholder', { skipInterpolation: true })} />
                      </Form.Item>
                    </Col>
                    <Col flex={'184px'}>
                      <Form.Item label={t('field.format.params.url.labelTemplate')} name={[name, 'formatMap', 'params', 'labelTemplate']} initialValue='{{value}}'>
                        <Input placeholder={t('field.format.params.url.labelTemplatePlaceholder', { skipInterpolation: true })} />
                      </Form.Item>
                    </Col>
                  </>
                )}
              </>
            </>
          );
        }}
      </Form.Item>

      <Col flex='66px' style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 33 }}>
        <Space>
          <MinusCircleOutlined className='datasource-form-icons' onClick={() => remove(name)} />
          <PlusCircleOutlined className='datasource-form-icons' onClick={() => add()} />
        </Space>
      </Col>
    </Row>
  );
}
