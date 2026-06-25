import React, { useState, useEffect } from 'react';
import { Switch, Space, Button, Modal, message } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import EnhancedTable, { getEnabledStatusColumn } from '@/components/EnhancedTable';
import DocumentDrawer from '@/components/DocumentDrawer';
import { getNotifyChannels, putNotifyChannels } from '../services';
import { ChannelType } from '../types';
import AddModal from './AddModal';
import EditModal from './EditModal';

export default function Channels() {
  const { t, i18n } = useTranslation('notificationSettings');
  const [data, setData] = useState<ChannelType[]>([]);

  useEffect(() => {
    getNotifyChannels().then((res) => {
      setData(res);
    });
  }, []);

  return (
    <div className='channels-container'>
      <EnhancedTable<ChannelType>
        rowKey='ident'
        size='small'
        tableLayout='fixed'
        pagination={false}
        footer={() => {
          return (
            <Space>
              <Button
                type='primary'
                onClick={() => {
                  AddModal({
                    idents: data.map((item) => item.ident),
                    onOk: (values) => {
                      const newData = [...data, values];
                      putNotifyChannels(newData).then(() => {
                        setData(newData);
                        message.success(t('common:success.add'));
                      });
                    },
                  });
                }}
              >
                {t('channels.add')}
              </Button>
              <a
                style={{ fontSize: 12 }}
                onClick={() => {
                  DocumentDrawer({
                    language: i18n.language,
                    title: t('common:document_link'),
                    type: 'iframe',
                    documentPath: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/notify-channel/',
                  });
                }}
              >
                {t('common:document_link')}
              </a>
            </Space>
          );
        }}
        dataSource={data}
        columns={[
          {
            title: t('channels.name'),
            dataIndex: 'name',
            key: 'name',
          },
          {
            title: t('channels.ident'),
            dataIndex: 'ident',
            key: 'ident',
          },
          {
            ...getEnabledStatusColumn({
              title: t('channels.enabled'),
              dataIndex: 'hide',
              enabledText: t('channels.enabled'),
              disabledText: t('disabled'),
              enabledValue: false,
              disabledValue: true,
            }),
            key: 'hide',

            render: (val: boolean, record) => {
              return (
                <Switch
                  size='small'
                  checked={!val}
                  onChange={(checked) => {
                    const newData = _.map(data, (item) => {
                      if (item.ident === record.ident) {
                        return {
                          ...item,
                          hide: !checked,
                        };
                      }
                      return item;
                    });
                    putNotifyChannels(newData).then(() => {
                      setData(newData);
                      message.success(t('common:success.modify'));
                    });
                  }}
                />
              );
            },
          },
        ]}
        rowActions={(reocrd) => ({
          menu: _.compact([
            {
              key: 'edit',
              icon: 'edit',
              text: t('common:btn.edit'),
              onClick: () => {
                EditModal({
                  initialValues: reocrd,
                  onOk: (values) => {
                    const oldIndex = _.findIndex(data, (item) => item.ident === reocrd.ident);
                    const newData = _.map(data, (item, idx) => {
                      if (idx === oldIndex) {
                        return values;
                      }
                      return item;
                    });
                    putNotifyChannels(newData).then(() => {
                      setData(newData);
                      message.success(t('common:success.edit'));
                    });
                  },
                });
              },
            },
            !reocrd.built_in
              ? {
                  key: 'delete',
                  icon: 'delete',
                  text: t('common:btn.delete'),
                  danger: true,
                  onClick: () => {
                    Modal.confirm({
                      title: t('common:confirm.delete'),
                      onOk: () => {
                        const newData = _.filter(data, (item) => item.ident !== reocrd.ident);
                        putNotifyChannels(newData).then(() => {
                          setData(newData);
                          message.success(t('common:success.delete'));
                        });
                      },
                    });
                  },
                }
              : undefined,
          ]) as any,
        })}
        actionColumn={{ title: t('common:table.operations'), width: 64 }}
      ></EnhancedTable>
    </div>
  );
}
