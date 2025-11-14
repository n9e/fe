import React, { useContext } from 'react';
import { Form, Input, Select, Col, Row } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { CommonStateContext } from '@/App';

import { NS } from '../../../constants';

interface Props {
  disabled?: boolean;
  fullName?: string | (string | number)[];
  field: any;
  remove: Function;
}

const TagItem = (props: Props) => {
  const { t } = useTranslation('KVTagSelect');
  const { busiGroups, datasourceList } = useContext(CommonStateContext);
  const { disabled, fullName = [], field, remove } = props;
  const form = Form.useFormInstance();
  const key = Form.useWatch([...fullName, field.name, 'key']);
  const func = Form.useWatch([...fullName, field.name, 'func']);
  let selectOptions: {
    label: string;
    value: string;
  }[] = [];

  if (key === 'group_name') {
    selectOptions = _.map(busiGroups, (item) => {
      return {
        label: item.name,
        value: item.name,
      };
    });
  } else if (key === 'cluster') {
    selectOptions = _.map(datasourceList, (item) => {
      return {
        label: item.name,
        value: item.name,
      };
    });
  } else if (key === 'is_recovered') {
    selectOptions = [
      { label: 'true', value: 'true' },
      { label: 'false', value: 'false' },
    ];
  }

  return (
    <Row gutter={10}>
      <Col flex='auto'>
        <Row gutter={10}>
          <Col span={8}>
            <div className='flex gap-[10px]'>
              {field.name !== 0 && <div className='w-[32px] h-[32px] leading-[32px] text-center bg-fc-100 border border-antd rounded-sm flex-shrink-0'>{t('common:and')}</div>}
              <div className='w-full min-w-0'>
                <Form.Item name={[field.name, 'key']} rules={[{ required: true, message: t('tag.key.msg') }]}>
                  <Select
                    options={[
                      {
                        label: t(`${NS}:attribute_filters_options.group_name`),
                        value: 'group_name',
                      },
                      {
                        label: t(`${NS}:attribute_filters_options.cluster`),
                        value: 'cluster',
                      },
                      {
                        label: t(`${NS}:attribute_filters_options.is_recovered`),
                        value: 'is_recovered',
                      },
                    ]}
                    onChange={() => {
                      const newValues = _.cloneDeep(form.getFieldsValue());
                      _.set(newValues, [...fullName, field.name, 'func'], '==');
                      _.set(newValues, [...fullName, field.name, 'value'], undefined);
                      form.setFieldsValue(newValues);
                    }}
                  />
                </Form.Item>
              </div>
            </div>
          </Col>
          <Col span={4}>
            <Form.Item name={[field.name, 'func']}>
              <Select
                options={_.concat(
                  [{ label: '==', value: '==' }],
                  key !== 'is_recovered'
                    ? [
                        { label: '=~', value: '=~' },
                        { label: 'in', value: 'in' },
                        { label: 'not in', value: 'not in' },
                        { label: '!=', value: '!=' },
                        { label: '!~', value: '!~' },
                      ]
                    : [],
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            {_.includes(['not in', 'in'], func) && (
              <Form.Item
                name={[field.name, 'value']}
                rules={[{ required: true, message: t('tag.value.msg') }]}
                getValueFromEvent={(value) => {
                  if (_.isArray(value)) {
                    return _.join(value, ' ');
                  }
                  return value;
                }}
                getValueProps={(value) => {
                  if (_.isString(value)) {
                    return { value: _.split(value, ' ') };
                  }
                  return { value };
                }}
              >
                <Select mode='multiple' style={{ width: '100%' }} options={selectOptions} />
              </Form.Item>
            )}
            {_.includes(['==', '!='], func) && (
              <Form.Item name={[field.name, 'value']} rules={[{ required: true, message: t('tag.value.msg') }]}>
                <Select showSearch optionFilterProp='label' options={selectOptions} />
              </Form.Item>
            )}
            {_.includes(['=~', '!~'], func) && (
              <Form.Item style={{ marginBottom: 0 }} name={[field.name, 'value']} rules={[{ required: true, message: t('tag.value.msg') }]}>
                <Input placeholder={_.includes(['=~', '!~'], func) ? t('tag.value.placeholder2') : undefined} />
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
