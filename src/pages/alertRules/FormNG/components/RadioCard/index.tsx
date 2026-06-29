import React from 'react';
import { Radio } from 'antd';
import type { RadioChangeEvent } from 'antd/es/radio';
import classnames from 'classnames';

export interface RadioCardProps {
  disabled?: boolean;
  value: string | number | boolean;
  onChange?: (e: RadioChangeEvent) => void;
  label: string;
  description?: string;
  className?: string;
}

export default function RadioCard(props: RadioCardProps) {
  const { disabled, value, onChange, label, description, className } = props;

  return (
    <Radio
      value={value}
      disabled={disabled}
      onChange={onChange}
      className={classnames(
        'items-start w-full min-h-[50px] mr-0 px-4 py-2.5 border border-solid border-[var(--fc-border-color)] rounded-lg bg-[var(--fc-fill-1)] transition-colors',
        '[&_.ant-radio]:top-0.5 [&_.ant-radio]:shrink-0',
        'hover:border-[var(--fc-violet-7)]',
        '[&.ant-radio-wrapper-checked]:border-[var(--fc-violet-6)] [&.ant-radio-wrapper-checked]:bg-[var(--fc-violet-2)] [&.ant-radio-wrapper-checked]:shadow-[0_0_0_1px_var(--fc-violet-5)]',
        '[&.ant-radio-wrapper-disabled]:cursor-not-allowed [&.ant-radio-wrapper-disabled]:bg-[var(--fc-fill-2)] [&.ant-radio-wrapper-disabled]:opacity-70',
        className,
      )}
    >
      <div className='flex flex-col gap-1 min-w-0'>
        <div className='leading-none font-bold'>{label}</div>
        {description && <div className='text-soft leading-snug'>{description}</div>}
      </div>
    </Radio>
  );
}
