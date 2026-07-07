import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import { DownOutlined } from '@ant-design/icons';
import { FileText, Database, TriangleAlert, Workflow, Bell, CalendarClock, Settings } from 'lucide-react';

export interface SectionItem {
  key: string;
  title: string;
  description: string;
  tag: 'default' | 'core' | 'optional';
}

export const tagClassesMap: Record<SectionItem['tag'], string> = {
  default: 'bg-primary/10 text-primary border border-primary/20',
  core: 'bg-red-900/10 text-red-900 border border-red-900/20',
  optional: 'bg-fc-200 text-soft fc-border',
};

export const tagI18nKeys: Record<SectionItem['tag'], string> = {
  default: 'tag_default',
  core: 'tag_core',
  optional: 'tag_optional',
};

const sectionIcons: Record<string, React.ReactNode> = {
  basic: <FileText size={14} />,
  datasource: <Database size={14} />,
  rule: <TriangleAlert size={14} />,
  pipeline: <Workflow size={14} />,
  notify: <Bell size={14} />,
  effective: <CalendarClock size={14} />,
  advanced: <Settings size={14} />,
};

export default function SectionCard(props: {
  className?: string;
  item: SectionItem;
  index: number;
  sectionRef: (node: HTMLDivElement | null) => void;
  children?: React.ReactNode;
  empty?: boolean;
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
}) {
  const { item, index, sectionRef, children, empty, setCollapsed: onSetCollapsed } = props;
  const { t } = useTranslation('alertRules');
  const [collapsed, setCollapsed] = useState(props.collapsed ?? item.tag === 'optional');

  // Sync with externally controlled collapsed prop
  useEffect(() => {
    if (props.collapsed !== undefined) {
      setCollapsed(props.collapsed);
    }
  }, [props.collapsed]);

  return (
    <div ref={sectionRef} className={classnames('scroll-mt-4 [&+&]:mt-4', props.className)} data-section-key={item.key}>
      <div className='fc-border rounded-lg shadow-[0_3px_12px_rgba(0,0,0,0.04)] overflow-hidden'>
        <div
          className={'flex items-center gap-3 p-4 cursor-pointer select-none ' + (collapsed ? '' : 'bg-violet-200')}
          onClick={() => {
            const next = !collapsed;
            setCollapsed(next);
            onSetCollapsed?.(next);
          }}
        >
          <div
            className={classnames(
              'flex items-center justify-center w-7 h-7 rounded-lg text-xs font-normal shrink-0 transition-colors',
              collapsed ? 'bg-[var(--fc-violet-3)] text-main' : 'bg-[var(--fc-violet-9)] text-white',
            )}
          >
            {index + 1}
          </div>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2'>
              <span className={classnames('pt-1', !collapsed ? 'text-[var(--fc-violet-11)]' : 'text-soft')}>{sectionIcons[item.key]}</span>
              <div className='text-l1 font-bold text-title'>{item.title}</div>
              <span className={'text-[10px] px-1.5 py-0.5 rounded leading-none ' + tagClassesMap[item.tag]}>{t(tagI18nKeys[item.tag])}</span>
            </div>
            <div className='text-[12px] text-soft pl-[22px] mt-0.5 font-normal'>{item.description}</div>
          </div>
          <div className='flex items-center self-start mt-1'>
            <DownOutlined className='text-soft text-[10px] transition-transform duration-200' style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }} />
          </div>
        </div>
        <div className={empty ? 'min-h-[112px] m-4.5 border border-dashed border-[var(--fc-border-color)] rounded-lg' : 'p-4'} style={{ display: collapsed ? 'none' : undefined }}>
          {children}
        </div>
      </div>
    </div>
  );
}
