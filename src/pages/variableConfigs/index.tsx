/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Button, Input, Table, Space, message, Modal, Dropdown, Menu } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import DocumentDrawer from '@/components/DocumentDrawer';
import { getVariableConfigs, VariableConfig, postVariableConfigs, deleteVariableConfigs, putVariableConfigs, getRSAConfig, RASConfig } from './services';
import FormModal from './FormModal';
import { TableActionButton, TableActionTrigger } from '@/components/TableActionDropdown';
import './locale';

export default function index() {
  const { t, i18n } = useTranslation('variableConfigs');
  const [search, setSearch] = useState('');
  const [data, setData] = useState<VariableConfig[]>([]);
  const [rsaConfig, setRsaConfig] = useState<RASConfig>({} as RASConfig);

  const fetchData = () => {
    getVariableConfigs().then((res) => {
      setData(res);
    });
  };

  useEffect(() => {
    fetchData();
    getRSAConfig().then((res) => {
      setRsaConfig(res);
    });
  }, []);

  return (
    <PageLayout
      title={<Space>{t('title')}</Space>}
      icon={<SettingOutlined />}
      doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/system-configuration/variable/'
    >
      <div className='n9e'>
        <div
          className='mb-2'
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Input
            placeholder={t('search_placeholder')}
            style={{ width: 300 }}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
          <Button
            type='primary'
            onClick={() => {
              FormModal({
                title: t('common:btn.create'),
                rsaConfig,
                onOk: (values) => {
                  return postVariableConfigs(values).then(() => {
                    fetchData();
                    message.success(t('common:success.create'));
                  });
                },
              });
            }}
          >
            {t('common:btn.create')}
          </Button>
        </div>
        <Table
          className='mt-2'
          rowKey='id'
          size='small'
          columns={[
            {
              dataIndex: 'ckey',
              title: t('ckey'),
            },
            {
              dataIndex: 'cval',
              title: t('cval'),
              ellipsis: true,
              render: (val, record) => {
                if (record.encrypted) {
                  return '******';
                }
                return val;
              },
            },
            {
              dataIndex: 'note',
              title: t('common:table.note'),
            },
            {
              title: t('common:table.operations'),
              width: 64,
              fixed: 'right' as const,
              render: (record) => {
                return (
                  <Dropdown
                    trigger={['click']}
                    align={{ points: ['tr', 'tl'], offset: [-2, 0] }}
                    overlayClassName='fc-table-action-dropdown'
                    overlay={
                      <Menu>
                        <Menu.Item>
                          <TableActionButton
                            actionIcon='copy'
                            onClick={() => {
                              FormModal({
                                title: t('common:btn.clone'),
                                rsaConfig,
                                data: record,
                                onOk: (values) => {
                                  return postVariableConfigs(values).then(() => {
                                    fetchData();
                                    message.success(t('common:success.clone'));
                                  });
                                },
                              });
                            }}
                          >
                            {t('common:btn.clone')}
                          </TableActionButton>
                        </Menu.Item>
                        <Menu.Item>
                          <TableActionButton
                            actionIcon='edit'
                            onClick={() => {
                              FormModal({
                                title: t('common:btn.edit'),
                                rsaConfig,
                                data: record,
                                onOk: (values) => {
                                  return putVariableConfigs(record.id, values).then(() => {
                                    fetchData();
                                    message.success(t('common:success.edit'));
                                  });
                                },
                              });
                            }}
                          >
                            {t('common:btn.edit')}
                          </TableActionButton>
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item>
                          <TableActionButton
                            actionIcon='delete'
                            danger
                            onClick={() => {
                              Modal.confirm({
                                title: t('common:confirm.delete'),
                                onOk: () => {
                                  deleteVariableConfigs(record.id).then(() => {
                                    message.success(t('common:success.delete'));
                                    fetchData();
                                  });
                                },
                              });
                            }}
                          >
                            {t('common:btn.delete')}
                          </TableActionButton>
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <TableActionTrigger />
                  </Dropdown>
                );
              },
            },
          ]}
          dataSource={_.filter(data, (item) => {
            if (search) {
              return _.includes(item.ckey, search) || _.includes(item.note, search);
            }
            return true;
          })}
        />
      </div>
    </PageLayout>
  );
}
