import React, { useState, useRef, useContext } from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { Space, Button, Input, Modal, Tag, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useDebounceEffect } from 'ahooks';
import { CommonStateContext } from '@/App';
import usePagination from '@/components/usePagination';
import Export from '@/pages/dashboard/List/Export';
import AuthorizationWrapper from '@/components/AuthorizationWrapper';
import { HelpLink } from '@/components/pageLayout';
import EnhancedTable from '@/components/EnhancedTable';
import { tagsColumn, updateByColumn } from '@/components/EnhancedTable/columns';
import EllipsisText from '@/components/EllipsisText';
import Tags from '@/components/TableTags/Tags';
import { getPayloads, deletePayloads } from '../services';
import { TypeEnum, Payload } from '../types';
import PayloadFormModal from '../components/PayloadFormModal';
import { pathname } from '../constants';
import Import from './Import';
import { formatBeautifyJson, formatBeautifyJsons } from '../utils';

interface Props {
  component_id: number;
}

export default function index(props: Props) {
  const { component_id } = props;
  const { t } = useTranslation('builtInComponents');
  const { busiGroups, darkMode, perms } = useContext(CommonStateContext);
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
    getPayloads<Payload[]>({ component_id, type: TypeEnum.dashboard, query: filter.query })
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
    [component_id, filter.query],
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
          <HelpLink src='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/integrations/templates/dashboard-template/' />
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
                    type: TypeEnum.dashboard,
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
              Import({
                data: formatBeautifyJsons(_.map(selectedRows.current, 'content')),
                busiGroups,
              });
            }}
          >
            {t('import_to_buisGroup')}
          </Button>
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
      <EnhancedTable
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
        rowActions={(record: any) => {
          return {
            inline: [
              {
                key: 'import',
                icon: 'import',
                text: t('import_to_buisGroup'),
                onClick: () => {
                  Import({
                    data: formatBeautifyJson(record.content),
                    busiGroups,
                  });
                },
              },
              {
                key: 'export',
                icon: 'open',
                text: t('common:btn.export'),
                onClick: () => {
                  Export({
                    data: formatBeautifyJson(record.content, 'array'),
                  });
                },
              },
            ],
            menu: _.compact([
              record.updated_by !== 'system' && _.includes(perms, '/components/put')
                ? {
                    key: 'edit',
                    icon: 'edit',
                    text: t('common:btn.edit'),
                    onClick: () => {
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
                    },
                  }
                : undefined,
              record.updated_by !== 'system' && _.includes(perms, '/components/del')
                ? {
                    key: 'delete',
                    icon: 'delete',
                    text: t('common:btn.delete'),
                    danger: true,
                    onClick: () => {
                      Modal.confirm({
                        title: t('common:confirm.delete'),
                        onOk() {
                          deletePayloads([record.id]).then(() => {
                            fetchData();
                          });
                        },
                      });
                    },
                  }
                : undefined,
            ]),
          };
        }}
        actionColumn={{ title: t('common:table.operations'), width: 90 }}
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
          tagsColumn({
            title: t('tags'),
            dataIndex: 'tags',
            maxWidth: 180,
            render: (val: string) => {
              const tags = _.compact(_.split(val, ' '));
              return (
                <Tags
                  data={tags}
                  maxWidth={180}
                  onTagClick={(tag: string) => {
                    const queryItem = _.compact(_.split(filter.query, ' '));
                    if (_.includes(queryItem, tag)) return;
                    setFilter((filter) => ({
                      ...filter,
                      query: filter.query ? filter.query + ' ' + tag : tag,
                    }));
                  }}
                />
              );
            },
          }),
          {
            title: t('common:table.note'),
            dataIndex: 'note',
            key: 'note',
            ellipsis: { showTitle: false },
            render: (val) => <EllipsisText text={val} />,
          },
          updateByColumn({
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
          }),
        ]}
        pagination={pagination}
      />
    </>
  );
}
