import React from 'react';

import { cn } from '@/utils';

interface IProps {
  children: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  className?: string;
}

export default function FormLabel({ children, description, required = true, className }: IProps) {
  return (
    <div className={cn('ant-form-item-label', className)}>
      <label className={required ? 'ant-form-item-required' : undefined}>{children}</label>
      {description && <div className='text-soft mt-0.5 font-normal'>{description}</div>}
    </div>
  );
}
