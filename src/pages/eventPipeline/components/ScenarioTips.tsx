import React, { useContext, useState } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import DocumentDrawer from '@/components/DocumentDrawer';

import { NS, DOC_URL } from '../constants';
import ScenarioList from './ScenarioList';

const STORAGE_KEY = 'event_pipelines_scenario_tips_dismissed';

/**
 * 新建工作流时的场景说明卡：工作流概念门槛高但对新人不直观，只讲「什么时候该用它」。
 * localStorage 记住关闭状态，页面已有常驻文档入口，故不做二次召回。
 */
export default function ScenarioTips() {
  const { t, i18n } = useTranslation(NS);
  const { darkMode } = useContext(CommonStateContext);
  const [visible, setVisible] = useState(() => localStorage.getItem(STORAGE_KEY) !== 'true');

  if (!visible) return null;

  return (
    <div className='relative mb-4 p-4 rounded-lg fc-border bg-fc-100'>
      <CloseOutlined
        className='absolute right-3 top-3 text-[12px] text-soft hover:text-title cursor-pointer'
        onClick={() => {
          localStorage.setItem(STORAGE_KEY, 'true');
          setVisible(false);
        }}
      />
      <div className='flex items-center gap-2 mb-2 pr-6 font-bold text-title'>
        <Lightbulb size={14} className='text-primary shrink-0' />
        {t('scenario_tips.title')}
      </div>
      <ScenarioList className='text-soft' />
      <a
        className='inline-block mt-2 ml-[18px]'
        onClick={() => {
          DocumentDrawer({
            language: i18n.language,
            darkMode,
            title: t('common:page_help'),
            type: 'iframe',
            documentPath: DOC_URL,
          });
        }}
      >
        {t('scenario_tips.more')} →
      </a>
    </div>
  );
}
