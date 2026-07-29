import React, { useContext, useState } from 'react';
import { Button, Tooltip } from 'antd';
import { DownOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons';
import { Braces } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import DocumentDrawer from '@/components/DocumentDrawer';

import { ALERT_VARS, DOC_URL } from '../../constants';

const NS = 'alertSelfHealing';
const STORAGE_KEY = 'task_tpl_var_panel_collapsed';

interface Props {
  /** 在脚本编辑器光标处插入文本 */
  onInsert: (text: string) => void;
  /** 在脚本顶部插入读取骨架（幂等） */
  onInsertSkeleton: () => void;
}

/**
 * 可用变量面板：把「告警上下文以 JSON 从 stdin 传入」这一隐性契约摆到脚本编辑器旁，
 * 列出字段 + 示例值，点击插入到光标处，并提供一键插入读取骨架。
 */
export default function VarPanel({ onInsert, onInsertSkeleton }: Props) {
  const { t, i18n } = useTranslation(NS);
  const { darkMode } = useContext(CommonStateContext);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  return (
    <div className='fc-border rounded-lg bg-fc-100 overflow-hidden'>
      <div className='flex items-center gap-2 px-3 py-2 cursor-pointer select-none border-b border-[var(--fc-border-color)]' onClick={toggle}>
        <Braces size={14} className='text-primary shrink-0' />
        <span className='font-medium text-title flex-1'>{t('var_panel.title')}</span>
        {collapsed ? <RightOutlined className='text-soft text-[10px]' /> : <DownOutlined className='text-soft text-[10px]' />}
      </div>
      {!collapsed && (
        <div className='p-3'>
          <div className='flex flex-col gap-2'>
            {ALERT_VARS.map((v) => (
              <div key={v.name} className='flex items-start gap-2'>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-1.5'>
                    <code className='text-[12px] text-title break-all'>{v.name}</code>
                    {!v.always && <span className='text-[10px] text-warning shrink-0'>{t('var_panel.optional_mark')}</span>}
                  </div>
                  <div className='text-[12px] text-soft leading-snug'>
                    {t(`var_panel.desc.${v.name}`)}
                    <span className='ml-1 opacity-70'>e.g. {v.example}</span>
                  </div>
                </div>
                <Tooltip title={`"$(evt ${v.name})"`}>
                  <Button size='small' type='link' className='shrink-0 px-1' onClick={() => onInsert(`"$(evt ${v.name})"`)}>
                    {t('var_panel.insert')}
                  </Button>
                </Tooltip>
              </div>
            ))}
          </div>
          <div className='mt-3 pt-3 border-t border-[var(--fc-border-color)] text-[12px] text-soft leading-snug'>{t('var_panel.hint')}</div>
          <div className='mt-2 flex items-center gap-3'>
            <Button size='small' type='dashed' icon={<PlusOutlined />} onClick={onInsertSkeleton}>
              {t('var_panel.insert_skeleton')}
            </Button>
            <a
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
              {t('var_panel.doc')}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
