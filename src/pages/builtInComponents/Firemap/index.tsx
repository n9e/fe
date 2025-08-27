import React, { useContext, useRef, useState } from 'react';
import { MoreOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Dropdown, Input, Menu, message, Modal, Space, Table, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import AuthorizationWrapper from '@/components/AuthorizationWrapper';
import PayloadFormModal from './PayloadFormModal';
import { Payload, TypeEnum } from '../types';
import { CommonStateContext } from '@/App';
import { deletePayloads, getPayloads } from '../services';
import { useDebounceEffect } from 'ahooks';
import usePagination from '@/components/usePagination';
import Export from '@/pages/dashboard/List/Export';
import { formatBeautifyJson, formatBeautifyJsons } from '../utils';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { pathname } from '../constants';

export default function Firemap(props) {
  const { t } = useTranslation('builtInComponents');

  const { component_id } = props;

  const { busiGroups, darkMode } = useContext(CommonStateContext);

  const pagination = usePagination({ PAGESIZE_KEY: 'dashboard-builtin-pagesize' });

  const selectedRows = useRef<Payload[]>([]);

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [filter, setFilter] = useState<{
    query?: string;
  }>({ query: undefined });
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<Payload[]>();

  const fetchData = () => {
    setLoading(true);
    getPayloads<Payload[]>({ component_id, type: TypeEnum.firemap })
      .then((res) => {
        setData(res);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useDebounceEffect(
    () => {
      fetchData();
    },
    [component_id],
    {
      wait: 500,
    },
  );

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
          <AuthorizationWrapper allowedPerms={['/components/add']}>
            <Button
              type='primary'
              onClick={() => {
                PayloadFormModal({
                  darkMode,
                  action: 'create',
                  cateList: [],
                  contentMode: 'json',
                  initialValues: {
                    type: TypeEnum.firemap,
                    component_id,
                  },
                  onOk: () => {
                    fetchData();
                  },
                });
              }}
            >
              {t('common:btn.create')}
            </Button>
          </AuthorizationWrapper>

          <Button
            onClick={() => {
              if (_.isEmpty(selectedRows.current)) {
                message.warning(t('formModal.no_select.dashboard'));
                return;
              }
              Export({
                data: formatBeautifyJsons(_.map(selectedRows.current, 'content')),
              });
            }}
          >
            {t('common:btn.batch_export')}
          </Button>
        </Space>
      </div>
      <Table
        className='mt8'
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
            title: t('common:table.name'),
            dataIndex: 'name',
            key: 'name',
            render: (value, record) => {
              return (
                <Link
                  to={{
                    pathname: `${pathname}/dashboard/detail`,
                    search: `?__uuid__=${record.uuid}`,
                  }}
                  target='_blank'
                >
                  {value}
                </Link>
              );
            },
          },
          {
            title: t('tags'),
            dataIndex: 'tags',
            render: (val) => {
              const tags = _.compact(_.split(val, ' '));
              return (
                <Space size={0}>
                  {_.map(tags, (tag, idx) => {
                    return (
                      <Tag
                        key={idx}
                        color='purple'
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          const queryItem = _.compact(_.split(filter.query, ' '));
                          if (_.includes(queryItem, tag)) return;
                          setFilter((filter) => {
                            return {
                              ...filter,
                              query: filter.query ? filter.query + ' ' + tag : tag,
                            };
                          });
                        }}
                      >
                        {tag}
                      </Tag>
                    );
                  })}
                </Space>
              );
            },
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
            width: 100,
            render: (record) => {
              return (
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item>
                        <a
                          onClick={() => {
                            Export({
                              data: formatBeautifyJson(record.content, 'array'),
                            });
                          }}
                        >
                          {t('common:btn.export')}
                        </a>
                      </Menu.Item>
                      {record.updated_by !== 'system' && (
                        <AuthorizationWrapper allowedPerms={['/components/put']}>
                          <Menu.Item>
                            <a
                              onClick={() => {
                                PayloadFormModal({
                                  darkMode,
                                  action: 'edit',
                                  cateList: [],
                                  contentMode: 'json',
                                  initialValues: record,
                                  onOk: () => {
                                    fetchData();
                                  },
                                });
                              }}
                            >
                              {t('common:btn.edit')}
                            </a>
                          </Menu.Item>
                        </AuthorizationWrapper>
                      )}
                      {record.updated_by !== 'system' && (
                        <AuthorizationWrapper allowedPerms={['/components/del']}>
                          <Menu.Item>
                            <Button
                              type='link'
                              danger
                              className='p0 height-auto'
                              onClick={() => {
                                Modal.confirm({
                                  title: t('common:confirm.delete'),
                                  onOk() {
                                    deletePayloads([record.id]).then(() => {
                                      fetchData();
                                    });
                                  },
                                });
                              }}
                            >
                              {t('common:btn.delete')}
                            </Button>
                          </Menu.Item>
                        </AuthorizationWrapper>
                      )}
                    </Menu>
                  }
                >
                  <Button type='link' icon={<MoreOutlined />} />
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
