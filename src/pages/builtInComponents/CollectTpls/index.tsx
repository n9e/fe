import React, { useState, useRef, useContext, useEffect } from 'react';
import _ from 'lodash';
import { Table, Space, Button, Input, Dropdown, Menu, Modal, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useDebounceEffect } from 'ahooks';
import { CommonStateContext } from '@/App';
import usePagination from '@/components/usePagination';
import AuthorizationWrapper from '@/components/AuthorizationWrapper';
import { HelpLink } from '@/components/pageLayout';
import { TableActionButton, TableActionTrigger } from '@/components/TableActionDropdown';
import { getPayloads, deletePayloads, getCates } from '../services';
import { TypeEnum, Payload } from '../types';
import PayloadFormModal from '../components/PayloadFormModal';
import GroupSelectModal from './GroupSelectModal';

interface Props {
  component: string;
  component_id: number;
}

export default function index(props: Props) {
  const { component, component_id } = props;
  const { t } = useTranslation('builtInComponents');
  const { darkMode, busiGroups } = useContext(CommonStateContext);
  const [filter, setFilter] = useState<{
    query?: string;
  }>({
    query: undefined,
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<Payload[]>();
  const [cateList, setCateList] = useState<string[]>([]);
  const pagination = usePagination({ PAGESIZE_KEY: 'dashboard-builtin-pagesize' });
  const selectedRows = useRef<Payload[]>([]);
  const fetchData = () => {
    setLoading(true);
    getPayloads<Payload[]>({
      component_id,
      type: TypeEnum.collect,
      query: filter.query,
    })
      .then((res) => {
        setData(res);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const fetchCates = () => {
    getCates({
      component_id,
      type: TypeEnum.collect,
    }).then((res) => {
      setCateList(res);
    });
  };

  useDebounceEffect(
    () => {
      fetchData();
    },
    [component_id, filter.query],
    {
      wait: 500,
    },
  );

  useEffect(() => {
    fetchCates();
  }, []);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Input
            prefix={<SearchOutlined />}
            value={filter.query}
            onChange={(e) => {
              setFilter({ ...filter, query: e.target.value });
            }}
            placeholder={t('common:search_placeholder')}
            style={{ width: 300 }}
            allowClear
          />
        </Space>
        <Space>
          <HelpLink src='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/infrastructure/collection/' />
          <AuthorizationWrapper allowedPerms={['/components/add']}>
            <Button
              type='primary'
              onClick={() => {
                PayloadFormModal({
                  darkMode,
                  action: 'create',
                  showName: true,
                  showCate: true,
                  cateList,
                  cateI18nKey: 'collects:cate',
                  contentMode: 'yaml',
                  initialValues: {
                    type: TypeEnum.collect,
                    component_id,
                  },
                  onOk: () => {
                    fetchData();
                    fetchCates();
                  },
                });
              }}
            >
              {t('common:btn.create')}
            </Button>
          </AuthorizationWrapper>
        </Space>
      </div>
      <Table
        className='mt-2'
        size='small'
        rowKey='id'
        loading={loading}
        dataSource={data}
        rowSelection={{
          selectedRowKeys,
          onChange: (selectedRowKeys: string[], rows: Payload[]) => {
            setSelectedRowKeys(selectedRowKeys);
            selectedRows.current = rows;
          },
        }}
        columns={[
          {
            title: t('collects:cate'),
            dataIndex: 'cate',
            key: 'cate',
          },
          {
            title: t('payload_name'),
            dataIndex: 'name',
            key: 'name',
          },
          {
            title: t('common:table.update_by'),
            dataIndex: 'updated_by',
            key: 'updated_by',
            render: (value) => {
              if (!value) return '-';
              if (value === 'system') {
                return <Tag>{t('payload_by_system')}</Tag>;
              }
              return value;
            },
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
                          actionIcon='open'
                          onClick={() => {
                            GroupSelectModal({
                              busiGroups,
                              onOk: (group_id) => {
                                window.open(`/collects/add/${group_id}?component_id=${component_id}&cate=${record.cate}&payloadID=${record.id}`, '_blank');
                              },
                            });
                          }}
                        >
                          {t('collect_create')}
                        </TableActionButton>
                      </Menu.Item>
                      <AuthorizationWrapper allowedPerms={['/components/put']}>
                        <Menu.Item>
                          <TableActionButton
                            actionIcon='edit'
                            onClick={() => {
                              PayloadFormModal({
                                darkMode,
                                action: 'edit',
                                showName: true,
                                showCate: true,
                                cateList,
                                cateI18nKey: 'collects:cate',
                                contentMode: 'yaml',
                                initialValues: record,
                                onOk: () => {
                                  fetchData();
                                  fetchCates();
                                },
                              });
                            }}
                          >
                            {t('common:btn.edit')}
                          </TableActionButton>
                        </Menu.Item>
                      </AuthorizationWrapper>
                      {record.updated_by !== 'system' && (
                        <AuthorizationWrapper allowedPerms={['/components/del']}>
                          <>
                            <Menu.Divider />
                            <Menu.Item>
                              <TableActionButton
                                danger
                                actionIcon='delete'
                                onClick={() => {
                                  Modal.confirm({
                                    title: t('common:confirm.delete'),
                                    onOk() {
                                      deletePayloads([record.id]).then(() => {
                                        fetchData();
                                        fetchCates();
                                      });
                                    },
                                  });
                                }}
                              >
                                {t('common:btn.delete')}
                              </TableActionButton>
                            </Menu.Item>
                          </>
                        </AuthorizationWrapper>
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
        pagination={pagination}
      />
    </>
  );
}
