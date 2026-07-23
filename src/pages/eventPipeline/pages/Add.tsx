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
  /** 保存成功即触发，用于刷新列表；此时抽屉还停留在「去挂载」面板上 */
  onSaved?: () => void;
  onOk: () => void;
  onCancel: () => void;
}

export default function Add({ initialValues, onSaved, onOk, onCancel }: Props) {
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
          // 列表刷新不能只挂在接力面板的「完成」上：用户可能直接关掉抽屉，那样列表会看不到刚建的工作流
          onSaved?.();
          setSaved(true);
        });
      }}
      onCancel={onCancel}
    />
  );
}
