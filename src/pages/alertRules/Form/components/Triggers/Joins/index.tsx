import React from 'react';
import { Row, Col, Form, Select, Space, Button } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

interface Props {
  prefixField?: any;
  fullPrefixName?: (string | number)[];
  prefixName?: (string | number)[];
  queries: any[];
  disabled?: boolean;
}

const join_types = ['original', 'none', 'inner_join', 'left_join', 'right_join', 'left_exclude', 'right_exclude'];

export default function index(props: Props) {
  const { t } = useTranslation('alertRules');
  const { prefixField = {}, fullPrefixName = [], prefixName = [], queries, disabled } = props;
  const form = Form.useFormInstance();
  const joins = Form.useWatch([...fullPrefixName, 'joins']);

  return (
    <div>
      <Row wrap={false} gutter={8}>
        <Col flex='none'>
          <div className='mt1'>{t('trigger.joins.label')}</div>
        </Col>
        {}
        <Col
          flex='80px'
          style={{
            display: _.isEmpty(joins) ? 'none' : 'block',
          }}
        >
          <Form.Item {...prefixField} name={[...prefixName, 'join_ref']} initialValue='A'>
            <Select
              disabled={disabled}
              options={_.map(queries, (item) => {
                return {
                  label: item.ref,
                  value: item.ref,
                };
              })}
            />
          </Form.Item>
        </Col>
        <Col flex='auto'>
          <Form.List {...prefixField} name={[...prefixName, 'joins']}>
            {(fields, { add, remove }) => (
              <div>
                {fields.length === 0 ? (
                  <Button
                    onClick={() => {
                      add({});
                    }}
                  >
                    {t('common:btn.add')}
                  </Button>
                ) : (
                  fields.map((field) => {
                    const join_type = form.getFieldValue([...fullPrefixName, 'joins', field.name, 'join_type']);
                    return (
                      <Row key={field.name} wrap={false} gutter={8}>
                        <Col flex='200px'>
                          <Form.Item {...field} name={[field.name, 'join_type']}>
                            <Select
                              disabled={disabled}
                              options={_.map(join_types, (item) => {
                                return {
                                  label: t(`trigger.joins.join_type.${item}`),
                                  value: item,
                                };
                              })}
                              placeholder={t('trigger.joins.join_type_placeholder')}
                            />
                          </Form.Item>
                        </Col>
                        <Col flex='80px'>
                          <Form.Item {...field} name={[field.name, 'ref']}>
                            <Select
                              disabled={disabled}
                              options={_.map(queries, (item) => {
                                return {
                                  label: item.ref,
                                  value: item.ref,
                                };
                              })}
                              placeholder='ref'
                            />
                          </Form.Item>
                        </Col>
                        <Col
                          flex='auto'
                          style={{
                            display: join_type === 'original' || join_type === 'none' || !join_type ? 'none' : 'block',
                          }}
                        >
                          <InputGroupWithFormItem label={t('trigger.joins.on')}>
                            <Form.Item {...field} name={[field.name, 'on']}>
                              <Select disabled={disabled} mode='tags' open={false} />
                            </Form.Item>
                          </InputGroupWithFormItem>
                        </Col>
                        <Col flex='none'>
                          <Space
                            style={{
                              height: 32,
                              lineHeight: ' 32px',
                            }}
                          >
                            <PlusCircleOutlined
                              onClick={() => {
                                add({});
                              }}
                            />
                            <MinusCircleOutlined
                              onClick={() => {
                                remove(field.name);
                              }}
                            />
                          </Space>
                        </Col>
                      </Row>
                    );
                  })
                )}
              </div>
            )}
          </Form.List>
        </Col>
      </Row>
    </div>
  );
}
