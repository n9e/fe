import React from 'react';
import { Button, Space, Affix, Card } from 'antd';
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
    <Affix offsetBottom={0}>
      <Card size='small' className='affix-bottom-shadow'>
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
      </Card>
    </Affix>
  );
}
