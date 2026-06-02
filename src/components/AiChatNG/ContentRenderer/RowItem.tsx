import React from 'react';

interface IRowItemProps {
  label: string;
  value: React.ReactNode;
}

/** 卡片内的「标签 - 值」行，dashboard / alert_rule 等卡片共用，行间以浅分隔线区分。 */
export default function RowItem(props: IRowItemProps) {
  return (
    <div className='grid grid-cols-[120px_1fr] gap-3 border-t border-fc-200 py-2 first:border-t-0'>
      <div className='text-sm font-medium text-title'>{props.label}</div>
      <div className='min-w-0 text-sm text-main'>{props.value}</div>
    </div>
  );
}
