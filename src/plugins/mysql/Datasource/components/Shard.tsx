import React from 'react';
import _ from 'lodash';
import { Row, Col, Form, Input, FormInstance, InputNumber, Space } from 'antd';
import { CloseOutlined, RightOutlined, DownOutlined } from '@ant-design/icons';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';

import { NAME_SPACE } from '../../constants';
import { mysqlLikePlaceholder } from '../config';

interface IProps {
  form: FormInstance;
  field: FormListFieldData;
  fields: FormListFieldData[];
  remove: (name: number) => void;
  type: string;
}

export default function Shard(props: IProps) {
  const { t } = useTranslation(NAME_SPACE);
  const { form, field, fields, remove, type } = props;
  const namePrefix = ['settings', `${type}.shards`];
  const { key, name, ...restField } = field;
  const [advancedVisible, setAdvancedVisible] = React.useState(false);

  return (
    <div key={key} className='n9e-datasource-form-mysql-shard'>
      <div>
        <Form.Item
          label={t('datasource.shards.addr')}
          {...restField}
          name={[name, `${type}.addr`]}
          rules={[
            {
              required: true,
            },
            () => ({
              validator(_, value) {
                const fieldOfThisColumn = form.getFieldValue(namePrefix).map((item) => item[`${type}.addr`]);

                if (fieldOfThisColumn.filter((item) => item === value).length > 1) {
                  return Promise.reject(new Error(t('datasource.shards.addr_tip')));
                } else {
                  return Promise.resolve();
                }
              },
            }),
          ]}
        >
          <Input placeholder={mysqlLikePlaceholder[type].addr} />
        </Form.Item>

        <Row gutter={10}>
          <Col span={12}>
            <Form.Item
              label={t('datasource.shards.user')}
              {...restField}
              name={[name, `${type}.user`]}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input placeholder={t('datasource.shards.user')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('datasource.shards.password')}
              {...restField}
              name={[name, `${type}.password`]}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input.Password
                placeholder={t('datasource.shards.password')}
                onChange={(e) => {
                  form.setFields([
                    {
                      name: [...namePrefix, name, type + '.is_encrypt'],
                      value: false,
                    },
                  ]);
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <div
          className='second-color'
          style={{
            marginBottom: 10,
          }}
        >
          {t('datasource.shards.help')}
        </div>
        <div>
          <div>
            <Space
              className='n9e-cursor-pointer'
              onClick={() => {
                setAdvancedVisible(!advancedVisible);
              }}
            >
              {t('common:advanced_settings')}
              {advancedVisible ? <DownOutlined /> : <RightOutlined />}
            </Space>
            {advancedVisible && (
              <div className='mt-2'>
                <Row gutter={10}>
                  <Col span={12}>
                    <Form.Item
                      label={t(`datasource.max_query_rows`)}
                      {...restField}
                      name={[name, `${type}.max_query_rows`]}
                      rules={[
                        { required: true },
                        {
                          type: 'number',
                          min: 0,
                        },
                      ]}
                      initialValue={500}
                    >
                      <InputNumber
                        style={{
                          width: '100%',
                        }}
                        controls={false}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={t(`datasource.max_idle_conns`)}
                      {...restField}
                      name={[name, `${type}.max_idle_conns`]}
                      rules={[
                        {
                          type: 'number',
                          min: 0,
                        },
                      ]}
                    >
                      <InputNumber
                        style={{
                          width: '100%',
                        }}
                        controls={false}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={t(`datasource.max_open_conns`)}
                      {...restField}
                      name={[name, `${type}.max_open_conns`]}
                      rules={[
                        {
                          type: 'number',
                          min: 0,
                        },
                      ]}
                    >
                      <InputNumber
                        style={{
                          width: '100%',
                        }}
                        controls={false}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={t(`datasource.conn_max_lifetime`)}
                      {...restField}
                      name={[name, `${type}.conn_max_lifetime`]}
                      rules={[
                        {
                          type: 'number',
                          min: 0,
                        },
                      ]}
                    >
                      <InputNumber
                        style={{
                          width: '100%',
                        }}
                        controls={false}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            )}
          </div>
        </div>
      </div>
      {fields.length > 1 && (
        <div className='n9e-datasource-form-mysql-shard-close'>
          <CloseOutlined
            onClick={() => {
              remove(name);
            }}
          />
        </div>
      )}
    </div>
  );
}
