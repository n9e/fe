import React, { useContext } from 'react';
import { Form, Input, Select, Col, Row } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { CommonStateContext } from '@/App';

import { NS } from '../../../constants';
import { useGlobalState } from './globalState';

interface Props {
  disabled?: boolean;
  fullName?: string | (string | number)[];
  field: any;
  remove: Function;
}

const TagItem = (props: Props) => {
  const { t } = useTranslation('KVTagSelect');
  const { busiGroups, datasourceList } = useContext(CommonStateContext);
  const [alertRules] = useGlobalState('alertRules');
  const { disabled, fullName = [], field, remove } = props;
  const form = Form.useFormInstance();
  const key = Form.useWatch([...fullName, field.name, 'key']);
  const func = Form.useWatch([...fullName, field.name, 'func']);
  let selectOptions: {
    label: string;
    value: string | number;
  }[] = [];
  let funcOptions: {
    label: string;
    value: string;
  }[] = [
    { label: '==', value: '==' },
    { label: '=~', value: '=~' },
    { label: 'in', value: 'in' },
    { label: 'not in', value: 'not in' },
    { label: '!=', value: '!=' },
    { label: '!~', value: '!~' },
  ];

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
    funcOptions = [{ label: '==', value: '==' }];
  } else if (key === 'rule_id') {
    selectOptions = _.map(alertRules, (item) => {
      return {
        label: item.name,
        value: item.id,
      };
    });
    funcOptions = [
      { label: '==', value: '==' },
      { label: 'in', value: 'in' },
      { label: 'not in', value: 'not in' },
      { label: '!=', value: '!=' },
    ];
  } else if (key === 'severity') {
    selectOptions = [
      { label: t('common:severity.1'), value: 1 },
      { label: t('common:severity.2'), value: 2 },
      { label: t('common:severity.3'), value: 3 },
    ];
    funcOptions = [
      { label: '==', value: '==' },
      { label: 'in', value: 'in' },
      { label: 'not in', value: 'not in' },
      { label: '!=', value: '!=' },
    ];
  }

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
                <Form.Item name={[field.name, 'key']} rules={[{ required: true, message: t('tag.key.msg') }]}>
                  <Select
                    options={[
                      {
                        label: t(`${NS}:notification_configuration.attributes_options.group_name`),
                        value: 'group_name',
                      },
                      {
                        label: t(`${NS}:notification_configuration.attributes_options.cluster`),
                        value: 'cluster',
                      },
                      {
                        label: t(`${NS}:notification_configuration.attributes_options.is_recovered`),
                        value: 'is_recovered',
                      },
                      {
                        label: t(`${NS}:notification_configuration.attributes_options.rule_id`),
                        value: 'rule_id',
                      },
                      {
                        label: t(`${NS}:notification_configuration.attributes_options.severity`),
                        value: 'severity',
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
                options={funcOptions}
                onChange={() => {
                  const newValues = _.cloneDeep(form.getFieldsValue());
                  _.set(newValues, [...fullName, field.name, 'value'], undefined);
                  form.setFieldsValue(newValues);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            {_.includes(['not in', 'in'], func) && (
              <Form.Item
                name={[field.name, 'value']}
                rules={[{ required: true, message: t('tag.value.msg') }]}
                getValueFromEvent={(value) => {
                  if (_.includes(['group_name', 'cluster', 'is_recovered'], key)) {
                    if (_.isArray(value)) {
                      return _.join(value, ' ');
                    }
                  }
                  return value;
                }}
                getValueProps={(value) => {
                  if (_.includes(['group_name', 'cluster', 'is_recovered'], key)) {
                    if (_.isString(value)) {
                      if (value === '') {
                        return { value: [] };
                      }
                      return { value: _.split(value, ' ') };
                    }
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
