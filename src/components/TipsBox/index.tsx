import React, { CSSProperties, ReactNode, useState } from 'react';
import './style.less';
import { useTranslation } from 'react-i18next';
import { DownOutlined, RightOutlined } from '@ant-design/icons';

interface IProps {
  tips: ReactNode;
  localStorageName?: string;
  showTitle?: boolean;
  showFold?: boolean;
  customStyle?: CSSProperties;
}

export default function TipsBox(props: IProps) {
  const { t } = useTranslation();
  const { tips, localStorageName, showTitle, showFold, customStyle } = props;

  const [fold, setFold] = useState<boolean>(localStorageName ? localStorage.getItem(localStorageName) === '1' : false);

  const foldChange = () => {
    localStorageName && localStorage.setItem(localStorageName, !fold ? '1' : '0');
    setFold(!fold);
  };
  return (
    <div className='tipsBox' style={{ ...customStyle }}>
      {showTitle && (
        <div className='tipsTitle'>
          <div>{t('说明提示')}</div>
          {showFold && (
            <div
              onClick={() => {
                foldChange();
              }}
              style={{ cursor: 'pointer', fontSize: '14px' }}
            >
              {fold ? <RightOutlined /> : <DownOutlined />}
            </div>
          )}
        </div>
      )}
      <div>{!fold && tips}</div>
    </div>
  );
}
