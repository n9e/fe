import React from 'react';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import _ from 'lodash';

interface Props {
  children: React.ReactNode;
  onClick: (e: any) => void;
  disabled?: boolean;
}

export default function Describe(props: Props) {
  const { children, onClick, disabled } = props;

  return (
    <div
      className={`border border-antd rounded-sm hover:bg-fc-150 min-h-[24px] wrap-break-word whitespace-normal cursor-pointer flex items-center justify-between ${
        disabled ? 'opacity-50 bg-fc-100' : ''
      }`}
    >
      <div
        className='h-full px-[7px] flex items-center relative'
        style={{
          borderRight: '1px solid var(--fc-antd-border-color)',
        }}
      >
        {disabled && <span className='absolute left-[7px] right-[7px] top-1/2 border-t border-current pointer-events-none' />}
        {children}
      </div>
      <Button className='p-0 min-h-[22px] bg-fc-150 hover:bg-fc-200' size='small' icon={<CloseOutlined />} type='text' onClick={onClick} />
    </div>
  );
}
