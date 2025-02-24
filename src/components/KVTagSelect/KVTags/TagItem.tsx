import React from 'react';
import { Form, Input, Select, Col, Row } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

interface Props {
  fullName?: string | (string | number)[];
  keyName: string;
  funcName: string;
  valueName: string;
  field: any;
  remove: Function;
}

const TagItem = (props: Props) => {
  const { t } = useTranslation('KVTagSelect');
  const { fullName = [], keyName, funcName, valueName, field, remove } = props;
  const func = Form.useWatch([...fullName, field.name, funcName]);
  const isSelect = _.includes(['not in', 'in'], func);

  return (
    <>
      <Row gutter={[10, 10]} style={{ marginBottom: '10px' }}>
        <Col span={5}>
          <Form.Item style={{ marginBottom: 0 }} name={[field.name, keyName]} rules={[{ required: true, message: t('tag.key.msg') }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={3}>
          <Form.Item style={{ marginBottom: 0 }} name={[field.name, funcName]}>
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
        <Col span={15}>
          {isSelect ? (
            <Form.Item
              style={{ marginBottom: 0 }}
              name={[field.name, valueName]}
              rules={[{ required: true, message: t('tag.value.msg') }]}
              getValueFromEvent={(value) => {
                if (_.isArray(value)) {
                  return _.join(value, ',');
                }
                return value;
              }}
              getValueProps={(value) => {
                if (_.isString(value)) {
                  return { value: _.split(value, ',') };
                }
                return { value };
              }}
            >
              <Select mode='tags' open={false} style={{ width: '100%' }} placeholder={t('tag.value.placeholder1')} tokenSeparators={[' ']}></Select>
            </Form.Item>
          ) : (
            <Form.Item style={{ marginBottom: 0 }} name={[field.name, 'value']} rules={[{ required: true, message: t('tag.value.msg') }]}>
              <Input placeholder={t('tag.value.placeholder2')} />
            </Form.Item>
          )}
        </Col>
        <Col>
          <MinusCircleOutlined style={{ marginTop: '8px' }} onClick={() => remove(field.name)} />
        </Col>
      </Row>
    </>
  );
};

export default TagItem;
