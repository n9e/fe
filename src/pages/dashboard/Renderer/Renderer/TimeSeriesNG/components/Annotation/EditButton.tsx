import React from 'react';
import { useTranslation } from 'react-i18next';
import { EditOutlined } from '@ant-design/icons';

import { putAnnotations } from '@/services/dashboardV2';

import FormModal, { Values } from './FormModal';

interface Props {
  initialValues: Values;
  timeZone?: string;
  onOk: () => void;
  onClick: () => void;
}

export default function EditButton(props: Props) {
  const { t } = useTranslation('dashboard');
  const { initialValues, timeZone, onOk, onClick } = props;
  const [visible, setVisible] = React.useState(false);

  return (
    <>
      <EditOutlined
        onClick={() => {
          onClick();
          setVisible(true);
        }}
      />
      <FormModal
        visible={visible}
        action='add'
        timeZone={timeZone}
        onOk={(values) => {
          putAnnotations(values.id, values).then(() => {
            onOk();
          });
          setVisible(false);
        }}
        onCancel={() => {
          setVisible(false);
        }}
        initialValues={{
          ...initialValues,
          tags: initialValues.tags ?? [], // 兼容 null
        }}
      />
    </>
  );
}
