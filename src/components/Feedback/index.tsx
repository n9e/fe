import React, { useState, useEffect } from 'react';
import { SmileOutlined } from '@ant-design/icons';
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
      <div
        draggable={false}
        className='n9e-feedback-container'
        style={{ right: position.right, bottom: position.bottom }}
        onMouseDown={handleMouseDown}
        onClick={() => {
          if (!isMoving) {
            window.open('https://c9xudyniiq.feishu.cn/share/base/form/shrcnpCTOJ1CCmNhfCx4aEsP8Vf');
          } else {
            setIsMoving(false);
          }
        }}
      >
        <SmileOutlined />
        <div className='n9e-feedback-text'>{t('feedback')}</div>
      </div>
    );
  }
  return null;
}
