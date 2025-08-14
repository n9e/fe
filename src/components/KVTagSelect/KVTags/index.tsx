import React from 'react';
import { Form, Row, Col, Space, Tooltip } from 'antd';
import { PlusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import Markdown from '@/components/Markdown';

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
  keyPlaceholder?: string;
  funcLabel?: React.ReactNode;
  funcLabelTootip?: React.ReactNode;
  valueLabel?: React.ReactNode;
  keyName?: string;
  funcName?: string;
  valueName?: string;
  valuePlaceholder?: string;
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
    keyPlaceholder,
    funcLabel = t('tag.func.label'),
    funcLabelTootip,
    valueLabel = t('tag.value.label'),
    keyName = 'key',
    funcName = 'func',
    valueName = 'value',
    valuePlaceholder,
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
                  <Tooltip className='n9e-ant-from-item-tooltip' title={keyLabelTootip} overlayClassName='ant-tooltip-max-width-400' placement={keyLabelTootipPlacement}>
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
            {fields.length ? (
              <Col span={4}>
                <Space align='baseline' size={4}>
                  {funcLabel}
                  {funcLabelTootip ? (
                    <Tooltip className='n9e-ant-from-item-tooltip' title={funcLabelTootip} overlayClassName='ant-tooltip-max-width-400'>
                      <QuestionCircleOutlined />
                    </Tooltip>
                  ) : (
                    <Tooltip
                      className='n9e-ant-from-item-tooltip'
                      title={
                        <div className='pt-2 px-1'>
                          <Markdown content={t('tag.func.label_tip')} darkMode />
                        </div>
                      }
                      overlayClassName='ant-tooltip-max-width-400'
                    >
                      <QuestionCircleOutlined />
                    </Tooltip>
                  )}
                </Space>
              </Col>
            ) : null}
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
              keyPlaceholder={keyPlaceholder}
              funcName={funcName}
              valueName={valueName}
              valuePlaceholder={valuePlaceholder}
              field={field}
              remove={remove}
            />
          ))}
        </>
      )}
    </Form.List>
  );
}
