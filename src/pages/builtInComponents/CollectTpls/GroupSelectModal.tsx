import React from 'react';
import _ from 'lodash';
import { Modal, Form, Input, Space, message, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';

interface Props {
  busiGroups: any[];
  onOk: (group_id: number) => void;
}

function index(props: Props & ModalWrapProps) {
  const { t } = useTranslation('builtInComponents');
  const { busiGroups, onOk, visible, destroy } = props;
  const [form] = Form.useForm();

  return (
    <Modal
      keyboard={false}
      maskClosable={false}
      title={t('collect_busiGroup_select')}
      visible={visible}
      onOk={() => {
        form.validateFields().then((values) => {
          onOk(values.group_id);
          destroy();
        });
      }}
      onCancel={() => {
        destroy();
      }}
    >
      <Form form={form} layout='vertical'>
        <Form.Item name='group_id' label={t('common:business_group')}>
          <Select
            options={_.map(busiGroups, (item) => {
              return { label: item.name, value: item.id };
            })}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalHOC<Props>(index);
