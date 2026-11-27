import React from 'react';
import { Button, Space, Affix, Card, Tooltip } from 'antd';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useGlobalState } from '../../Form';

interface IProps {
  id?: number | string;
  submitLoading: boolean;
  extra?: React.ReactNode;
  disableTestAndSave?: boolean;
}

export default function Footer(props: IProps) {
  const { t } = useTranslation('datasourceManage');
  const history = useHistory();
  const { id, submitLoading, extra, disableTestAndSave } = props;
  const [saveMode, setSaveMode] = useGlobalState('saveMode');

  const testAndSaveBtn = (
    <Button
      type={disableTestAndSave ? 'default' : 'primary'}
      htmlType={disableTestAndSave ? 'button' : 'submit'}
      disabled={disableTestAndSave}
      loading={!disableTestAndSave && submitLoading}
      onClick={() => {
        setSaveMode('saveAndTest');
      }}
    >
      {t('test_and_save_btn')}
    </Button>
  );

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

          {disableTestAndSave ? <Tooltip title={t('form.edge_skip_test_tip')}>{testAndSaveBtn}</Tooltip> : testAndSaveBtn}
          <Button
            type={disableTestAndSave ? 'primary' : 'default'}
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
