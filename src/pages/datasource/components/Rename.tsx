import React, { useState } from 'react';
import { Popover, Input, Space, Button, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { submitRequest } from '../services';

interface IProps {
  text: string;
  children: React.ReactNode;
  values: any;
  callback: () => void;
}

export default function Rename(props: IProps) {
  const { t } = useTranslation('datasourceManage');
  const { children, text, values, callback } = props;
  const [value, setValue] = useState(text);
  const [visible, setVisible] = useState(false);
  return (
    <div className='custom-dimension-settings-table-name'>
      {children}
      <Popover
        visible={visible}
        onVisibleChange={(visible) => {
          setVisible(visible);
        }}
        content={
          <div>
            <Input value={value} onChange={(e) => setValue(e.target.value)} />
            <Space style={{ marginTop: 16 }}>
              <Button
                type='primary'
                onClick={() => {
                  submitRequest({
                    ...values,
                    name: value,
                  })
                    .then(() => {
                      message.success(t('common:success.modify'));
                      callback();
                    })
                    .finally(() => {
                      setVisible(false);
                    });
                }}
              >
                {t('common:btn.save')}
              </Button>
              <Button onClick={() => setVisible(false)}>{t('common:btn.cancel')}</Button>
            </Space>
          </div>
        }
        title={t('rename_title')}
        trigger='click'
      >
        <EditOutlined
          onClick={() => {
            setVisible(true);
          }}
        />
      </Popover>
    </div>
  );
}
