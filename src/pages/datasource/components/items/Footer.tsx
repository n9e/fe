import React from 'react';
import { Button, Space, Affix, Card } from 'antd';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useGlobalState } from '../../Form';

interface IProps {
  id?: number | string;
  submitLoading: boolean;
  extra?: React.ReactNode;
}

export default function Footer(props: IProps) {
  const { t } = useTranslation('datasourceManage');
  const history = useHistory();
  const { id, submitLoading, extra } = props;
  const [saveMode, setSaveMode] = useGlobalState('saveMode');

  return (
    <Affix offsetBottom={0}>
      <Card size='small' className='affix-bottom-shadow'>
        <Space>
          {id !== undefined ? (
            <Button
              onClick={() => {
                history.go(-1);
              }}
            >
              {t('common:btn.back')}
            </Button>
          ) : null}

          <Button
            type='primary'
            htmlType='submit'
            loading={submitLoading}
            onClick={() => {
              setSaveMode('saveAndTest');
            }}
          >
            {t('test_and_save_btn')}
          </Button>
          <Button
            htmlType='submit'
            loading={submitLoading}
            onClick={() => {
              setSaveMode('save');
            }}
          >
            {t('save_btn')}
          </Button>
          {extra}
        </Space>
      </Card>
    </Affix>
  );
}
