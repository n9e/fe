import React, { useContext } from 'react';
import { Alert, Form, Modal, Select, message } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import moment from 'moment';

import { CommonStateContext } from '@/App';
import { deleteAlertMutes } from '@/services/shield';

interface Props {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
}

export default function DeleteMutesModal(props: Props) {
  const { t } = useTranslation('alertMutes');
  const { visible, onCancel, onOk } = props;
  const { busiGroups, profile } = useContext(CommonStateContext);
  const isAdmin = !!profile?.admin;
  const [form] = Form.useForm();

  const monthOptions = [1, 3, 6, 12].map((m) => ({
    label: t(`delete_mutes.timestamp_options.${m}`),
    value: m,
  }));

  return (
    <Modal
      destroyOnClose
      title={t('delete_mutes.title')}
      visible={visible}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then((values) => {
          const groupIds: number[] = values.group_ids || [];
          if (!isAdmin && groupIds.length === 0) {
            message.error(t('delete_mutes.group_required'));
            return;
          }
          Modal.confirm({
            title: t('delete_mutes.alert_message'),
            onOk() {
              return deleteAlertMutes({
                group_ids: groupIds.length > 0 ? groupIds : undefined,
                timestamp: moment().subtract(values.month, 'months').unix(),
              }).then(() => {
                message.success(t('delete_mutes.submitted'));
                onOk();
              });
            },
          });
        });
      }}
    >
      <Alert className='mb-4' message={t('delete_mutes.alert_message')} type='warning' showIcon />
      <Form form={form} layout='vertical'>
        <Form.Item
          label={t('delete_mutes.group_ids')}
          name='group_ids'
          rules={[
            {
              required: !isAdmin,
              type: 'array',
              message: t('delete_mutes.group_required'),
            },
          ]}
          extra={isAdmin ? t('delete_mutes.group_admin_extra') : undefined}
        >
          <Select
            mode='multiple'
            allowClear
            showSearch
            optionFilterProp='label'
            placeholder={isAdmin ? t('delete_mutes.group_placeholder_admin') : t('delete_mutes.group_placeholder')}
            options={_.map(busiGroups, (item) => ({ label: item.name, value: item.id }))}
          />
        </Form.Item>
        <Form.Item label={t('delete_mutes.timestamp')} name='month' initialValue={3} rules={[{ required: true }]}>
          <Select options={monthOptions} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
