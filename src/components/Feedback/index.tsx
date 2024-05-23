import React from 'react';
import { SmileOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './style.less';
import './locale';

export default function index() {
  const { t } = useTranslation('Feedback');
  if (import.meta.env.VITE_IS_ENT !== 'true' && import.meta.env.VITE_IS_PRO !== 'true') {
    return (
      <a href='https://c9xudyniiq.feishu.cn/share/base/form/shrcnpCTOJ1CCmNhfCx4aEsP8Vf' target='_blank'>
        <div className='n9e-feedback-container'>
          <SmileOutlined />
          <div className='n9e-feedback-text'>{t('feedback')}</div>
        </div>
      </a>
    );
  }
  return null;
}
