import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import PageLayout from '@/components/pageLayout';
import Agents from './Agents';
import Skills from './Skills';
import MCPServers from './MCPServers';

export default function AIConfig() {
  const { t } = useTranslation('aiConfig');
  const location = useLocation();

  let content: React.ReactNode;
  if (location.pathname.includes('skills')) {
    content = <Skills />;
  } else if (location.pathname.includes('mcp-servers')) {
    content = <MCPServers />;
  } else {
    content = <Agents />;
  }

  return (
    <PageLayout title={t('title')}>
      <div style={{ padding: '0 24px' }}>{content}</div>
    </PageLayout>
  );
}
