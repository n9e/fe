import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Modal, Form, Input, Switch, Select } from 'antd';
import { useTranslation } from 'react-i18next';

import { getTeamInfoList } from '@/services/manage';

import { NS } from '../../constants';
import { EmbeddedProductParams } from '../../types';

interface EmbeddedProductModalProps {
  initialValues?: EmbeddedProductParams;
  onOk: (data: EmbeddedProductParams) => void;
  open: boolean;
  onCancel: () => void;
}

const EmbeddedProductModal: React.FC<EmbeddedProductModalProps> = ({ open, initialValues, onOk, onCancel }) => {
  const { t } = useTranslation(NS);
  const [form] = Form.useForm();
  const [teamList, setTeamList] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    if (open) {
      getTeamInfoList().then((data) => {
        setTeamList(data.dat || []);
      });
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          is_private: initialValues.is_private ?? false,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  return (
    <Modal
      width={750}
      title={initialValues ? t('edit') : t('add')}
      visible={open}
      onOk={() => {
        form.validateFields().then((values) => {
          const formattedData = {
            ...values,
            id: initialValues?.id || Number(values.id),
            is_private: values.is_private,
          };
          onOk(formattedData);
        });
      }}
      onCancel={onCancel}
    >
      <Form layout='vertical' form={form}>
        <Form.Item name='name' label={t('name')} rules={[{ required: true, message: t('name_msg') }]}>
          <Input />
        </Form.Item>
        <Form.Item name='url' label={t('url')} rules={[{ required: true, message: t('url_msg') }]}>
          <Input.TextArea />
        </Form.Item>

        <Form.Item name='team_ids' label={t('team_ids')} rules={[{ required: true, message: t('team_ids_msg') }]}>
          <Select
            mode='multiple'
            allowClear
            showSearch
            options={_.map(teamList, (item) => {
              return {
                label: item.name,
                value: item.id,
              };
            })}
          />
        </Form.Item>
        <Form.Item name='is_private' label={t('common:private')} valuePropName='checked' initialValue={false}>
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EmbeddedProductModal;
