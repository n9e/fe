import React, { useEffect, useRef, useState } from 'react';
import { Button, ConfigProvider, Space, Tooltip } from 'antd';
import { FullscreenExitOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { TimeRangePickerWithRefresh } from '@/components/TimeRangePicker';
import { IRawTimeRange } from '@/components/TimeRangePicker';

import { NS, TIME_RANGE_CACHE_KEY } from '../../constants';

interface IProps {
  title: string;
  children: React.ReactNode;
  range?: IRawTimeRange;
  onRangeChange: (range?: IRawTimeRange) => void;
  onRefresh: () => void;
  onExit: () => void;
}

export default function FullscreenList({ title, children, range, onRangeChange, onRefresh, onExit }: IProps) {
  const { t } = useTranslation(NS);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const containerRef = useRef<HTMLDivElement>(null);

  // 退出全屏时把自动刷新缓存置为 Off。该 key 与常规列表的 TimeRangePickerWithRefresh 共享，
  // 因此离开全屏大屏后常规列表也会停止轮询；AutoRefresh 自身的卸载清理已停掉全屏内的定时器。
  useEffect(() => {
    return () => {
      localStorage.setItem(`${TIME_RANGE_CACHE_KEY}_refresh`, '0');
    };
  }, []);

  return (
    <ConfigProvider getPopupContainer={() => containerRef.current ?? document.body}>
      <div ref={containerRef} className='flex h-full flex-col bg-fc-100 p-4'>
        <div className='mb-4 flex shrink-0 items-center justify-between border-0 border-b border-solid border-[var(--fc-border-color)] bg-fc-100 pb-4'>
          <div className='flex items-center text-title'>
            <span className='text-[18px] font-semibold leading-7'>{title}</span>
            <span className='ml-3 inline-flex items-center gap-2 text-[14px] font-medium leading-[22px] text-green-900'>
              <span className='relative inline-flex h-3.5 w-3.5 items-center justify-center' aria-hidden>
                <span className='absolute h-2.5 w-2.5 rounded-full border border-green-900 motion-reduce:animate-none animate-[ping_2s_ease-out_infinite]' />
                <span className='absolute h-2.5 w-2.5 rounded-full border border-green-900 motion-reduce:animate-none animate-[ping_2s_ease-out_infinite] [animation-delay:0.8s]' />
                <span className='relative z-[1] h-2 w-2 rounded-full bg-green-900' />
              </span>
              <span>LIVE</span>
            </span>
          </div>
          <Space>
            <TimeRangePickerWithRefresh
              allowClear
              value={range}
              onChange={onRangeChange}
              onRefresh={onRefresh}
              intervalSeconds={refreshInterval}
              onIntervalSecondsChange={setRefreshInterval}
              localKey={TIME_RANGE_CACHE_KEY}
              dateFormat='YYYY-MM-DD HH:mm:ss'
            />
            <Tooltip title={t('dashboard:exit_full_screen')}>
              <Button icon={<FullscreenExitOutlined />} onClick={onExit} />
            </Tooltip>
          </Space>
        </div>
        <div className='h-full min-h-0 flex-1'>{children}</div>
      </div>
    </ConfigProvider>
  );
}
