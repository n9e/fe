import React from 'react';
import { Empty } from 'antd';

interface EmptyGuideProps {
  /** 一句话解释“为什么是空的” */
  title?: React.ReactNode;
  /** 补充说明，告诉用户接下来该做什么 */
  description?: React.ReactNode;
  /** 主 CTA + 次级链接（按钮 / 链接） */
  actions?: React.ReactNode;
  image?: React.ReactNode;
  className?: string;
}

/**
 * 列表/表格空状态的引导组件：在“暂无数据”的基础上，解释原因并给出明确的下一步操作。
 * 通常通过 antd Table 的 `locale={{ emptyText: <EmptyGuide ... /> }}` 使用。
 */
export default function EmptyGuide(props: EmptyGuideProps) {
  const { title, description, actions, image, className } = props;
  return (
    <Empty className={className} image={image ?? Empty.PRESENTED_IMAGE_SIMPLE} description={null}>
      <div className='flex flex-col items-center gap-1'>
        {title && <div className='text-[14px] font-medium'>{title}</div>}
        {description && <div className='max-w-[460px] opacity-70'>{description}</div>}
        {actions && <div className='mt-3 flex flex-wrap items-center justify-center gap-3'>{actions}</div>}
      </div>
    </Empty>
  );
}
