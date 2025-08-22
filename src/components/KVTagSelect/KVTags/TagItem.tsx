import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Col, Row, AutoComplete } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

interface Props {
  disabled?: boolean;
  fullName?: string | (string | number)[];
  keyName: string;
  keyType: 'input' | 'select' | 'autoComplete';
  keyOptions?: {
    label: string;
    value: string | number;
  }[];
  keyPlaceholder?: string;
  funcName: string;
  valueName: string;
  ajustOptions?: (key: string) => Promise<{ label: any; value: any }[]>;
  valuePlaceholder?: string;
  field: any;
  remove: Function;
}

const TagItem = (props: Props) => {
  const { t } = useTranslation('KVTagSelect');
  const { disabled, fullName = [], keyName, keyType, keyOptions, keyPlaceholder, funcName, valueName, valuePlaceholder, field, remove } = props;
  const form = Form.useFormInstance();
  const key = Form.useWatch([...fullName, field.name, keyName]);
  const func = Form.useWatch([...fullName, field.name, funcName]);
  const isSelect = _.includes(['not in', 'in'], func);
  const [valueOptions, setValueOptions] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);

  useEffect(() => {
    if (props.ajustOptions && key) {
      props.ajustOptions(key).then((options) => {
        setValueOptions(options);
      });
    }
    // 当 key 变化时，清空 value 值
    const valuesClone = _.cloneDeep(form.getFieldsValue());
    _.set(valuesClone, [...fullName, field.name, valueName], undefined);
    form.setFieldsValue(valuesClone);
  }, [key]);

  return (
    <Row gutter={10}>
      <Col
        flex='auto'
        style={{
          width: 'calc(100% - 22px)',
        }}
      >
        <Row gutter={10}>
          <Col span={8}>
            <div className='flex gap-[10px]'>
              {field.name !== 0 && <div className='w-[32px] h-[32px] leading-[32px] text-center n9e-fill-color-2 n9e-border-antd rounded-sm flex-shrink-0'>{t('common:and')}</div>}
              <div className='w-full min-w-0'>
                {keyType === 'input' && (
                  <Form.Item name={[field.name, keyName]} rules={[{ required: true, message: t('tag.key.msg') }]}>
                    <Input placeholder={keyPlaceholder} />
                  </Form.Item>
                )}
                {keyType === 'select' && (
                  <Form.Item name={[field.name, keyName]} rules={[{ required: true, message: t('tag.key.msg') }]}>
                    <Select showSearch options={keyOptions} placeholder={keyPlaceholder} />
                  </Form.Item>
                )}
                {keyType === 'autoComplete' && (
                  <Form.Item name={[field.name, keyName]} rules={[{ required: true, message: t('tag.key.msg') }]}>
                    <AutoComplete showSearch options={keyOptions} placeholder={keyPlaceholder} />
                  </Form.Item>
                )}
              </div>
            </div>
          </Col>
          <Col span={4}>
            <Form.Item name={[field.name, funcName]}>
              <Select>
                <Select.Option value='=='>==</Select.Option>
                <Select.Option value='=~'>=~</Select.Option>
                <Select.Option value='in'>in</Select.Option>
                <Select.Option value='not in'>not in</Select.Option>
                <Select.Option value='!='>!=</Select.Option>
                <Select.Option value='!~'>!~</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            {isSelect ? (
              <Form.Item
                name={[field.name, valueName]}
                rules={[{ required: true, message: t('tag.value.msg') }]}
                getValueFromEvent={(value) => {
                  if (_.isArray(value)) {
                    return _.join(value, ' ');
                  }
                  return value;
                }}
                getValueProps={(value) => {
                  if (_.isString(value)) {
                    if (value === '') {
                      return { value: [] };
                    }
                    return { value: _.split(value, ' ') };
                  }
                  return { value };
                }}
              >
                <Select mode='tags' open={false} style={{ width: '100%' }} placeholder={valuePlaceholder} tokenSeparators={[' ']} options={valueOptions}></Select>
              </Form.Item>
            ) : (
              <Form.Item style={{ marginBottom: 0 }} name={[field.name, 'value']} rules={[{ required: true, message: t('tag.value.msg') }]}>
                <AutoComplete options={valueOptions} placeholder={valuePlaceholder} />
              </Form.Item>
            )}
          </Col>
        </Row>
      </Col>
      <Col flex='none'>{!disabled && <MinusCircleOutlined style={{ marginTop: '8px' }} onClick={() => remove(field.name)} />}</Col>
    </Row>
  );
};

export default TagItem;
