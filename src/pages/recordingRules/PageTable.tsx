import React, { useEffect, useState, useMemo, useContext } from 'react';
import { Button, Modal, message, Dropdown, Table, Switch, Select, Space, Tag } from 'antd';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ColumnType } from 'antd/lib/table';
import moment from 'moment';
import _ from 'lodash';
import RefreshIcon from '@/components/RefreshIcon';
import { DownOutlined } from '@ant-design/icons';
import { getRecordingRuleSubList, updateRecordingRules } from '@/services/recording';
import SearchInput from '@/components/BaseSearchInput';
import { strategyItem, strategyStatus } from '@/store/warningInterface';
import { deleteRecordingRule } from '@/services/recording';
import EditModal from './components/editModal';
import { CommonStateContext } from '@/App';
import Import from './components/Import';
import Export from './components/Export';

interface Props {
  bgid?: number;
}

const { confirm } = Modal;
const pageSizeOptionsDefault = ['30', '50', '100', '300'];
const exportIgnoreAttrsObj = {
  id: undefined,
  group_id: undefined,
  datasource_ids: undefined,
  create_at: undefined,
  create_by: undefined,
  update_at: undefined,
  update_by: undefined,
};

const PageTable: React.FC<Props> = ({ bgid }) => {
  const [severity] = useState<number>();
  const { t } = useTranslation('recordingRules');
  const history = useHistory();
  const [selectRowKeys, setSelectRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<strategyItem[]>([]);
  const { curBusiId, groupedDatasourceList } = useContext(CommonStateContext);
  const [query, setQuery] = useState<string>('');
  const [isModalVisible, setisModalVisible] = useState<boolean>(false);
  const [currentStrategyDataAll, setCurrentStrategyDataAll] = useState([]);
  const [currentStrategyData, setCurrentStrategyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [datasourceIds, setDatasourceIds] = useState<number[]>();

  useEffect(() => {
    getRecordingRules();
  }, [bgid, severity]);

  useEffect(() => {
    filterData();
  }, [query, datasourceIds, currentStrategyDataAll]);

  const getRecordingRules = async () => {
    if (!bgid) {
      return;
    }
    setLoading(true);
    const { success, dat } = await getRecordingRuleSubList(curBusiId);
    if (success) {
      setCurrentStrategyDataAll(dat.filter((item) => !severity || item.severity === severity) || []);
      setLoading(false);
    }
  };

  const filterData = () => {
    const data = JSON.parse(JSON.stringify(currentStrategyDataAll));
    const res = data.filter((item) => {
      const lowerCaseQuery = query.toLowerCase();
      return (
        (item.name.toLowerCase().indexOf(lowerCaseQuery) > -1 || item.append_tags.join(' ').toLowerCase().indexOf(lowerCaseQuery) > -1) &&
        (_.some(item.datasource_ids, (id) => {
          if (id === 0) return true;
          return _.includes(datasourceIds, id);
        }) ||
          datasourceIds?.length === 0 ||
          !datasourceIds)
      );
    });
    setCurrentStrategyData(res || []);
  };
  const goToAddWarningStrategy = () => {
    history.push(`/recording-rules/add/${curBusiId}`);
  };

  const handleClickEdit = (id, isClone = false) => {
    history.push(`/recording-rules/edit/${id}${isClone ? '?mode=clone' : ''}`);
  };

  const refreshList = () => {
    getRecordingRules();
  };

  const columns: ColumnType<strategyItem>[] = [
    {
      title: t('common:datasource.name'),
      dataIndex: 'datasource_ids',
      render: (data, record) => {
        return _.map(data, (item) => {
          if (item === 0) {
            return (
              <Tag color='purple' key={item}>
                $all
              </Tag>
            );
          }
          return <Tag key={item}>{_.find(groupedDatasourceList.prometheus, { id: item })?.name!}</Tag>;
        });
      },
    },
    {
      title: t('name'),
      dataIndex: 'name',
      render: (data, record) => {
        return (
          <div
            className='table-active-text'
            onClick={() => {
              handleClickEdit(record.id);
            }}
          >
            {data}
          </div>
        );
      },
    },
    {
      title: t('prom_eval_interval'),
      dataIndex: 'prom_eval_interval',
      render: (data) => {
        return data + 's';
      },
    },
    {
      title: t('append_tags'),
      dataIndex: 'append_tags',
      render: (data) => {
        const array = data || [];
        return (
          (array.length &&
            array.map((tag: string, index: number) => {
              return (
                <Tag color='purple' key={index}>
                  {tag}
                </Tag>
              );
            })) || <div></div>
        );
      },
    },
    {
      title: t('common:table.update_at'),
      dataIndex: 'update_at',
      render: (text: number) => moment.unix(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: t('disabled'),
      dataIndex: 'disabled',
      render: (disabled, record) => (
        <Switch
          checked={disabled === strategyStatus.Enable}
          size='small'
          onChange={() => {
            const { id, disabled } = record;
            updateRecordingRules(
              {
                ids: [id],
                fields: {
                  disabled: !disabled ? 1 : 0,
                },
              },
              curBusiId,
            ).then(() => {
              refreshList();
            });
          }}
        />
      ),
    },
    {
      title: t('common:table.operations'),
      dataIndex: 'operator',
      render: (data, record) => {
        return (
          <div className='table-operator-area'>
            <div
              className='table-operator-area-normal'
              onClick={() => {
                handleClickEdit(record.id, true);
              }}
            >
              {t('common:btn.clone')}
            </div>
            <div
              className='table-operator-area-warning'
              onClick={() => {
                confirm({
                  title: t('common:confirm.delete'),
                  onOk: () => {
                    deleteRecordingRule([record.id], curBusiId).then(() => {
                      message.success(t('common:success.delete'));
                      refreshList();
                    });
                  },

                  onCancel() {},
                });
              }}
            >
              {t('common:btn.delete')}
            </div>
          </div>
        );
      },
    },
  ];

  const toOneArr = (arr, res, name) => {
    arr.forEach((ele) => {
      if (Array.isArray(ele)) {
        toOneArr(ele, res, name);
      } else {
        res.push(ele[name]);
      }
    });
  };

  const menu = useMemo(() => {
    return (
      <ul className='ant-dropdown-menu'>
        <li
          className='ant-dropdown-menu-item'
          onClick={() => {
            Import({
              busiId: curBusiId,
              refreshList,
            });
          }}
        >
          <span>{t('batch.import.title')}</span>
        </li>
        <li
          className='ant-dropdown-menu-item'
          onClick={() => {
            if (selectedRows.length) {
              const exportData = selectedRows.map((item) => {
                return { ...item, ...exportIgnoreAttrsObj };
              });
              Export({
                data: JSON.stringify(exportData, null, 2),
              });
            } else {
              message.warning(t('batch.must_select_one'));
            }
          }}
        >
          <span>{t('batch.export.title')}</span>
        </li>
        <li
          className='ant-dropdown-menu-item'
          onClick={() => {
            if (selectRowKeys.length) {
              confirm({
                title: t('common:confirm.delete'),
                onOk: () => {
                  deleteRecordingRule(selectRowKeys as number[], curBusiId).then(() => {
                    message.success(t('common:success.delete'));
                    refreshList();
                  });
                },

                onCancel() {},
              });
            } else {
              message.warning(t('batch.must_select_one'));
            }
          }}
        >
          <span>{t('batch.delete')}</span>
        </li>
        <li
          className='ant-dropdown-menu-item'
          onClick={() => {
            if (selectRowKeys.length == 0) {
              message.warning(t('batch.must_select_one'));
              return;
            }
            setisModalVisible(true);
          }}
        >
          <span>{t('batch.update.title')}</span>
        </li>
      </ul>
    );
  }, [selectRowKeys, t]);

  const editModalFinish = async (isOk, fieldsData?) => {
    if (isOk) {
      const res = await updateRecordingRules(
        {
          ids: selectRowKeys,
          fields: fieldsData,
        },
        curBusiId,
      );
      if (!res.err) {
        message.success(t('common:success.edit'));
        refreshList();
        setisModalVisible(false);
      } else {
        message.error(res.err);
      }
    } else {
      setisModalVisible(false);
    }
  };

  return (
    <div className='strategy-table-content'>
      <div className='strategy-table-search table-handle'>
        <Space>
          <RefreshIcon
            onClick={() => {
              refreshList();
            }}
          />
          <Select
            allowClear
            placeholder={t('common:datasource.name')}
            style={{ minWidth: 100 }}
            dropdownMatchSelectWidth={false}
            mode='multiple'
            value={datasourceIds}
            onChange={(val) => {
              setDatasourceIds(val);
            }}
          >
            {_.map(groupedDatasourceList?.prometheus, (item) => (
              <Select.Option value={item.id} key={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
          <SearchInput placeholder={t('search_placeholder')} onSearch={setQuery} allowClear />
        </Space>
        <div className='strategy-table-search-right'>
          <Button type='primary' onClick={goToAddWarningStrategy} className='strategy-table-search-right-create'>
            {t('common:btn.add')}
          </Button>
          <div className={'table-more-options'}>
            <Dropdown overlay={menu} trigger={['click']}>
              <Button onClick={(e) => e.stopPropagation()}>
                {t('common:btn.more')}
                <DownOutlined
                  style={{
                    marginLeft: 2,
                  }}
                />
              </Button>
            </Dropdown>
          </div>
        </div>
      </div>

      <Table
        size='small'
        rowKey='id'
        pagination={{
          total: currentStrategyData.length,
          showQuickJumper: true,
          showSizeChanger: true,
          showTotal: (total) => {
            return t('common:table.total', { total });
          },
          pageSizeOptions: pageSizeOptionsDefault,
          defaultPageSize: 30,
        }}
        loading={loading}
        dataSource={currentStrategyData}
        rowSelection={{
          selectedRowKeys: selectedRows.map((item) => item.id),
          onChange: (selectedRowKeys: React.Key[], selectedRows: strategyItem[]) => {
            setSelectRowKeys(selectedRowKeys);
            setSelectedRows(selectedRows);
          },
        }}
        columns={columns}
      />
      {isModalVisible && <EditModal isModalVisible={isModalVisible} editModalFinish={editModalFinish} />}
    </div>
  );
};

export default PageTable;
