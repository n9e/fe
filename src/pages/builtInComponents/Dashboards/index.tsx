import React, { useState, useRef, useContext } from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { Table, Space, Button, Input, Dropdown, Menu, Modal, Tag } from 'antd';
import { SearchOutlined, MoreOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useDebounceEffect } from 'ahooks';
import { CommonStateContext } from '@/App';
import usePagination from '@/components/usePagination';
import Export from '@/pages/dashboard/List/Export';
import { getPayloads, deletePayloads } from '../services';
import { TypeEnum, Payload } from '../types';
import PayloadFormModal from '../components/PayloadFormModal';
import { pathname } from '../constants';
import Import from './Import';
import { formatBeautifyJson, formatBeautifyJsons } from '../utils';

interface Props {
  component: string;
}

export default function index(props: Props) {
  const { component } = props;
  const { t } = useTranslation('builtInComponents');
  const { busiGroups, darkMode } = useContext(CommonStateContext);
  const [filter, setFilter] = useState<{
    query?: string;
  }>({ query: undefined });
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<Payload[]>();
  const pagination = usePagination({ PAGESIZE_KEY: 'dashboard-builtin-pagesize' });
  const selectedRows = useRef<Payload[]>([]);
  const fetchData = () => {
    setLoading(true);
    getPayloads<Payload[]>({ component, type: TypeEnum.dashboard, query: filter.query })
      .then((res) => {
        setData(_.get(res, '', []));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useDebounceEffect(
    () => {
      fetchData();
    },
    [component, filter.query],
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
          <Button
            type='primary'
            onClick={() => {
              PayloadFormModal({
                darkMode,
                action: 'create',
                cateList: [],
                contentMode: 'json',
                initialValues: {
                  type: TypeEnum.dashboard,
                  component,
                },
                onOk: () => {
                  fetchData();
                },
              });
            }}
          >
            {t('common:btn.create')}
          </Button>
          <Button
            onClick={() => {
              Import({
                data: formatBeautifyJsons(_.map(selectedRows.current, 'content')),
                busiGroups,
              });
            }}
          >
            {t('common:btn.batch_clone')}
          </Button>
          <Button
            onClick={() => {
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
                    search: `?id=${record.id}`,
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
                            Import({
                              data: formatBeautifyJson(record.content),
                              busiGroups,
                            });
                          }}
                        >
                          {t('common:btn.clone')}
                        </a>
                      </Menu.Item>
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
