import React, { useContext, useEffect, useState, useRef } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { message, Table, Modal, Button, Space, Popconfirm, Input, Tooltip } from 'antd';
import { ColumnProps } from 'antd/es/table';
import { CheckCircleFilled, MinusCircleFilled } from '@ant-design/icons';
import { CommonStateContext } from '@/App';
import usePagination from '@/components/usePagination';
import { allCates } from '@/components/AdvancedWrap/utils';
import localeCompare from '@/pages/dashboard/Renderer/utils/localeCompare';
import Rename from '../Rename';
import { deleteDataSourceById, getDataSourceList, updateDataSourceStatus } from '../../services';
// @ts-ignore
import { autoDatasourcetype, AuthList, AutoDatasourcetypeValue } from 'plus:/components/DataSourceAuth/auth';
// @ts-ignore
import useIsPlus from 'plus:/components/useIsPlus';
export interface IDefaultES {
  default_id: number;
  system_id: number;
}

export interface IPropsType {
  debouncedSearchValue?: string;
  pluginList?: {
    name: string;
    type: string;
    logo?: any;
  }[];
  nameClick: (val) => void;
}

export interface IKeyValue {
  [key: string]: string | boolean | undefined;
}

const TableSource = (props: IPropsType) => {
  const { t } = useTranslation('datasourceManage');
  const isPlus = useIsPlus();
  const { nameClick, pluginList, debouncedSearchValue } = props;
  const [auth, setAuth] = useState<{ visible: boolean; name: string; type: AutoDatasourcetypeValue; dataSourceId: number }>();
  const { reloadDatasourceList } = useContext(CommonStateContext);
  const [tableData, setTableData] = useState<any>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const pagination = usePagination({ PAGESIZE_KEY: 'datasource' });
  const [searchVal, setSearchVal] = useState<string | undefined>(debouncedSearchValue);

  useEffect(() => {
    setSearchVal(debouncedSearchValue);
  }, [debouncedSearchValue]);

  useEffect(() => {
    init();
  }, [refresh]);

  const init = () => {
    setLoading(true);
    getDataSourceList()
      .then((res) => {
        setTableData(res);
        reloadDatasourceList();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const defaultColumns: ColumnProps<any>[] = [
    {
      title: t('type'),
      width: 300,
      dataIndex: 'plugin_type',
      filters: pluginList?.map((el) => {
        let temp = {
          text: <span style={{ marginLeft: 8 }}>{el.name}</span>,
          value: el.type,
        };
        return temp;
      }),
      onFilter: (value: string, record) => {
        return record.plugin_type === value;
      },
      sorter: (a, b) => localeCompare(a.plugin_type, b.plugin_type),
      defaultSortOrder: 'ascend',
      render: (val) => {
        const finded = _.find(allCates, { value: val });
        return (
          <Space>
            <img alt={val} src={finded?.logo} height={20} />
            <span>{finded?.label}</span>
          </Space>
        );
      },
    },
    {
      title: t('name'),
      dataIndex: 'name',
      sorter: (a, b) => localeCompare(a.name, b.name),
      render: (text, record) => {
        return (
          <Rename
            values={record}
            text={text}
            callback={() => {
              setRefresh((oldVal) => !oldVal);
            }}
          >
            <a
              onClick={() => {
                nameClick(record);
              }}
            >
              {text}
              {record?.is_default && (
                <Tooltip placement='top' title={t('default_msg')}>
                  <CheckCircleFilled
                    style={{
                      visibility: 'visible',
                      marginLeft: 5,
                      marginRight: 5,
                    }}
                  />
                </Tooltip>
              )}
            </a>
          </Rename>
        );
      },
    },
    {
      title: t('status.title'),
      width: 300,
      dataIndex: 'status',
      sorter: (a, b) => localeCompare(a.status, b.status),
      filters: [
        {
          text: t('status.enabled'),
          value: 'enabled',
        },
        {
          text: t('status.disabled'),
          value: 'disabled',
        },
      ],
      onFilter: (value: string, record) => record.status === value,
      render: (text) => {
        return text === 'enabled' ? (
          <>
            <CheckCircleFilled style={{ color: '#00A700', fontSize: '16px', marginRight: '4px', verticalAlign: 'middle' }} />
            <span className='theme-color' style={{ verticalAlign: 'middle' }}>
              {t('status.enabled')}
            </span>
          </>
        ) : (
          <>
            <MinusCircleFilled style={{ color: '#FAC800', fontSize: '16px', marginRight: '4px', verticalAlign: 'middle' }} />
            <span className='second-color' style={{ verticalAlign: 'middle' }}>
              {t('status.disabled')}
            </span>
          </>
        );
      },
    },

    {
      title: t('common:table.operations'),
      width: 100,
      render: (record) => {
        return (
          <Space>
            <Popconfirm
              placement='topLeft'
              title={record.status === 'enabled' ? t('confirm.disable') : t('confirm.enable')}
              onConfirm={() => {
                updateDataSourceStatus({
                  id: record.id,
                  status: record.status === 'enabled' ? 'disabled' : 'enabled',
                }).then(() => {
                  message.success(record.status === 'enabled' ? t('success.disable') : t('success.enable'));
                  setRefresh((oldVal) => !oldVal);
                });
              }}
            >
              <a>{record.status === 'enabled' ? t('disable') : t('enable')}</a>
            </Popconfirm>

            {record.status === 'disabled' && (
              <Button
                type='link'
                size='small'
                danger
                onClick={() => {
                  Modal.confirm({
                    title: t('common:confirm.delete'),
                    onOk() {
                      deleteDataSourceById(record.id).then(() => {
                        message.success(t('common:success.delete'));
                        setRefresh((oldVal) => !oldVal);
                      });
                    },
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
  ];
  if (isPlus) {
    defaultColumns.splice(3, 0, {
      title: t('auth.name'),
      dataIndex: 'auth',
      width: 150,
      render: (text, record) => {
        return autoDatasourcetype.includes(record.plugin_type) ? (
          <Button
            type='link'
            size='small'
            onClick={() => {
              setAuth({ visible: true, name: record.name, type: record.plugin_type, dataSourceId: record.id });
            }}
          >
            {t('common:btn.edit')}
          </Button>
        ) : (
          t('auth.not-support')
        );
      },
    });
  }

  return (
    <>
      <Table
        size='small'
        className='settings-data-source-list'
        rowKey='id'
        dataSource={_.filter(tableData, (item) => {
          if (searchVal) {
            return _.includes(item.name, searchVal);
          }
          return item;
        })}
        columns={defaultColumns}
        loading={loading}
        pagination={pagination}
      />
      {auth && (
        <AuthList
          visible={auth.visible}
          onClose={() => {
            setAuth(undefined);
          }}
          name={auth.name}
          type={auth.type}
          dataSourceId={auth.dataSourceId}
        />
      )}
    </>
  );
};

export default TableSource;
