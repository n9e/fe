import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tooltip } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

import { copy2ClipBoard } from '@/utils';

import { NS } from '../../../constants';

/** 一键安装 / 配置采集共用的命令展示块：等宽预格式化 + 右上角复制 */
export default function CommandBlock({ command }: { command: string }) {
  const { t } = useTranslation(NS);
  return (
    <div className='relative bg-fc-100 fc-border rounded-lg p-3 pr-10'>
      <pre className='m-0 whitespace-pre-wrap break-all text-[12px] leading-5'>{command}</pre>
      <Tooltip title={t('install.copy')}>
        <Button size='small' type='text' icon={<CopyOutlined />} className='absolute right-1 top-1' onClick={() => copy2ClipBoard(command)} />
      </Tooltip>
    </div>
  );
}
