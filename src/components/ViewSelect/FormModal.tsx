import React, { useEffect } from 'react';
import { Modal, Form, Input, Radio, Select, message } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { getTeamInfoList } from '@/services/manage';

import { postView, updateView } from './services';
import { ModalState } from './types';

interface Props {
  page: string;
  modalState: ModalState;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
  getFilterValues: () => any;
  run: () => void;
  setSelected: React.Dispatch<React.SetStateAction<number | undefined>>;
}

export default function FormModal(props: Props) {
  const { t } = useTranslation('viewSelect');
  const { page, modalState, setModalState, getFilterValues, run, setSelected } = props;
  const [form] = Form.useForm();
  const publicCate = Form.useWatch('public_cate', form);
  const [teamList, setTeamList] = React.useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    if (modalState.visible) {
      if (modalState.values) {
        form.setFieldsValue(modalState.values);
      }
      getTeamInfoList().then((res) => {
        setTeamList(res.dat || []);
      });
    }
  }, [modalState.visible]);

  return (
    <Modal
      visible={modalState.visible}
      title={modalState.action ? t(modalState.action) : ''}
      onCancel={() => {
        setModalState({
          ...modalState,
          visible: false,
        });
        form.resetFields();
      }}
      onOk={() => {
        form.validateFields().then((values) => {
          if (modalState.action === 'save_new') {
            const filterValues = getFilterValues();
            postView({
              ...values,
              filter: JSON.stringify(filterValues),
            }).then((newId) => {
              message.success(t('common:success.add'));
              run();
              setModalState({
                ...modalState,
                visible: false,
              });
              form.resetFields();
              setSelected(newId);
            });
          } else if (modalState.action === 'edit') {
            const filterValues = getFilterValues();
            if (modalState.values) {
              updateView(modalState.values.id, {
                ...values,
                filter: JSON.stringify(filterValues),
              }).then(() => {
                message.success(t('common:success.edit'));
                run();
                setModalState({
                  ...modalState,
                  visible: false,
                });
                form.resetFields();
              });
            }
          }
        });
      }}
      destroyOnClose
    >
      <Form layout='vertical' form={form}>
        <Form.Item name='page' rules={[{ required: true }]} hidden initialValue={page}>
          <Input />
        </Form.Item>
        <Form.Item label={t('name')} name='name' rules={[{ required: true }]}>
          <Input placeholder={t('name_placeholder')} />
        </Form.Item>
        <Form.Item label={t('public_cate')} name='public_cate' rules={[{ required: true }]} initialValue={0}>
          <Radio.Group>
            <Radio value={0}>{t('public_cate_0')}</Radio>
            <Radio value={1}>{t('public_cate_1')}</Radio>
            <Radio value={2}>{t('public_cate_2')}</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label={t('gids')} name='gids' rules={[{ required: publicCate === 1 }]} hidden={publicCate !== 1}>
          <Select mode='multiple' options={_.map(teamList, (team) => ({ label: team.name, value: team.id }))} showSearch optionFilterProp='label' />
        </Form.Item>
      </Form>
    </Modal>
  );
}
