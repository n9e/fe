import React, { useState, useEffect } from 'react';
import { Popover, Space } from 'antd';
import { QuestionCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { useGetState } from 'ahooks';
import './style.less';
import './locale';

const cacheKey = 'n9e-feedback-position-bottom';
const getCacheBottom = () => {
  const bottom = localStorage.getItem(cacheKey);
  return bottom ? parseInt(bottom, 10) : 24;
};
const setCacheBottom = (bottom: number) => {
  localStorage.setItem(cacheKey, bottom.toString());
};

export default function Index() {
  const { t } = useTranslation('Feedback');
  const location = useLocation();
  const query = queryString.parse(location.search);

  const [position, setPosition] = useState({ right: -4, bottom: getCacheBottom() });
  const [isDragging, setIsDragging, getIsDragging] = useGetState(false);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (getIsDragging()) {
        const newBottom = window.innerHeight - event.clientY - 24;
        setPosition((prevPosition) => ({
          ...prevPosition,
          bottom: newBottom,
        }));
        setIsMoving(true);
        setCacheBottom(newBottom);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  if (import.meta.env.VITE_IS_ENT !== 'true' && import.meta.env.VITE_IS_PRO !== 'true' && query?.viewMode !== 'fullscreen') {
    return (
      <Popover
        content={
          <div className='w-[500px]'>
            <div className='text-[16px] mb-4 text-center'>{t('title')}</div>
            <a target='_blank' rel='noopener noreferrer' href='https://deepwiki.com/ccfos/nightingale'>
              <div
                className='px-8 py-4 mb-2 rounded-[8px] text-[14px] hover:bg-[var(--fc-fill-3)]'
                style={{
                  border: '1px solid var(--fc-border-color)',
                }}
              >
                <div
                  className='font-bold mb-2'
                  style={{
                    color: 'var(--fc-text-1)',
                  }}
                >
                  {t('ai.title')}
                </div>
                <div className='flex justify-between items-center'>
                  <div className='second-color'>{t('ai.description')}</div>
                  <div
                    style={{
                      color: 'var(--fc-geekblue-6-color)',
                    }}
                  >
                    <Space>
                      {t('ai.link_btn')}
                      <ArrowRightOutlined />
                    </Space>
                  </div>
                </div>
              </div>
            </a>
            <a target='_blank' rel='noopener noreferrer' href='https://n9e.github.io/zh/'>
              <div
                className='px-8 py-4 mb-2 rounded-[8px] text-[14px] hover:bg-[var(--fc-fill-3)]'
                style={{
                  border: '1px solid var(--fc-border-color)',
                }}
              >
                <div
                  className='font-bold mb-2'
                  style={{
                    color: 'var(--fc-text-1)',
                  }}
                >
                  {t('docs.title')}
                </div>
                <div className='flex justify-between items-center'>
                  <div className='second-color'>{t('docs.description')}</div>
                  <div
                    style={{
                      color: 'var(--fc-text-1)',
                    }}
                  >
                    <Space>
                      {t('docs.link_btn')}
                      <ArrowRightOutlined />
                    </Space>
                  </div>
                </div>
              </div>
            </a>
            <a target='_blank' rel='noopener noreferrer' href='https://github.com/ccfos/nightingale/issues'>
              <div
                className='px-8 py-4 rounded-[8px] text-[14px] hover:bg-[var(--fc-fill-3)]'
                style={{
                  border: '1px solid var(--fc-border-color)',
                }}
              >
                <div
                  className='font-bold mb-2'
                  style={{
                    color: 'var(--fc-text-1)',
                  }}
                >
                  {t('issues.title')}
                </div>
                <div className='flex justify-between items-center'>
                  <div className='second-color'>{t('issues.description')}</div>
                  <div
                    style={{
                      color: 'var(--fc-orange-6-color)',
                    }}
                  >
                    <Space>
                      {t('issues.link_btn')}
                      <ArrowRightOutlined />
                    </Space>
                  </div>
                </div>
              </div>
            </a>
          </div>
        }
        placement='leftBottom'
      >
        <div draggable={false} className='n9e-feedback-container' style={{ right: position.right, bottom: position.bottom }} onMouseDown={handleMouseDown}>
          <QuestionCircleOutlined />
        </div>
      </Popover>
    );
  }
  return null;
}
