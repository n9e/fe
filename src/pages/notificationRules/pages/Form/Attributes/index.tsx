import React from 'react';
import { Form, Row, Col, Space, Tooltip } from 'antd';
import { PlusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { NS } from '../../../constants';
import TagItem from './TagItem';

interface Props {
  disabled?: boolean;
  field?: any;
  fullName?: (string | number)[];
  name?: string | (string | number)[];
  keyLabel?: React.ReactNode;
  keyLabelTootip?: React.ReactNode;
  keyLabelTootipPlacement?: 'top' | 'left' | 'right' | 'bottom';
}

export default function index(props: Props) {
  const { t } = useTranslation('KVTagSelect');
  const {
    disabled,
    field = {},
    fullName = [],
    name = [field.name, 'attributes'],
    keyLabel = t(`${NS}:notification_configuration.attributes`),
    keyLabelTootip = t(`${NS}:notification_configuration.attributes_tip`),
    keyLabelTootipPlacement,
  } = props;
  const restField = _.omit(field, ['key', 'name']);
  const form = Form.useFormInstance();

  // 监听当前Form.List的值变化
  const currentFullName = _.concat(fullName, name);
  const currentValues = Form.useWatch(currentFullName);

  // 校验规则：不允许出现重复的key
  const validateUniqueKeys = {
    validator: async (_, values) => {
      if (!values || !Array.isArray(values)) return;

      const keys = values.map((item) => item?.key).filter(Boolean);
      const uniqueKeys = new Set(keys);

      if (keys.length !== uniqueKeys.size) {
        throw new Error(t('attr.key.duplicate_error'));
      }
    },
  };

  // 当值变化时自动触发校验
  React.useEffect(() => {
    if (currentValues && Array.isArray(currentValues) && currentValues.length > 0) {
      // 延迟执行校验，确保表单值已更新
      const timer = setTimeout(() => {
        form.validateFields([currentFullName]);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [currentValues, currentFullName]);

  return (
    <Form.List {...restField} name={name} rules={[validateUniqueKeys]}>
      {(fields, { add, remove }, { errors }) => (
        <>
          <Row gutter={10}>
            <Col flex='auto'>
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
                          add({
                            key: 'group_name',
                            func: '==',
                          });
                        }}
                      />
                    )}
                  </Space>
                </Col>
                {fields.length ? <Col span={4}>{t('tag.func.label')}</Col> : null}
                {fields.length ? <Col span={12}>{t(`${NS}:notification_configuration.attributes_value`)}</Col> : null}
              </Row>
            </Col>
            <Col flex='none'>{!disabled && <div className='w-[12px]' />}</Col>
          </Row>
          {fields.map((field) => (
            <TagItem key={field.key} disabled={disabled} fullName={[...fullName, ...name]} field={field} remove={remove} />
          ))}
          <Form.ErrorList errors={errors} />
        </>
      )}
    </Form.List>
  );
}
