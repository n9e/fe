import React, { useContext, useEffect, useState } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { message, Table, Modal, Button, Space, Popconfirm } from 'antd';
import { CommonStateContext } from '@/App';
import Rename from '../Rename';
import { deleteDataSourceById, getDataSourceList, updateDataSourceStatus } from '../../services';

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
  const { nameClick, pluginList } = props;
  const { setDatasourceList } = useContext(CommonStateContext);
  const [tableData, setTableData] = useState<any>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

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

  const defaultColumns = [
    {
      title: t('name'),
      dataIndex: 'name',
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
            </a>
          </Rename>
        );
      },
    },
    {
      title: t('type'),
      width: 300,
      dataIndex: 'plugin_type',
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

  return <Table size='small' className='datasource-list' rowKey='id' dataSource={tableData} columns={defaultColumns} loading={loading} />;
};

export default TableSource;
