import React from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import OperateForm from './components/operateForm';
import './index.less';

const StrategyAdd: React.FC = () => {
  const { t } = useTranslation('recordingRules');
  return (
    <PageLayout title={t('title')} showBack>
      <OperateForm />
    </PageLayout>
  );
};

export default StrategyAdd;
