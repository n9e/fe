import React from 'react';
import { Form, Row, Col, Space, Tooltip } from 'antd';
import { PlusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import TagItem from './TagItem';

interface Props {
  keyLabel?: React.ReactNode;
  keyLabelTootip?: React.ReactNode;
  keyType?: 'input' | 'select';
  keyOptions?: {
    label: string;
    value: string | number;
  }[];
  funcLabel?: React.ReactNode;
  valueLabel?: React.ReactNode;
  keyName?: string;
  funcName?: string;
  valueName?: string;
  field?: any;
  fullName?: string[];
  name: string | (string | number)[];
  addWapper?: (add: (defaultValue?: any, insertIndex?: number) => void) => void;
}

export default function index(props: Props) {
  const { t } = useTranslation('KVTagSelect');
  const {
    keyLabel = t('tag.key.label'),
    keyLabelTootip,
    keyType = 'input',
    keyOptions,
    funcLabel = t('tag.func.label'),
    valueLabel = t('tag.value.label'),
    keyName = 'key',
    funcName = 'func',
    valueName = 'value',
    field = {},
    fullName = [],
    name,
    addWapper,
  } = props;

  return (
    <Form.List {...field} name={name}>
      {(fields, { add, remove }) => (
        <>
          <Row gutter={[10, 10]} className='mb1'>
            <Col span={5}>
              <Space align='baseline' size={4}>
                {keyLabel}
                {keyLabelTootip && (
                  <Tooltip className='n9e-ant-from-item-tooltip' title={keyLabelTootip}>
                    <QuestionCircleOutlined />
                  </Tooltip>
                )}
                <PlusCircleOutlined
                  onClick={() => {
                    addWapper
                      ? addWapper(add)
                      : add({
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
            <TagItem
              key={field.key}
              fullName={_.concat(fullName, name)}
              keyName={keyName}
              keyType={keyType}
              keyOptions={keyOptions}
              funcName={funcName}
              valueName={valueName}
              field={field}
              remove={remove}
            />
          ))}
        </>
      )}
    </Form.List>
  );
}
