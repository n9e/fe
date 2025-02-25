import React from 'react';
import { Form, Row, Col, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import TagItem from './TagItem';

interface Props {
  keyLabel?: React.ReactNode;
  funcLabel?: React.ReactNode;
  valueLabel?: React.ReactNode;
  keyName?: string;
  funcName?: string;
  valueName?: string;
  field?: any;
  fullName?: string[];
  name: string | (string | number)[];
}

export default function index(props: Props) {
  const { t } = useTranslation('KVTagSelect');
  const {
    keyLabel = t('tag.key.label'),
    funcLabel = t('tag.func.label'),
    valueLabel = t('tag.value.label'),
    keyName = 'key',
    funcName = 'func',
    valueName = 'value',
    field = {},
    fullName = [],
    name,
  } = props;

  return (
    <Form.List {...field} name={name}>
      {(fields, { add, remove }) => (
        <>
          <Row gutter={[10, 10]} style={{ marginBottom: '8px' }}>
            <Col span={5}>{keyLabel}</Col>
            <Col span={3}>{funcLabel}</Col>
            <Col span={16}>{valueLabel}</Col>
          </Row>
          {fields.map((field) => (
            <TagItem key={field.key} fullName={_.concat(fullName, name)} keyName={keyName} funcName={funcName} valueName={valueName} field={field} remove={remove} />
          ))}
          <Row>
            <Col span={23}>
              <Button
                className='mb2'
                style={{ width: '100%' }}
                type='dashed'
                onClick={() =>
                  add({
                    [funcName]: '==',
                  })
                }
              >
                <PlusOutlined />
                {t('tag.add')}
              </Button>
            </Col>
          </Row>
        </>
      )}
    </Form.List>
  );
}
