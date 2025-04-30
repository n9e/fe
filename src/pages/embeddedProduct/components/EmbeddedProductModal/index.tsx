import React, { useEffect, useState } from 'react';
import { Modal, Form, Space, Input, Button, Switch, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { EmbeddedProductParams } from '../../types';
import { getTeamInfoList } from '@/services/manage';
import _ from 'lodash';

interface EmbeddedProductModalProps {
  initialValues?: EmbeddedProductParams;
  onOk: (data: EmbeddedProductParams[]) => void;
  open: boolean;
  onCancel: () => void;
}

const EmbeddedProductModal: React.FC<EmbeddedProductModalProps> = ({ open, initialValues, onOk, onCancel }) => {
  const { t } = useTranslation('embeddedProduct');
  const [form] = Form.useForm();
  const [teamList, setTeamList] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    if (open) {
      getTeamInfoList().then((data) => {
        setTeamList(data.dat || []);
      });
      if (initialValues) {
        form.setFieldsValue({ data: [initialValues] });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  return (
    <Modal
      width={750}
      title={initialValues ? t('edit_title') : t('add_title')}
      visible={open}
      onOk={() => {
        form.validateFields().then((values) => {
          const formattedData = values.data.map((item: any) => ({
            ...item,
            id: Number(item.id),
            is_private: item.is_private ?? false,
          }));
          onOk(formattedData);
        });
      }}
      onCancel={onCancel}
    >
      <Form layout='vertical' form={form}>
        <Form.List name='data'>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key}>
                  <Space style={{ display: 'flex', marginBottom: 8, alignItems: 'center' }} align='baseline'>
                    <Form.Item
                      {...restField}
                      name={[name, 'id']}
                      label={t('id')}
                      rules={[
                        { required: true, message: t('id_msg') },
                        { type: 'number', transform: (value) => Number(value), message: t('id_number_msg') },
                      ]}
                    >
                      <Input placeholder={t('id')} disabled={!!initialValues} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'name']} label={t('name')} rules={[{ required: true, message: t('name_msg') }]}>
                      <Input placeholder={t('name')} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'url']} label={t('url')} rules={[{ required: true, message: t('url_msg') }]}>
                      <Input placeholder={t('url')} />
                    </Form.Item>

                    <Form.Item {...restField} name={[name, 'team_ids']} label={t('team_ids')} rules={[{ required: true, message: t('team_ids_msg') }]}>
                      <Select
                        mode='multiple'
                        allowClear
                        showSearch
                        style={{ width: 250 }}
                        placeholder={t('team_ids')}
                        options={_.map(teamList, (item) => {
                          return {
                            label: item.name,
                            value: item.id,
                          };
                        })}
                      />
                    </Form.Item>
                    <Form.Item style={{ width: 150 }} {...restField} name={[name, 'is_private']} label={t('is_private')} valuePropName='checked' initialValue={false}>
                      <Switch />
                    </Form.Item>
                    {!initialValues && (
                      <Button type='link' onClick={() => remove(name)}>
                        {t('common:btn.delete')}
                      </Button>
                    )}
                  </Space>
                </div>
              ))}
              {!initialValues && (
                <Form.Item>
                  <Button type='dashed' onClick={() => add()} block>
                    {t('common:btn.add')}
                  </Button>
                </Form.Item>
              )}
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default EmbeddedProductModal;
