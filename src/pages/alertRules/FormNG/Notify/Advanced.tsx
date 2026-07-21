import React from 'react';

import { useFormNGData } from '../context';

// @ts-ignore
import NotifyExtraNG from 'plus:/parcels/AlertRule/NotifyExtraNG';

interface Props {
  sectionRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  expandSignal?: { key: string; ts: number } | null;
  toggleAllSignal?: { action: 'expand' | 'collapse'; ts: number } | null;
}

/**
 * 高级配置分区（plus）。数据取自 FormNGDataProvider，故用本组件包一层，
 * 以便在表单最后位置渲染，与分区配置表中的顺序保持一致
 */
export default function Advanced({ sectionRefs, expandSignal, toggleAllSignal }: Props) {
  const { notifyChannels: contactList, teams: notifyGroups } = useFormNGData();

  return <NotifyExtraNG sectionRefs={sectionRefs} contactList={contactList} notifyGroups={notifyGroups} expandSignal={expandSignal} toggleAllSignal={toggleAllSignal} />;
}
