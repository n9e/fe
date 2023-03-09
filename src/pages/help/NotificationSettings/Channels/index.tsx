import React, { useState, useEffect } from 'react';
import { Table, Switch, Space, Button, Popconfirm, message } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { getNotifyChannels, putNotifyChannels } from '../services';
import { ChannelType } from '../types';
import AddModal from './AddModal';
import EditModal from './EditModal';

export default function Channels() {
  const { t } = useTranslation('notificationSettings');
  const [data, setData] = useState<ChannelType[]>([]);

  useEffect(() => {
    getNotifyChannels().then((res) => {
      setData(res);
    });
  }, []);

  return (
    <div className='channels-container'>
      <Table<ChannelType>
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
            title: t('channels.hide'),
            dataIndex: 'hide',
            key: 'hide',
            render: (val: boolean, record) => {
              return (
                <Switch
                  checked={val}
                  onChange={(checked) => {
                    const newData = _.map(data, (item) => {
                      if (item.ident === record.ident) {
                        return {
                          ...item,
                          hide: checked,
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
          {
            title: t('common:table.operations'),
            width: 100,
            render: (reocrd) => {
              return (
                <Space>
                  <a
                    onClick={() => {
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
                            message.success(t('common:success.modify'));
                          });
                        },
                      });
                    }}
                  >
                    {t('common:btn.modify')}
                  </a>
                  {!reocrd.built_in && (
                    <Popconfirm
                      title={t('common:confirm.delete')}
                      onConfirm={() => {
                        const newData = _.filter(data, (item) => item.ident !== reocrd.ident);
                        putNotifyChannels(newData).then(() => {
                          setData(newData);
                          message.success(t('common:success.delete'));
                        });
                      }}
                    >
                      <a>{t('common:btn.delete')}</a>
                    </Popconfirm>
                  )}
                </Space>
              );
            },
          },
        ]}
      ></Table>
    </div>
  );
}
