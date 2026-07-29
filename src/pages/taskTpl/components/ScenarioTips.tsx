import React, { useContext, useState } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import DocumentDrawer from '@/components/DocumentDrawer';

import { DOC_URL } from '../constants';
import ScenarioList from './ScenarioList';

const STORAGE_KEY = 'alert_self_healing_scenario_tips_dismissed';

/**
 * 新建自愈脚本时的场景说明卡片：只讲「什么时候该用它」。
 * 有关闭按钮，dismiss 状态存 localStorage，对老用户零打扰。
 */
export default function ScenarioTips() {
  const { t, i18n } = useTranslation('alertSelfHealing');
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
