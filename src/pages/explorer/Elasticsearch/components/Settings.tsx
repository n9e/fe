import React, { useEffect, useState } from 'react';
import { Dropdown, Menu, Modal, InputNumber, Form } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface Props {
  topn: number;
  setTopn: (value: number) => void;
}

export default function Settings(props: Props) {
  const { t } = useTranslation('explorer');
  const [topNValuesModalVisible, setTopNValuesModalVisible] = React.useState(false);
  const [topn, setTopn] = useState(props.topn);

  useEffect(() => {
    setTopn(props.topn);
  }, [props.topn]);

  return (
    <>
      <Dropdown
        overlay={
          <Menu
            items={[
              {
                key: 'topnBtn',
                label: (
                  <a
                    onClick={() => {
                      setTopNValuesModalVisible(true);
                    }}
                  >
                    {t('log.field_values_topn.settings.title')}
                  </a>
                ),
              },
            ]}
          />
        }
        trigger={['click']}
      >
        <SettingOutlined />
      </Dropdown>
      <Modal
        title={t('log.field_values_topn.settings.title')}
        visible={topNValuesModalVisible}
        onOk={() => {
          props.setTopn(topn);
          setTopNValuesModalVisible(false);
        }}
        onCancel={() => {
          setTopNValuesModalVisible(false);
        }}
      >
        <Form>
          <Form.Item>
            <InputNumber
              className='w-full'
              min={1}
              value={topn}
              onChange={(val) => {
                if (val) {
                  setTopn(val);
                }
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
