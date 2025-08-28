import React from 'react';
import { Form, Select, Col, Row, AutoComplete, Spin } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { useRequest } from 'ahooks';

import { getEventTagValues } from '../services';

interface Props {
  disabled?: boolean;
  fullName?: string | (string | number)[];
  keyName: string;
  keyOptions?: {
    label: string;
    value: string | number;
  }[];
  funcName: string;
  valueName: string;
  field: any;
  remove: Function;
}

const TagItem = (props: Props) => {
  const { t } = useTranslation('KVTagSelect');
  const { disabled, fullName = [], keyName, keyOptions, funcName, valueName, field, remove } = props;
  const form = Form.useFormInstance();
  const key = Form.useWatch([...fullName, field.name, keyName]);
  const func = Form.useWatch([...fullName, field.name, funcName]);
  const isSelect = _.includes(['not in', 'in'], func);
  const onKeyChange = () => {
    // 当 key 变化时，清空 value 值
    const valuesClone = _.cloneDeep(form.getFieldsValue());
    _.set(valuesClone, [...fullName, field.name, valueName], undefined);
    form.setFieldsValue(valuesClone);
  };

  const { data = [], loading } = useRequest<
    {
      label: string;
      value: string;
    }[],
    any
  >(
    () => {
      if (!key) return Promise.resolve([]);
      return getEventTagValues(key)
        .then((res) => {
          return _.map(res, (item) => ({ label: item, value: item }));
        })
        .catch(() => {
          return [];
        });
    },
    {
      refreshDeps: [key],
    },
  );

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
                <Form.Item name={[field.name, keyName]} rules={[{ required: true, message: t('tag.key.msg') }]}>
                  <AutoComplete showSearch options={keyOptions} placeholder={t('tag.key.placeholder')} onChange={onKeyChange} />
                </Form.Item>
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
                <Select
                  mode='tags'
                  open={false}
                  style={{ width: '100%' }}
                  placeholder={t('tag.value.placeholder')}
                  tokenSeparators={[' ']}
                  options={data}
                  notFoundContent={loading ? <Spin size='small' /> : null}
                />
              </Form.Item>
            ) : (
              <Form.Item name={[field.name, valueName]} rules={[{ required: true, message: t('tag.value.msg') }]}>
                <AutoComplete options={data} placeholder={t('tag.value.placeholder')} notFoundContent={loading ? <Spin size='small' /> : null} />
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
