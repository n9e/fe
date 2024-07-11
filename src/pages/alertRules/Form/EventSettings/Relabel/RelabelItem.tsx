import React from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Row, Col, Form, Select, Input } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { MinusCircleOutlined } from '@ant-design/icons';

interface Props {
  prefixName: string[];
  field: FormListFieldData;
  remove: (index: number | number[]) => void;
}

export default function RelabelItem(props: Props) {
  const { t } = useTranslation('alertRules');
  const { prefixName, field, remove } = props;
  const action = Form.useWatch([...prefixName, field.name, 'action']);

  return (
    <div className='n9e-alert-relabel-item'>
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
            <Col span={12}>
              <Form.Item {...field} name={[field.name, 'if']} label='if'>
                <Input placeholder={t('relabel.if_placeholder')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item {...field} name={[field.name, 'target_label']} label='target_label'>
                <Input placeholder={t('relabel.target_label_placeholder')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item {...field} name={[field.name, 'replacement']} label='replacement'>
                <Input placeholder={t('relabel.replacement_placeholder')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item {...field} name={[field.name, 'source_labels']} label='source_labels'>
                <Input placeholder={t('relabel.source_labels_placeholder')} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item {...field} name={[field.name, 'separator']} label='separator'>
                <Input placeholder={t('relabel.separator_placeholder')} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item {...field} name={[field.name, 'regex']} label='regex'>
                <Input placeholder={t('relabel.regex_placeholder')} />
              </Form.Item>
            </Col>
          </>
        )}
        {(action === 'labelkeep' || action === 'labeldrop') && (
          <Col span={12}>
            <Form.Item {...field} name={[field.name, 'regex']} label='regex'>
              <Input placeholder={t('relabel.regex_placeholder')} />
            </Form.Item>
          </Col>
        )}
        {action === 'labelmap' && (
          <>
            <Col span={6}>
              <Form.Item {...field} name={[field.name, 'regex']} label='regex'>
                <Input placeholder={t('relabel.regex_placeholder')} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item {...field} name={[field.name, 'replacement']} label='replacement'>
                <Input placeholder={t('relabel.replacement_placeholder')} />
              </Form.Item>
            </Col>
          </>
        )}
      </Row>
      <div style={{ marginTop: 8 }}></div>
      <MinusCircleOutlined className='n9e-alert-relabel-item-remove' onClick={() => remove(field.name)} />
    </div>
  );
}
