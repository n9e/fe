import React, { useContext, useEffect, useState } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { message, Modal, Button, Space, Switch, Tooltip } from 'antd';
import { ColumnProps } from 'antd/es/table';
import { CheckCircleFilled, MinusCircleFilled, WarningOutlined } from '@ant-design/icons';
import { CommonStateContext } from '@/App';
import usePagination from '@/components/usePagination';
import { getCateByValue } from '@/components/AdvancedWrap/utils';
import EnhancedTable, { getEnabledStatusColumn } from '@/components/EnhancedTable';
import { allCates } from '@/components/AdvancedWrap/utils';
import EmptyGuide from '@/components/EmptyGuide';
import localeCompare from '@/pages/dashboard/Renderer/utils/localeCompare';

import Rename from '../Rename';
import NextStepModal from '../NextStepModal';
import { deleteDataSourceById, getDataSourceList, updateDataSourceStatus, getServerClusters } from '../../services';
// @ts-ignore
import { autoDatasourcetype, AuthList, AutoDatasourcetypeValue } from 'plus:/components/DataSourceAuth/auth';
// @ts-ignore
import useIsPlus from 'plus:/components/useIsPlus';
// @ts-ignore
import LabelMappingCloudwatchButton from 'plus:/parcels/Datasource/LabelMapping/Cloudwatch';

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
  onAdd?: () => void;
}

export interface IKeyValue {
  [key: string]: string | boolean | undefined;
}

const TableSource = (props: IPropsType) => {
  const { t } = useTranslation('datasourceManage');
  const isPlus = useIsPlus();
  const history = useHistory();
  const { nameClick, pluginList, debouncedSearchValue, onAdd } = props;
  const [auth, setAuth] = useState<{ visible: boolean; name: string; type: AutoDatasourcetypeValue; dataSourceId: number }>();
  const { reloadDatasourceList } = useContext(CommonStateContext);
  const [tableData, setTableData] = useState<any>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const pagination = usePagination({ PAGESIZE_KEY: 'datasource' });
  const [searchVal, setSearchVal] = useState<string | undefined>(debouncedSearchValue);
  const [clusterList, setClusterList] = useState<string[]>([]);
  // 当前打开引导弹窗的行
  const [guideRecord, setGuideRecord] = useState<any>();

  useEffect(() => {
    setSearchVal(debouncedSearchValue);
  }, [debouncedSearchValue]);

  useEffect(() => {
    getServerClusters().then((res) => {
      setClusterList(res);
    });
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
        const finded = getCateByValue(val);
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
      title: t('form.cluster'),
      dataIndex: 'cluster_name',
      sorter: (a, b) => localeCompare(a.cluster_name, b.cluster_name),
      render: (text) => {
        if (text) {
          const invalidCluster = !_.find(clusterList, (item) => item === text) && text !== 'no_assigned_engine';
          return (
            <Tooltip title={invalidCluster ? t('form.cluster_not_found') : ''}>
              <Space>
                {text}
                {invalidCluster && <WarningOutlined style={{ color: '#f06' }} />}
              </Space>
            </Tooltip>
          );
        }
        return null;
      },
    },
    {
      ...getEnabledStatusColumn({
        title: t('status.title'),
        dataIndex: 'status',
        enabledText: t('status.enabled'),
        disabledText: t('status.disabled'),
        enabledValue: 'enabled',
        disabledValue: 'disabled',
      }),
      width: 120,
      render: (text, record) => (
        <Switch
          checked={text === 'enabled'}
          size='small'
          onChange={(checked) => {
            const doUpdate = () =>
              updateDataSourceStatus({
                id: record.id,
                status: checked ? 'enabled' : 'disabled',
              }).then(() => {
                message.success(checked ? t('success.enable') : t('success.disable'));
                setRefresh((oldVal) => !oldVal);
              });
            if (checked) {
              doUpdate();
              return;
            }
            // 停用会让引用它的告警规则停止评估，二次确认一下，避免误碰开关
            Modal.confirm({
              title: t('confirm.disable'),
              onOk: doUpdate,
            });
          }}
        />
      ),
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
      <EnhancedTable
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
        rowActions={(record) => {
          // SRE 高频动作前置：体检引导 / 编辑直达，不再只有删除
          return {
            inline: _.compact([
              {
                key: 'guide',
                icon: 'view',
                text: t('row_actions.guide'),
                // 不直接跳探索器：先在弹窗里给出体检结论，探索/建盘/建告警由用户挑
                onClick: () => {
                  setGuideRecord(record);
                },
              },
              {
                key: 'edit',
                icon: 'edit',
                text: t('common:btn.edit'),
                onClick: () => {
                  history.push(`/datasources/edit/${record.plugin_type}/${record.id}`);
                },
              },
              {
                key: 'delete',
                icon: 'delete',
                text: t('common:btn.delete'),
                danger: true,
                disabled: record.status === 'enabled',
                tooltip: record.status === 'enabled' ? t('common:delete_disable_first') : undefined,
                onClick: () => {
                  Modal.confirm({
                    title: t('common:confirm.delete'),
                    onOk() {
                      return deleteDataSourceById(record.id).then(() => {
                        message.success(t('common:success.delete'));
                        setRefresh((oldVal) => !oldVal);
                      });
                    },
                  });
                },
              },
              record.plugin_type === 'cloudwatch' ? { key: 'labelMapping', node: <LabelMappingCloudwatchButton ds_id={record.id} ds_cate='cloudwatch' /> } : undefined,
            ]) as any,
          };
        }}
        actionColumn={{ title: t('common:table.operations'), width: 64 }}
        locale={{
          emptyText: (
            <EmptyGuide
              title={t('empty_guide.title')}
              description={t('empty_guide.desc')}
              actions={
                onAdd ? (
                  <Button type='primary' onClick={onAdd}>
                    {t('common:btn.add')}
                  </Button>
                ) : undefined
              }
            />
          ),
        }}
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
      {guideRecord && (
        <NextStepModal
          datasourceId={guideRecord.id}
          pluginType={guideRecord.plugin_type}
          name={guideRecord.name}
          mode='inspect'
          disabled={guideRecord.status !== 'enabled'}
          onClose={() => {
            setGuideRecord(undefined);
          }}
          onEdit={() => {
            setGuideRecord(undefined);
            history.push(`/datasources/edit/${guideRecord.plugin_type}/${guideRecord.id}`);
          }}
        />
      )}
    </>
  );
};

export default TableSource;
