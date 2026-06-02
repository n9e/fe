import React from 'react';

interface IContentCardProps {
  /** 头部标题前的图标，颜色已统一为 text-primary */
  icon: React.ReactNode;
  title: React.ReactNode;
  children: React.ReactNode;
  /** body 容器的 className，各卡片内边距不同，默认 px-4 py-4 */
  bodyClassName?: string;
}

/**
 * AI Chat 消息卡片的统一外壳：白底、圆角、浅边框 + 软阴影，头部为「图标 + 标题 + 分隔线」。
 * form_select / dashboard / alert_rule / query 等内容块共用，样式调整只需改这一处。
 */
export default function ContentCard(props: IContentCardProps) {
  const { icon, title, children, bodyClassName = 'px-4 py-4' } = props;

  return (
    <div className='rounded-xl border border-fc-200 bg-white shadow-mf'>
      <div className='flex items-center gap-2 border-b border-fc-200 px-4 py-3'>
        <span className='inline-flex text-primary' style={{ fontSize: 16 }}>
          {icon}
        </span>
        <div className='text-sm font-semibold text-title'>{title}</div>
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
