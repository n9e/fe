import React, { useState, useEffect, useContext } from 'react';
import { Col, Form, Input, Row, Select, Space, Button, Modal, message, FormInstance } from 'antd';
import { InfoCircleOutlined, MinusCircleOutlined, PlusCircleOutlined, ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import InputEnlarge from '@/components/InputEnlarge';
import _ from 'lodash';
export const RegExtractPrefix = 'regExtract';
interface Props {
  visible: boolean;
  onClose: () => void;
  form: FormInstance;
  rawData?: object;
  selectOption: { label: string; value: string }[];
}

export interface IRegExtractConfig {
  field: string;
  reg: string;
  newField: string;
}

export default function kvMapModal(props: Props) {
  const { visible, onClose, selectOption, form, rawData } = props;
  const { t } = useTranslation('es-index-patterns');
  const isMcDonalds = localStorage.getItem('n9e-dark-mode') === '2';

  return (
    <Modal
      title={t('字段提取')}
      visible={visible}
      width={800}
      onOk={() => {
        const fields = form.getFieldValue('regExtractArr');
        const validateNamePaths = _.flatMap(fields, (item, index) => {
          return [
            ['regExtractArr', index, 'field'],
            ['regExtractArr', index, 'newField'],
          ];
        });
        form.validateFields(validateNamePaths).then(async (values) => {
          onClose();
        });
      }}
      onCancel={() => {
        onClose();
      }}
    >
      <div>
        <div style={{ background: isMcDonalds ? '#fff2cb' : '#6C53B114', marginBottom: 16, padding: 16 }}>
          <InfoCircleOutlined style={{ color: 'var(--fc-primary-color)', marginBottom: 8 }} /> {t('字段提取设置')}
          <div>
            <ul style={{ marginBottom: 0, paddingInlineStart: 24 }}>
              <li>{t('可以对日志中字段通过正则提取生成新字段，跳转链接中可以使用新字段。')}</li>
              <li>{t('只会提取一次，如需多次提取可以配置多行')}</li>
            </ul>
            <div style={{ marginTop: 8 }}>
              <div>{t('log-reg-extract')}</div>
            </div>
          </div>
        </div>
        <Form.List name='regExtractArr' initialValue={[{}]}>
          {(fields, { add, remove }, { errors }) => (
            <>
              <Row gutter={10} style={{ marginBottom: 4 }}>
                <Col flex='160px'>{t('字段')}</Col>
                <Col flex='1'>{t('正则提取')}</Col>
                <Col flex='160px'>{t('新字段')}</Col>
                <Col flex='30px'></Col>
              </Row>
              {fields.map((field, idx) => (
                <div className='feature-block' key={idx} style={{ marginBottom: 0 }}>
                  <Row
                    gutter={10}
                    style={{
                      position: 'relative',
                    }}
                  >
                    <Col flex='160px'>
                      <Field field={field} selectOption={selectOption} rawData={rawData} />
                    </Col>
                    <Col flex='1'>
                      <RegExpression field={field} rawData={rawData} />
                    </Col>
                    <Col flex='160px'>
                      <Form.Item name={[field.name, 'newField']} rules={[{ required: true, message: t('请输入') }]}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col flex='30px'>
                      <Space size={'small'}>
                        <Button type='text' onClick={() => remove(field.name)} style={{ padding: 0 }}>
                          <MinusCircleOutlined />
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </div>
              ))}
              <PlusCircleOutlined onClick={() => add()} />
            </>
          )}
        </Form.List>
      </div>
    </Modal>
  );
}

function RegExpression({ field, rawData }: { field: any; rawData?: object }) {
  const [result, setResult] = useState<string>('');
  const form = Form.useFormInstance();
  const handleChange = (e: any) => {
    if (!rawData) return;
    const reg = e.target.value;
    const fieldName = form.getFieldValue(['regExtractArr', field.name, 'field']);
    if (!fieldName) return;
    const fieldValueWholeWord = rawData[fieldName];
    const fieldValue = _.get(rawData, fieldName.split('.'));
    const arr = new RegExp(reg).exec(fieldValueWholeWord || fieldValue);
    setResult(arr ? arr[1] : '');
  };
  return (
    <Form.Item name={[field.name, 'reg']} initialValue={'(.*)$'} extra={result}>
      <InputEnlarge placeholder='eg.: :(d+)$' onChange={handleChange} />
    </Form.Item>
  );
}

function Field({ field, selectOption, rawData }: { field: any; selectOption: { label: string; value: string }[]; rawData?: object }) {
  const { t } = useTranslation('es-index-patterns');
  const [result, setResult] = useState<string>('');
  const handleChange = (e: any) => {
    if (!rawData) return;
    const fieldName = e;
    const fieldValueWholeWord = rawData[fieldName];
    const fieldValue = _.get(rawData, fieldName.split('.'));
    setResult(fieldValueWholeWord || fieldValue);
  };
  return (
    <Form.Item
      name={[field.name, 'field']}
      rules={[
        {
          required: true,
          message: t('请选择'),
        },
      ]}
      extra={result}
    >
      <Select showSearch placeholder={t('请选择')} onChange={handleChange}>
        {selectOption.map((item) => (
          <Select.Option key={item.value} value={item.value}>
            {item.label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
}
