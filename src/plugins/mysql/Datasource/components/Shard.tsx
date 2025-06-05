import React from 'react';
import _ from 'lodash';
import { Row, Col, Form, Input, FormInstance, InputNumber } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
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
        >
          <InputNumber
            style={{
              width: '100%',
            }}
            controls={false}
          />
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
                visibilityToggle={false}
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
