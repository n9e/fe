import React, { useContext, useEffect, useState, useRef } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import type { InputRef } from 'antd';
import { message, Table, Modal, Button, Space, Popconfirm, Input, Tooltip } from 'antd';
import { ColumnProps } from 'antd/es/table';
import { SearchOutlined, CheckCircleFilled } from '@ant-design/icons';
import { CommonStateContext } from '@/App';
import usePagination from '@/components/usePagination';
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
  const { nameClick, pluginList } = props;
  const [auth, setAuth] = useState<{ visible: boolean; name: string; type: AutoDatasourcetypeValue; dataSourceId: number }>();
  const { setDatasourceList } = useContext(CommonStateContext);
  const [tableData, setTableData] = useState<any>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const pagination = usePagination({ PAGESIZE_KEY: 'datasource' });
  const [searchVal, setSearchVal] = useState<string>('');
  const searchInput = useRef<InputRef>(null);

  useEffect(() => {
    init();
  }, [refresh]);

  const init = () => {
    setLoading(true);
    getDataSourceList()
      .then((res) => {
        setTableData(res);
        setDatasourceList(res);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input.Search
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onSearch={(val) => {
            setSearchVal(val);
          }}
        />
      </div>
    ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
  });

  const defaultColumns: ColumnProps<any>[] = [
    {
      title: t('name'),
      dataIndex: 'name',
      ...getColumnSearchProps('name'),
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
                <Tooltip placement='top' title={t('该数据源类型下的默认集群')}>
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
    defaultColumns.splice(2, 0, {
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
        className='datasource-list'
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
