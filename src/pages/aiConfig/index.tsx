import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import PageLayout from '@/components/pageLayout';
import Agents from './Agents';
import LLMConfigs from './LLMConfigs';
import Skills from './Skills';
import MCPServers from './MCPServers';

export default function AIConfig() {
  const { t } = useTranslation('aiConfig');
  const location = useLocation();

  let content: React.ReactNode;
  if (location.pathname.includes('llm-configs')) {
    content = <LLMConfigs />;
  } else if (location.pathname.includes('skills')) {
    content = <Skills />;
  } else if (location.pathname.includes('mcp-servers')) {
    content = <MCPServers />;
  } else {
    content = <Agents />;
  }

  return (
    <PageLayout title={t('title')}>
      <div className='n9e' style={{ padding: '16px 24px' }}>{content}</div>
    </PageLayout>
  );
}
