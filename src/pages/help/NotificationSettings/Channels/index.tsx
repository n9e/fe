import React, { useState, useEffect } from 'react';
import { Table, Switch, Space, Button, Modal, Dropdown, Menu, message } from 'antd';
import { TableActionButton, TableActionTrigger } from '@/components/TableActionDropdown';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
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
      <Table<ChannelType>
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
            title: t('channels.enabled'),
            dataIndex: 'hide',
            key: 'hide',
            render: (val: boolean, record) => {
              return (
                <Switch
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
          {
            title: t('common:table.operations'),
            width: 64,
            fixed: 'right' as const,
            render: (reocrd) => {
              return (
                <Dropdown
                  trigger={['click']}
                  overlayClassName='fc-table-action-dropdown'
                  overlay={
                    <Menu>
                      <Menu.Item>
                        <TableActionButton
                          actionIcon='edit'
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
                                  message.success(t('common:success.edit'));
                                });
                              },
                            });
                          }}
                        >
                          {t('common:btn.edit')}
                        </TableActionButton>
                      </Menu.Item>
                      {!reocrd.built_in && (
                        <>
                          <Menu.Divider />
                          <Menu.Item>
                            <TableActionButton
                              actionIcon='delete'
                              danger
                              onClick={() => {
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
                              }}
                            >
                              {t('common:btn.delete')}
                            </TableActionButton>
                          </Menu.Item>
                        </>
                      )}
                    </Menu>
                  }
                >
                  <TableActionTrigger />
                </Dropdown>
              );
            },
          },
        ]}
      ></Table>
    </div>
  );
}
