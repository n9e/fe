import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { message } from 'antd';

import { NS } from '../constants';
import { postItem } from '../services';
import Form from './Form';
import SavedGuide from '../components/SavedGuide';
import { normalizeFormValues } from '../utils/normalizeValues';

interface Props {
  initialValues?: any;
  onOk: () => void;
  onCancel: () => void;
}

export default function Add({ initialValues, onOk, onCancel }: Props) {
  const { t } = useTranslation(NS);
  const [saved, setSaved] = useState(false);

  // 保存成功后展示「去挂载」接力面板，而不是直接关闭——工作流不被规则引用不会生效
  if (saved) {
    return <SavedGuide onDone={onOk} />;
  }

  return (
    <Form
      initialValues={initialValues}
      showScenarioTips={!initialValues}
      onOk={(values) => {
        postItem(normalizeFormValues(values)).then(() => {
          message.success(t('common:success.add'));
          setSaved(true);
        });
      }}
      onCancel={onCancel}
    />
  );
}
