import React, { useEffect } from 'react';
import { Form, Row, Col, Space, Tooltip } from 'antd';
import { PlusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import Markdown from '@/components/Markdown';

import { getEventTagKeys } from '../services';
import TagItem from './TagItem';

interface Props {
  disabled?: boolean;
  keyLabel?: React.ReactNode;
  keyLabelTootip?: React.ReactNode;
  funcLabel?: React.ReactNode;
  funcLabelTootip?: React.ReactNode;
  valueLabel?: React.ReactNode;
  keyName?: string;
  funcName?: string;
  valueName?: string;
  field?: any;
  fullName?: (string | number)[];
  name: string | (string | number)[];
  addWapper?: (add: (defaultValue?: any, insertIndex?: number) => void) => void;
  initialValue?: any;
  rules?: any[];
}

export default function index(props: Props) {
  const { t } = useTranslation('KVTagSelect');
  const form = Form.useFormInstance();
  const {
    disabled,
    keyLabel = t('tag.key.label'),
    keyLabelTootip,
    funcLabel = t('tag.func.label'),
    funcLabelTootip,
    valueLabel = t('tag.value.label'),
    keyName = 'key',
    funcName = 'func',
    valueName = 'value',
    field = {},
    fullName = [],
    name,
    addWapper,
    initialValue,
    rules = [],
  } = props;
  const restField = _.omit(field, ['key', 'name']);
  const [keyOptions, setKeyOptions] = React.useState<
    {
      label: string;
      value: string | number;
    }[]
  >([]);

  // 监听当前Form.List的值变化
  const currentFullName = _.concat(fullName, name);
  const currentValues = Form.useWatch(currentFullName);

  // 校验规则：不允许出现重复的key
  const validateUniqueKeys = {
    validator: async (_, values) => {
      if (!values || !Array.isArray(values)) return;

      const keys = values.map((item) => item?.[keyName]).filter(Boolean);
      const uniqueKeys = new Set(keys);

      if (keys.length !== uniqueKeys.size) {
        throw new Error(t('tag.key.duplicate_error'));
      }
    },
  };

  // 当值变化时自动触发校验
  useEffect(() => {
    if (currentValues && Array.isArray(currentValues) && currentValues.length > 0) {
      // 延迟执行校验，确保表单值已更新
      const timer = setTimeout(() => {
        form.validateFields([currentFullName]);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [currentValues, currentFullName]);

  useEffect(() => {
    getEventTagKeys()
      .then((res) => {
        setKeyOptions(_.map(res, (item) => ({ label: item, value: item })));
      })
      .catch(() => {
        setKeyOptions([]);
      });
  }, []);

  return (
    <Form.List {...restField} name={name} rules={_.concat([validateUniqueKeys], rules)} initialValue={initialValue}>
      {(fields, { add, remove }, { errors }) => (
        <>
          <Row gutter={10}>
            <Col flex='auto'>
              <Row gutter={10} className={fields.length ? 'mb-2' : ''}>
                <Col span={8}>
                  <Space align='baseline' size={4}>
                    {keyLabel}
                    {keyLabelTootip && (
                      <Tooltip className='n9e-ant-from-item-tooltip' title={keyLabelTootip} overlayClassName='ant-tooltip-max-width-400'>
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
            </Col>
            <Col flex='none'>{!disabled && <div className='w-[12px]' />}</Col>
          </Row>
          {fields.map((field) => (
            <TagItem
              key={field.key}
              disabled={disabled}
              fullName={_.concat(fullName, name)}
              keyName={keyName}
              keyOptions={keyOptions}
              funcName={funcName}
              valueName={valueName}
              field={field}
              remove={remove}
            />
          ))}
          <Form.ErrorList errors={errors} />
        </>
      )}
    </Form.List>
  );
}
