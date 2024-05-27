import React, { useState, useRef, useContext, useEffect } from 'react';
import _ from 'lodash';
import { Table, Space, Button, Input, Select, Dropdown, Menu, Modal, Tag } from 'antd';
import { SearchOutlined, MoreOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useDebounceEffect } from 'ahooks';
import usePagination from '@/components/usePagination';
import Export from '@/pages/dashboard/List/Export';
import AuthorizationWrapper from '@/components/AuthorizationWrapper';
import { CommonStateContext } from '@/App';
import { RuleType } from './types';
import Import from './Import';
import { getPayloads, deletePayloads, getCates } from '../services';
import { pathname } from '../constants';
import { TypeEnum } from '../types';
import { formatBeautifyJson, formatBeautifyJsons } from '../utils';
import PayloadFormModal from '../components/PayloadFormModal';

interface Props {
  component: string;
}

export default function index(props: Props) {
  const { component } = props;
  const { t } = useTranslation('builtInComponents');
  const { busiGroups, groupedDatasourceList, datasourceCateOptions, darkMode } = useContext(CommonStateContext);
  const [filter, setFilter] = useState<{
    cate?: string;
    query?: string;
  }>({ cate: undefined, query: undefined });
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<RuleType[]>();
  const [cateList, setCateList] = useState<string[]>([]);
  const pagination = usePagination({ PAGESIZE_KEY: 'dashboard-builtin-pagesize' });
  const selectedRows = useRef<RuleType[]>([]);
  const fetchData = () => {
    setLoading(true);
    getPayloads<RuleType[]>({ component, type: TypeEnum.alert, cate: filter.cate, query: filter.query })
      .then((res) => {
        setData(res);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const fetchCates = () => {
    getCates({
      component,
      type: TypeEnum.alert,
    }).then((res) => {
      setCateList(res);
      setFilter({
        ...filter,
        cate: filter.cate || _.head(res),
      });
    });
  };

  useDebounceEffect(
    () => {
      fetchData();
    },
    [component, filter.cate, filter.query],
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
          <Select
            style={{ width: 200 }}
            value={filter.cate}
            loading={loading}
            placeholder={t('builtInComponents:cate')}
            showSearch
            optionFilterProp='children'
            onChange={(val) => {
              setFilter({ ...filter, cate: val });
            }}
          >
            {_.map(cateList, (item) => {
              return (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              );
            })}
          </Select>
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
          <AuthorizationWrapper allowedPerms={['/built-in-components/add']}>
            <Button
              type='primary'
              onClick={() => {
                PayloadFormModal({
                  darkMode,
                  action: 'create',
                  cateList,
                  contentMode: 'json',
                  showCate: true,
                  showTags: true,
                  initialValues: {
                    type: TypeEnum.alert,
                    component,
                    cate: filter.cate,
                  },
                  onOk: () => {
                    fetchData();
                    fetchCates();
                  },
                });
              }}
            >
              {t('common:btn.add')}
            </Button>
          </AuthorizationWrapper>
          <Button
            onClick={() => {
              Import({
                data: formatBeautifyJsons(_.map(selectedRows.current, 'content')),
                busiGroups,
                groupedDatasourceList,
                datasourceCateOptions,
              });
            }}
          >
            {t('common:btn.batch_import')}
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
          onChange: (selectedRowKeys: string[], rows: RuleType[]) => {
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
                    pathname: `${pathname}/alert/detail`,
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
                              groupedDatasourceList,
                              datasourceCateOptions,
                            });
                          }}
                        >
                          {t('common:btn.import')}
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
                      <AuthorizationWrapper allowedPerms={['/built-in-components/put']}>
                        <Menu.Item>
                          <a
                            onClick={() => {
                              PayloadFormModal({
                                darkMode,
                                action: 'edit',
                                cateList,
                                contentMode: 'json',
                                showCate: true,
                                showTags: true,
                                initialValues: record,
                                onOk: () => {
                                  fetchData();
                                  fetchCates();
                                },
                              });
                            }}
                          >
                            {t('common:btn.edit')}
                          </a>
                        </Menu.Item>
                      </AuthorizationWrapper>
                      <AuthorizationWrapper allowedPerms={['/built-in-components/del']}>
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
                                    fetchCates();
                                  });
                                },
                              });
                            }}
                          >
                            {t('common:btn.delete')}
                          </Button>
                        </Menu.Item>
                      </AuthorizationWrapper>
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
