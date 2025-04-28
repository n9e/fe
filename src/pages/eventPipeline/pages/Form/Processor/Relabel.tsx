import React from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Row, Col, Form, Select, Input } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';

import { SIZE } from '@/utils/constant';

interface Props {
  field: FormListFieldData;
  namePath: (string | number)[];
  prefixNamePath?: (string | number)[];
}

export default function Relabel(props: Props) {
  const { t } = useTranslation('alertRules');
  const { field, namePath = [], prefixNamePath = [] } = props;
  const resetField = _.omit(field, ['name', 'key']);
  const action = Form.useWatch([...prefixNamePath, ...namePath, 'action']);

  return (
    <Row gutter={SIZE}>
      <Col span={12}>
        <Form.Item {...resetField} name={[...namePath, 'action']} label='action'>
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
              <Form.Item {...resetField} name={[...namePath, 'if']} label='if' tooltip={t('relabel.if_tip')}>
                <Input />
              </Form.Item>
            </Col> */}
          <Col span={12}>
            <Form.Item {...resetField} name={[...namePath, 'target_label']} label='target_label' tooltip={t('relabel.target_label_tip')}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item {...resetField} name={[...namePath, 'replacement']} label='replacement' tooltip={t('relabel.replacement_tip')}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item {...resetField} name={[...namePath, 'source_labels']} label='source_labels' tooltip={t('relabel.source_labels_tip')}>
              <Select mode='tags' tokenSeparators={[' ']} open={false} placeholder={t('relabel.source_labels_tip_placeholder')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item {...resetField} name={[...namePath, 'separator']} label='separator' tooltip={t('relabel.separator_tip')} initialValue=';'>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item {...resetField} name={[...namePath, 'regex']} label='regex' tooltip={t('relabel.regex_tip')}>
              <Input />
            </Form.Item>
          </Col>
        </>
      )}
      {(action === 'labelkeep' || action === 'labeldrop') && (
        <Col span={12}>
          <Form.Item
            {...resetField}
            name={[...namePath, 'regex']}
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
              {...resetField}
              name={[...namePath, 'regex']}
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
            <Form.Item {...resetField} name={[...namePath, 'replacement']} label='replacement' tooltip={t('relabel.labelmap.replacement_tip')}>
              <Input />
            </Form.Item>
          </Col>
        </>
      )}
    </Row>
  );
}
