import React, { useState, useEffect } from 'react';
import { Drawer, Table, Switch, Space, Button, Modal, message } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { CloseOutlined } from '@ant-design/icons';

import { getNotifyContacts, putNotifyContacts } from './services';
import { ContactType } from './types';
import { NS, CN } from './constants';
import AddModal from './AddModal';
import EditModal from './EditModal';

interface Props {
  open?: boolean;
  onCloseDrawer: () => void;
}
export default function ContactDrawer(props: Props) {
  const { open, onCloseDrawer } = props;
  const { t } = useTranslation(NS);
  const [data, setData] = useState<ContactType[]>([]);

  useEffect(() => {
    getNotifyContacts().then((res) => {
      setData(res);
    });
  }, []);

  return (
    <Drawer width={700} closable={false} title={t('title')} destroyOnClose extra={<CloseOutlined onClick={onCloseDrawer} />} onClose={onCloseDrawer} visible={open}>
      <div className='n9e'>
        <div className={CN}>
          <div className='mb2 n9e-flex n9e-justify-between'>
            <div />
            <Space>
              <Button
                type='primary'
                onClick={() => {
                  AddModal({
                    idents: _.map(data, (item) => item.ident),
                    onOk: (values) => {
                      const newData = [...data, values];
                      putNotifyContacts(newData).then(() => {
                        setData(newData);
                        message.success(t('common:success.add'));
                      });
                    },
                  });
                }}
              >
                {t('common:btn.add')}
              </Button>
            </Space>
          </div>
          <Table<ContactType>
            rowKey='ident'
            size='small'
            pagination={false}
            dataSource={data}
            columns={[
              {
                title: t('common:table.name'),
                dataIndex: 'name',
                key: 'name',
              },
              {
                title: t('common:table.ident'),
                dataIndex: 'ident',
                key: 'ident',
              },
              {
                title: t('common:table.enabled'),
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
                        putNotifyContacts(newData).then(() => {
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
                              putNotifyContacts(newData).then(() => {
                                setData(newData);
                                message.success(t('common:success.edit'));
                              });
                            },
                          });
                        }}
                      >
                        {t('common:btn.edit')}
                      </a>
                      {!reocrd.built_in && (
                        <Button
                          size='small'
                          type='link'
                          danger
                          style={{
                            padding: 0,
                          }}
                          onClick={() => {
                            Modal.confirm({
                              title: t('common:confirm.delete'),
                              onOk: () => {
                                const newData = _.filter(data, (item) => item.ident !== reocrd.ident);
                                putNotifyContacts(newData).then(() => {
                                  setData(newData);
                                  message.success(t('common:success.delete'));
                                });
                              },

                              onCancel() {},
                            });
                          }}
                        >
                          {t('common:btn.delete')}
                        </Button>
                      )}
                    </Space>
                  );
                },
              },
            ]}
          ></Table>
        </div>
      </div>
    </Drawer>
  );
}
