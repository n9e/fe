import React, { useState } from 'react';
import { Button, Space, message } from 'antd';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface IProps {
  id?: number | string;
  submitLoading: boolean;
}

export default function Footer(props: IProps) {
  const { t } = useTranslation('datasourceManage');
  const history = useHistory();
  return (
    <div className='settings-source-form-footer'>
      <Space>
        {props.id !== undefined ? (
          <Button
            onClick={() => {
              history.go(-1);
            }}
          >
            {t('common:btn.back')}
          </Button>
        ) : null}
        <Button type='primary' htmlType='submit' loading={props.submitLoading}>
          {t('common:btn.testAndSave')}
        </Button>
      </Space>
    </div>
  );
}
