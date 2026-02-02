import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import PageLayout from '@/components/pageLayout';

import OperateForm from './components/operateForm';
import './index.less';

const StrategyAdd: React.FC = () => {
  const { t } = useTranslation('recordingRules');
  const { businessGroup } = useContext(CommonStateContext);

  return (
    <PageLayout title={t('title')} showBack>
      <OperateForm
        initialValues={{
          group_id: businessGroup?.id,
        }}
      />
    </PageLayout>
  );
};

export default StrategyAdd;
