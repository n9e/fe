import React from 'react';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import _ from 'lodash';

interface Props {
  children: React.ReactNode;
  onClick: (e: any) => void;
}

export default function Describe(props: Props) {
  const { children, onClick } = props;

  return (
    <div className='border border-antd rounded-sm hover:bg-fc-150 min-h-[24px] wrap-break-word whitespace-normal cursor-pointer flex items-center justify-between'>
      <div
        className='h-full px-[7px] flex items-center'
        style={{
          borderRight: '1px solid var(--fc-antd-border-color)',
        }}
      >
        {children}
      </div>
      <Button className='p-0 min-h-[22px] bg-fc-150 hover:bg-fc-200' size='small' icon={<CloseOutlined />} type='text' onClick={onClick} />
    </div>
  );
}
