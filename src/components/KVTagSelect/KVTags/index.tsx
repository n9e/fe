import React from 'react';
import { Form, Row, Col, Space, Tooltip } from 'antd';
import { PlusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import TagItem from './TagItem';

interface Props {
  keyLabel?: React.ReactNode;
  keyLabel_tip?: React.ReactNode;
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
    keyLabel_tip,
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
          <Row gutter={[10, 10]} className='mb1'>
            <Col span={5}>
              <Space align='baseline' size={4}>
                {keyLabel}
                {keyLabel_tip && (
                  <Tooltip className='n9e-ant-from-item-tooltip' title={keyLabel_tip}>
                    <QuestionCircleOutlined />
                  </Tooltip>
                )}
                <PlusCircleOutlined
                  onClick={() => {
                    add({
                      [funcName]: '==',
                    });
                  }}
                />
              </Space>
            </Col>
            {fields.length ? <Col span={3}>{funcLabel}</Col> : null}
            {fields.length ? <Col span={16}>{valueLabel}</Col> : null}
          </Row>
          {fields.map((field) => (
            <TagItem key={field.key} fullName={_.concat(fullName, name)} keyName={keyName} funcName={funcName} valueName={valueName} field={field} remove={remove} />
          ))}
        </>
      )}
    </Form.List>
  );
}
