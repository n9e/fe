import React from 'react';
import { Form, Row, Col, Space, Tooltip } from 'antd';
import { PlusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import TagItem from './TagItem';

interface Props {
  disabled?: boolean;
  keyLabel?: React.ReactNode;
  keyLabelTootip?: React.ReactNode;
  keyLabelTootipPlacement?: 'top' | 'left' | 'right' | 'bottom';
  keyType?: 'input' | 'select' | 'autoComplete';
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
  fullName?: (string | number)[];
  name: string | (string | number)[];
  addWapper?: (add: (defaultValue?: any, insertIndex?: number) => void) => void;
}

export default function index(props: Props) {
  const { t } = useTranslation('KVTagSelect');
  const {
    disabled,
    keyLabel = t('tag.key.label'),
    keyLabelTootip,
    keyLabelTootipPlacement,
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
  const restField = _.omit(field, ['key', 'name']);

  return (
    <Form.List {...restField} name={name}>
      {(fields, { add, remove }) => (
        <>
          <Row gutter={10} className={fields.length ? 'mb-2' : ''}>
            <Col span={8}>
              <Space align='baseline' size={4}>
                {keyLabel}
                {keyLabelTootip && (
                  <Tooltip className='n9e-ant-from-item-tooltip' title={keyLabelTootip} overlayClassName='ant-tooltip-auto-width' placement={keyLabelTootipPlacement}>
                    <QuestionCircleOutlined />
                  </Tooltip>
                )}
                {!disabled && (
                  <PlusCircleOutlined
                    onClick={() => {
                      addWapper
                        ? addWapper(add)
                        : add({
                            [funcName]: '==',
                          });
                    }}
                  />
                )}
              </Space>
            </Col>
            {fields.length ? <Col span={4}>{funcLabel}</Col> : null}
            {fields.length ? <Col span={12}>{valueLabel}</Col> : null}
          </Row>
          {fields.map((field) => (
            <TagItem
              key={field.key}
              disabled={disabled}
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
