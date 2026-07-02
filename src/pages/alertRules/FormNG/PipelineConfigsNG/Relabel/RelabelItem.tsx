import React from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Row, Col, Form, Select, Input, Space } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { MinusCircleOutlined, ArrowUpOutlined, ArrowDownOutlined, CopyOutlined } from '@ant-design/icons';

interface Props {
  prefixName: string[];
  field: FormListFieldData;
  remove: (index: number | number[]) => void;
  move: (from: number, to: number) => void;
  add: (defaultValue?: any, insertIndex?: number) => void;
  fields: FormListFieldData[];
  idx: number;
}

export default function RelabelItem(props: Props) {
  const { t } = useTranslation('alertRules');
  const { prefixName, field, remove, move, add, fields, idx } = props;
  const action = Form.useWatch([...prefixName, field.name, 'action']);
  const currentConfig = Form.useWatch([...prefixName, field.name]);

  return (
    <div className='n9e-alert-relabel-item'>
      <div className='n9e-alert-relabel-item-actions'>
        <Space>
          <CopyOutlined
            onClick={() => {
              add(_.cloneDeep(currentConfig), idx + 1);
            }}
          />
          {idx !== 0 && <ArrowUpOutlined onClick={() => move(idx, idx - 1)} />}
          {idx !== fields.length - 1 && <ArrowDownOutlined onClick={() => move(idx, idx + 1)} />}
          <MinusCircleOutlined onClick={() => remove(field.name)} />
        </Space>
      </div>
      <Row gutter={10}>
        <Col span={12}>
          <Form.Item {...field} name={[field.name, 'action']} label='action'>
            <Select
              options={_.map(['replace', 'labelkeep', 'labeldrop', 'labelmap'], (item) => {
                return { label: item, value: item };
              })}
            />
          </Form.Item>
        </Col>
        {action === 'replace' && (
          <>
            {/* <Col span={12}>
              <Form.Item {...field} name={[field.name, 'if']} label='if' tooltip={t('relabel.if_tip')}>
                <Input />
              </Form.Item>
            </Col> */}
            <Col span={12}>
              <Form.Item {...field} name={[field.name, 'target_label']} label='target_label' tooltip={t('relabel.target_label_tip')}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item {...field} name={[field.name, 'replacement']} label='replacement' tooltip={t('relabel.replacement_tip')}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item {...field} name={[field.name, 'source_labels']} label='source_labels' tooltip={t('relabel.source_labels_tip')}>
                <Select mode='tags' tokenSeparators={[' ']} open={false} placeholder={t('relabel.source_labels_tip_placeholder')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item {...field} name={[field.name, 'separator']} label='separator' tooltip={t('relabel.separator_tip')} initialValue=';'>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item {...field} name={[field.name, 'regex']} label='regex' tooltip={t('relabel.regex_tip')}>
                <Input />
              </Form.Item>
            </Col>
          </>
        )}
        {(action === 'labelkeep' || action === 'labeldrop') && (
          <Col span={12}>
            <Form.Item
              {...field}
              name={[field.name, 'regex']}
              label='regex'
              rules={[
                {
                  required: true,
                },
              ]}
              tooltip={t(`relabel.${action}.regex_tip`)}
            >
              <Input />
            </Form.Item>
          </Col>
        )}
        {action === 'labelmap' && (
          <>
            <Col span={6}>
              <Form.Item
                {...field}
                name={[field.name, 'regex']}
                label='regex'
                rules={[
                  {
                    required: true,
                  },
                ]}
                tooltip={t('relabel.labelmap.regex_tip')}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item {...field} name={[field.name, 'replacement']} label='replacement' tooltip={t('relabel.labelmap.replacement_tip')}>
                <Input />
              </Form.Item>
            </Col>
          </>
        )}
      </Row>
    </div>
  );
}
