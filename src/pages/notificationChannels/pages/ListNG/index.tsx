import React, { useEffect, useMemo, useState } from 'react';
import { Input, Select, Space, Button, Modal, Switch, message } from 'antd';
import { NotificationOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { map, upperCase, includes, filter } from 'lodash';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useRequest } from 'ahooks';
import moment from 'moment';

import usePagination from '@/components/usePagination';
import PageLayout from '@/components/pageLayout';
import { Import, Export } from '@/components/ExportImport';
import EnhancedTable, { getEnabledStatusColumn } from '@/components/EnhancedTable';
import { dateColumn, updateByColumn } from '@/components/EnhancedTable/columns';

import { NS, getNotificationChannelTypes, FILTER_SESSION_STORAGE_KEY } from '../../constants';
import { getItems, getItem, putItem, deleteItems, postItems } from '../../services';
import { ChannelItem } from '../../types';
import { getPageFromSearch, setPageInSearch } from '@/utils/urlPage';

interface Filter {
  search?: string;
  enable?: boolean;
  idents?: string[];
}

export default function index() {
  const { t } = useTranslation(NS);
  const history = useHistory();
  const location = useLocation();
  const channelTypes = getNotificationChannelTypes();
  const pagination = usePagination({ PAGESIZE_KEY: 'notification-channels-pagesize' });

  const [typesSearch, setTypesSearch] = useState('');
  const filteredTypes = useMemo(() => {
    const types = {} as typeof channelTypes;
    map(channelTypes, (val, key) => {
      if (includes(upperCase(key), upperCase(typesSearch)) || includes(upperCase(t(`types.${key}`)), upperCase(typesSearch))) {
        types[key] = val;
      }
    });
    return types;
  }, [typesSearch]);

  const { data, loading, run, mutate } = useRequest(getItems);
  let defaultFilter = {} as Filter;
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(FILTER_SESSION_STORAGE_KEY) || '{}');
    defaultFilter = saved;
  } catch (e) {
    console.error(e);
  }
  const defaultPage = getPageFromSearch(location.search);
  const [filters, setFilters] = useState<Filter>(defaultFilter);
  const [current, setCurrent] = useState<number>(defaultPage);
  const handleFilterChange = (newFilter: Filter) => {
    setFilters(newFilter);
    setCurrent(1);
    window.sessionStorage.setItem(FILTER_SESSION_STORAGE_KEY, JSON.stringify(newFilter));
    history.replace({ pathname: location.pathname, search: setPageInSearch(location.search, 1) });
  };
  const [selectedRows, setSelectedRows] = useState<ChannelItem[]>([]);
  const [togglingId, setTogglingId] = useState<number>();
  // 三个筛选条件取交集。此前是 if/else 早返回，命中名称搜索后状态与类型筛选会被整段跳过，
  // 表现为「选了类型却没生效」
  const filteredData = useMemo(() => {
    return filter(data, (item) => {
      if (filters?.search && !includes(upperCase(item.name), upperCase(filters.search))) {
        return false;
      }
      if (filters?.enable !== undefined && item.enable !== filters.enable) {
        return false;
      }
      if (filters?.idents && filters.idents.length > 0 && !includes(filters.idents, item.ident)) {
        return false;
      }
      return true;
    });
  }, [data, filters]);

  return (
    <PageLayout
      title={<Space>{t('title')}</Space>}
      icon={<NotificationOutlined />}
      doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/notify-channel/'
    >
      <div className='n9e'>
        <div className='flex h-full overflow-hidden'>
          <div className='h-full shrink-0 overflow-hidden'>
            <div className='flex h-full w-[360px] flex-col overflow-hidden'>
              <div className='pr-[16px] mb-4 flex-0'>
                <Input
                  placeholder={t('types_search_placeholder')}
                  value={typesSearch}
                  onChange={(e) => {
                    setTypesSearch(e.target.value);
                  }}
                />
              </div>
              <div className='pr-[10px] h-full min-h-0 best-looking-scroll'>
                <div className='grid grid-cols-2 gap-3'>
                  {map(filteredTypes, (val, key) => {
                    return (
                      <Link to={`/notification-channels/add?ident=${key}`} key={key}>
                        <div className='relative overflow-hidden bg-fc-100 border border-antd rounded p-2 flex flex-col items-center justify-center transition group hover:border-primary'>
                          <div className='mb-2'>
                            <img src={val.logo} alt={key} height={40} />
                          </div>
                          <div className='text-center text-main'>{t(`types.${key}`)}</div>
                          <div className='absolute -bottom-10 -right-10 z-0 h-16 w-16 rounded-[32px] bg-fc-300 pl-2 pt-2 opacity-0 group-hover:opacity-100'>
                            <PlusOutlined className='text-l1' />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className='w-px bg-fc-300'></div>
          <div className='ml-4 w-full min-w-0 flex-1 flex flex-col gap-4'>
            <div className='flex justify-between'>
              <Space>
                <Input
                  placeholder={t('name_search_placeholder')}
                  className='w-[200px]'
                  value={filters?.search}
                  onChange={(e) => {
                    const newFilter = {
                      ...filters,
                      search: e.target.value,
                    };
                    handleFilterChange(newFilter);
                  }}
                />
                <Select
                  className='w-[100px]'
                  placeholder={t('status_select.placeholder')}
                  allowClear
                  dropdownMatchSelectWidth={false}
                  options={[
                    {
                      label: t('status_select.enable'),
                      value: 'enable',
                    },
                    {
                      label: t('status_select.disable'),
                      value: 'disable',
                    },
                  ]}
                  value={filters?.enable === true ? 'enable' : filters?.enable === false ? 'disable' : undefined}
                  onChange={(val) => {
                    const newFilter = {
                      ...filters,
                      enable: val === 'enable' ? true : val === 'disable' ? false : undefined,
                    };
                    handleFilterChange(newFilter);
                  }}
                />
                <Select
                  className='min-w-[100px]'
                  placeholder={t('types_select_placeholder')}
                  mode='multiple'
                  allowClear
                  dropdownMatchSelectWidth={false}
                  showSearch
                  optionFilterProp='labelSearch'
                  options={map(channelTypes, (value, key) => {
                    return {
                      label: (
                        <div className='flex items-center gap-2'>
                          <img src={value.logo} alt={key} height={12} /> {t(`types.${key}`)}
                        </div>
                      ),
                      value: key,
                      labelSearch: `${t(`types.${key}`)} ${key}`,
                    };
                  })}
                  value={filters?.idents}
                  onChange={(val) => {
                    const newFilter = {
                      ...filters,
                      idents: val,
                    };
                    handleFilterChange(newFilter);
                  }}
                />
              </Space>
              <Space>
                <Button
                  onClick={() => {
                    Import({
                      title: t('common:btn.import'),
                      onOk: (data) => {
                        let newData: ChannelItem[];
                        try {
                          newData = JSON.parse(data);
                        } catch (e) {
                          // JSON 解析失败是纯前端错误，不经过全局 errorHandler，需自行提示
                          console.error(e);
                          message.error(t('common:error.import'));
                          return;
                        }
                        postItems(newData)
                          .then(() => {
                            run();
                            message.success(t('common:success.import'));
                          })
                          .catch(console.error);
                      },
                    });
                  }}
                >
                  {t('common:btn.import')}
                </Button>
                <Button
                  onClick={() => {
                    if (selectedRows.length) {
                      Export({
                        title: t('common:btn.export'),
                        data: JSON.stringify(selectedRows, null, 4),
                      });
                    } else {
                      message.warning(t('common:batch.not_select'));
                    }
                  }}
                >
                  {t('common:btn.export')}
                </Button>
              </Space>
            </div>
            <div className='n9e-antd-table-height-full'>
              <EnhancedTable
                size='small'
                loading={loading}
                rowKey='id'
                dataSource={filteredData}
                columns={[
                  {
                    title: t('common:table.name'),
                    dataIndex: 'name',
                    width: 240,
                    ellipsis: true,
                    render: (val, record) => {
                      return (
                        <Link
                          className='block truncate'
                          to={{
                            pathname: `/${NS}/edit/${record.id}`,
                            search: `?page=${current}`,
                          }}
                        >
                          {val}
                        </Link>
                      );
                    },
                  },
                  {
                    title: t('ident'),
                    dataIndex: 'ident',
                    width: 180,
                    ellipsis: true,
                    render: (val) => {
                      const typeConfig = channelTypes[val];
                      return (
                        <div className='flex min-w-0 items-center gap-2'>
                          {typeConfig ? <img height={16} src={typeConfig?.logo} alt={val} /> : null}
                          <span className='truncate'>{typeConfig ? t(`types.${val}`) : val}</span>
                        </div>
                      );
                    },
                  },
                  dateColumn({ title: t('common:table.update_at'), dataIndex: 'update_at', unix: true, sortable: true, defaultSortOrder: 'descend' }) as any,
                  updateByColumn({ title: t('common:table.update_by'), dataIndex: 'update_by', nickname: 'update_by_nickname' }) as any,
                  {
                    ...getEnabledStatusColumn({
                      title: t('common:table.enabled'),
                      dataIndex: 'enable',
                      enabledText: t('common:table.enabled'),
                      disabledText: t('disabled'),
                      enabledValue: true,
                      disabledValue: false,
                    }),
                    width: 96,
                    render: (val, record) => (
                      <Switch
                        checked={val}
                        size='small'
                        loading={togglingId === record.id}
                        onChange={(checked) => {
                          // 整条 PUT 用列表加载时的快照会静默覆盖他人的并发编辑，
                          // 先取一次最新记录再回写，把窗口缩到最小（根治要靠后端窄接口）
                          setTogglingId(record.id);
                          getItem(record.id)
                            .then((latest) => putItem({ ...latest, enable: checked }))
                            .then(() => {
                              const newData = map(data, (item) => {
                                if (item.id === record.id) {
                                  return {
                                    ...item,
                                    enable: checked,
                                  };
                                }
                                return item;
                              });
                              mutate(newData);
                            })
                            // 请求失败的提示由 request.tsx 的全局 errorHandler 统一弹出，
                            // 这里只记录并复位，不重复 toast
                            .catch(console.error)
                            .finally(() => {
                              setTogglingId(undefined);
                            });
                        }}
                      />
                    ),
                  },
                ]}
                rowActions={(record) => ({
                  inline: [
                    {
                      key: 'clone',
                      icon: 'copy',
                      text: t('common:btn.clone'),
                      onClick: () => {
                        window.open(`/${NS}/edit/${record.id}?mode=clone`, '_blank');
                      },
                    },
                    {
                      key: 'delete',
                      danger: true,
                      disabled: record.enable === true,
                      tooltip: record.enable === true ? t('common:delete_disable_first') : undefined,
                      icon: 'delete',
                      text: t('common:btn.delete'),
                      onClick: () => {
                        Modal.confirm({
                          title: t('common:confirm.delete'),
                          onOk: () => {
                            deleteItems([record.id]).then(() => {
                              message.success(t('common:success.delete'));
                              run();
                            });
                          },
                        });
                      },
                    },
                  ],
                })}
                actionColumn={{ title: t('common:table.operations'), width: 64 }}
                rowSelection={{
                  selectedRowKeys: map(selectedRows, 'id'),
                  onChange: (_selectedRowKeys, selectedRows: ChannelItem[]) => {
                    setSelectedRows(selectedRows);
                  },
                }}
                pagination={{ ...pagination, current }}
                onChange={(pag) => {
                  setCurrent(pag.current || 1);
                  history.replace({ pathname: location.pathname, search: setPageInSearch(location.search, pag.current || 1) });
                }}
                scroll={{ y: 'calc(100% - 42px)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
