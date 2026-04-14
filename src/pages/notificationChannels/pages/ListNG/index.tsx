import React, { useMemo, useState } from 'react';
import { Input, Select, Space, Table, Button, Modal, Switch, message, Tooltip } from 'antd';
import { NotificationOutlined, PlusOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { map, upperCase, includes, filter } from 'lodash';
import { Link } from 'react-router-dom';
import { useRequest } from 'ahooks';
import moment from 'moment';

import usePagination from '@/components/usePagination';
import PageLayout from '@/components/pageLayout';
import { Import, Export } from '@/components/ExportImport';

import { NS, NOTIFICATION_CHANNEL_TYPES } from '../../constants';
import { getItems, putItem, deleteItems, postItems } from '../../services';
import { ChannelItem } from '../../types';

export default function index() {
  const { t } = useTranslation(NS);
  const pagination = usePagination({ PAGESIZE_KEY: 'notification-channels-pagesize' });

  const [typesSearch, setTypesSearch] = useState('');
  const filteredTypes = useMemo(() => {
    const types = {} as typeof NOTIFICATION_CHANNEL_TYPES;
    map(NOTIFICATION_CHANNEL_TYPES, (val, key) => {
      if (includes(upperCase(key), upperCase(typesSearch)) || includes(upperCase(t(`types.${key}`)), upperCase(typesSearch))) {
        types[key] = val;
      }
    });
    return types;
  }, [typesSearch]);

  const { data, loading, run, mutate } = useRequest(getItems);
  const [filters, setFilters] = useState<{
    search?: string;
    enable?: boolean;
    idents?: string[];
  }>();
  const [selectedRows, setSelectedRows] = useState<ChannelItem[]>([]);
  const filteredData = useMemo(() => {
    return filter(data, (item) => {
      if (filters?.search) {
        return includes(upperCase(item.name), upperCase(filters.search));
      }
      if (filters?.enable !== undefined) {
        return item.enable === filters.enable;
      }
      if (filters?.idents && filters.idents.length > 0) {
        return includes(filters.idents, item.ident);
      }
      return true;
    });
  }, [
    JSON.stringify(
      map(data, (item) => {
        return {
          id: item.id,
          enabel: item.enable,
        };
      }),
    ),
    JSON.stringify(filters),
  ]);

  return (
    <PageLayout title={<Space>{t('title')}</Space>} icon={<NotificationOutlined />} doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v8/usecase/media/'>
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
          <div className='ml-4 w-full flex-1 flex flex-col gap-4'>
            <div className='flex justify-between'>
              <Space>
                <Input
                  placeholder={t('name_search_placeholder')}
                  className='w-[200px]'
                  value={filters?.search}
                  onChange={(e) => {
                    setFilters({
                      ...filters,
                      search: e.target.value,
                    });
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
                    setFilters({
                      ...filters,
                      enable: val === 'enable' ? true : val === 'disable' ? false : undefined,
                    });
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
                  options={map(NOTIFICATION_CHANNEL_TYPES, (value, key) => {
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
                    setFilters({
                      ...filters,
                      idents: val,
                    });
                  }}
                />
              </Space>
              <Space>
                <Button
                  onClick={() => {
                    Import({
                      title: t('common:btn.import'),
                      onOk: (data) => {
                        try {
                          const newData = JSON.parse(data);
                          postItems(newData).then(() => {
                            run();
                            message.success(t('common:success.import'));
                          });
                        } catch (e) {
                          console.error(e);
                        }
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
              <Table
                size='small'
                loading={loading}
                rowKey='id'
                dataSource={filteredData}
                columns={[
                  {
                    title: t('common:table.name'),
                    dataIndex: 'name',
                    render: (val, record) => {
                      return (
                        <Link
                          to={{
                            pathname: `/${NS}/edit/${record.id}`,
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
                    render: (val) => {
                      const typeConfig = NOTIFICATION_CHANNEL_TYPES[val];
                      return (
                        <div className='flex items-center gap-2'>
                          {typeConfig ? <img height={16} src={typeConfig?.logo} alt={val} /> : null}
                          {typeConfig ? t(`types.${val}`) : val}
                        </div>
                      );
                    },
                  },
                  {
                    title: t('common:table.update_by'),
                    dataIndex: 'update_by',
                  },
                  {
                    title: t('common:table.update_at'),
                    dataIndex: 'update_at',
                    render: (val) => {
                      return moment.unix(val).format('YYYY-MM-DD HH:mm:ss');
                    },
                  },
                  {
                    title: t('common:table.enabled'),
                    width: 100,
                    dataIndex: 'enable',
                    render: (val, record) => (
                      <Switch
                        checked={val}
                        size='small'
                        onChange={(checked) => {
                          putItem({
                            ...record,
                            enable: checked,
                          }).then(() => {
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
                          });
                        }}
                      />
                    ),
                  },
                  {
                    title: t('common:table.operations'),
                    width: 100,
                    render: (record) => {
                      return (
                        <Space size={2}>
                          <Link
                            className='table-operator-area-normal'
                            to={{
                              pathname: `/${NS}/edit/${record.id}?mode=clone`,
                            }}
                            target='_blank'
                          >
                            <Button size='small' type='text' className='p-0' icon={<CopyOutlined />} />
                          </Link>
                          <Tooltip title={record.enable === true ? t('delete_disable_first') : undefined}>
                            <Button
                              size='small'
                              type='text'
                              className='p-0'
                              icon={<DeleteOutlined />}
                              disabled={record.enable === true}
                              onClick={() => {
                                Modal.confirm({
                                  title: t('common:confirm.delete'),
                                  onOk: () => {
                                    deleteItems([record.id]).then(() => {
                                      message.success(t('common:success.delete'));
                                      run();
                                    });
                                  },
                                });
                              }}
                            />
                          </Tooltip>
                        </Space>
                      );
                    },
                  },
                ]}
                rowSelection={{
                  selectedRowKeys: map(selectedRows, 'id'),
                  onChange: (_selectedRowKeys, selectedRows: ChannelItem[]) => {
                    setSelectedRows(selectedRows);
                  },
                }}
                pagination={pagination}
                scroll={{ y: 'calc(100% - 37px)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
