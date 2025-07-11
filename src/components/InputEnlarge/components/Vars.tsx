import React from 'react';
import { Form, Input, Space, Tag } from 'antd';
import { useTranslation, Trans } from 'react-i18next';

export default function Vars({ vars, handleClickVar }: { vars: string[]; handleClickVar: (v: string) => void }) {
  const { t } = useTranslation('inputEnlarge');
  return (
    <div style={{ border: '1px solid var(--fc-border-color)', padding: 8 }}>
      <div className='input-enlarge-vars-title'>{t('可选变量')}</div>
      <Space wrap size={[0, 8]}>
        {vars.map((item) => (
          <Tag key={item} style={{ cursor: 'pointer' }} onClick={() => handleClickVar(item)}>
            ${item}
          </Tag>
        ))}
      </Space>
    </div>
  );
}
