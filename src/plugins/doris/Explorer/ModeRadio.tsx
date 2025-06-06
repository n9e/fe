import React from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Radio, Space } from 'antd';
import Share from '@/pages/explorer/components/Share';

const ModeRadio = ({ mode, setMode, disabled }) => {
  const { t } = useTranslation('db_doris');
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Space>
        <Radio.Group
          value={mode}
          onChange={(e) => {
            setMode(e.target.value);
          }}
          buttonStyle='solid'
          disabled={disabled}
        >
          <Radio.Button value='raw'>{t('query.mode.raw')}</Radio.Button>
          <Radio.Button value='metric'>{t('query.mode.metric')}</Radio.Button>
        </Radio.Group>
      </Space>
      <Space>
        <Share />
      </Space>
    </div>
  );
};

export default ModeRadio;
