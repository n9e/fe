/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, Link } from 'react-router-dom';
import _ from 'lodash';
import moment from 'moment';
import { Table, Tag, Switch, Modal, Space, Button, Row, Col, message } from 'antd';
import { ColumnType } from 'antd/lib/table';
import AdvancedWrap from '@/components/AdvancedWrap';
import { Pure as DatasourceSelect } from '@/components/DatasourceSelect';
import RefreshIcon from '@/components/RefreshIcon';
import SearchInput from '@/components/BaseSearchInput';
import { getStrategyGroupSubList, updateAlertRules, deleteStrategy } from '@/services/warning';
import { CommonStateContext } from '@/App';
import { AlertRuleType, AlertRuleStatus } from '../types';
import { priorityColor, pageSizeOptionsDefault } from '../constants';
import MoreOperations from './MoreOperations';

interface ListProps {
  bgid?: number;
}

interface Filter {
  cate?: string;
  datasourceIds?: number[];
  search?: string;
}

export default function List(props: ListProps) {
  const { bgid } = props;
  const { t } = useTranslation('alertRules');
  const history = useHistory();
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const [filter, setFilter] = useState<Filter>({});
  const [selectRowKeys, setSelectRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<AlertRuleType<any>[]>([]);
  const [data, setData] = useState<AlertRuleType<any>[]>([]);
  const [loading, setLoading] = useState(false);
  const columns: ColumnType<AlertRuleType<any>>[] = [
    {
      title: t('common:datasource.type'),
      dataIndex: 'cate',
    },
    {
      title: t('common:datasource.name'),
      dataIndex: 'datasource_ids',
      render: (value, record) => {
        if (!record.datasource_ids) return '-';
        return (
          <div>
            {_.map(record.datasource_ids, (item) => {
              if (item === 0) {
                return (
                  <Tag color='purple' key={item}>
                    $all
                  </Tag>
                );
              }
              const name = _.find(groupedDatasourceList[record.cate], { id: item })?.name;
              if (!name) return '-';
              return (
                <Tag color='purple' key={item}>
                  {name}
                </Tag>
              );
            })}
          </div>
        );
      },
    },
    // {
    //   title: t('severity'),
    //   dataIndex: 'severity',
    //   render: (data) => {
    //     return <Tag color={priorityColor[data - 1]}>S{data}</Tag>;
    //   },
    // },
    {
      title: t('common:table.name'),
      dataIndex: 'name',
      render: (data, record) => {
        return (
          <Link
            className='table-active-text'
            to={{
              pathname: `/alert-rules/edit/${record.id}`,
            }}
          >
            {data}
          </Link>
        );
      },
    },
    {
      title: t('notify_groups'),
      dataIndex: 'notify_groups_obj',
      width: 100,
      render: (data) => {
        return (
          (data.length &&
            data.map(
              (
                user: {
                  nickname: string;
                  username: string;
                } & { name: string },
                index: number,
              ) => {
                return (
                  <Tag color='purple' key={index}>
                    {user.nickname || user.username || user.name}
                  </Tag>
                );
              },
            )) || <div></div>
        );
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
      width: 120,
      render: (text: string) => moment.unix(Number(text)).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: t('common:table.enabled'),
      dataIndex: 'disabled',
      render: (disabled, record) => (
        <Switch
          checked={disabled === AlertRuleStatus.Enable}
          size='small'
          onChange={() => {
            const { id, disabled } = record;
            bgid &&
              updateAlertRules(
                {
                  ids: [id],
                  fields: {
                    disabled: !disabled ? 1 : 0,
                  },
                },
                bgid,
              ).then(() => {
                getAlertRules();
              });
          }}
        />
      ),
    },
    {
      title: t('common:table.operations'),
      dataIndex: 'operator',
      width: 120,
      render: (data, record: any) => {
        return (
          <div className='table-operator-area'>
            <Link
              className='table-operator-area-normal'
              style={{ marginRight: 8 }}
              to={{
                pathname: `/alert-rules/edit/${record.id}?mode=clone`,
              }}
              target='_blank'
            >
              {t('common:btn.clone')}
            </Link>
            <div
              className='table-operator-area-warning'
              onClick={() => {
                Modal.confirm({
                  title: t('common:confirm.delete'),
                  onOk: () => {
                    bgid &&
                      deleteStrategy([record.id], bgid).then(() => {
                        message.success(t('common:success.delete'));
                        getAlertRules();
                      });
                  },

                  onCancel() {},
                });
              }}
            >
              {t('common:btn.delete')}
            </div>
            {record.algorithm === 'holtwinters' && (
              <div>
                <Link to={{ pathname: `/alert-rules/brain/${record.id}` }}>训练结果</Link>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  const filterData = () => {
    return data.filter((item) => {
      const { cate, datasourceIds, search } = filter;
      const lowerCaseQuery = search?.toLowerCase() || '';
      return (
        (item.name.toLowerCase().indexOf(lowerCaseQuery) > -1 || item.append_tags.join(' ').toLowerCase().indexOf(lowerCaseQuery) > -1) &&
        ((cate && cate === item.cate) || !cate) &&
        (_.some(item.datasource_ids, (id) => {
          if (id === 0) return true;
          return _.includes(datasourceIds, id);
        }) ||
          datasourceIds?.length === 0 ||
          !datasourceIds)
      );
    });
  };
  const getAlertRules = async () => {
    if (!bgid) {
      return;
    }
    setLoading(true);
    const { success, dat } = await getStrategyGroupSubList({ id: bgid });
    if (success) {
      setData(dat || []);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bgid) {
      getAlertRules();
    }
  }, [bgid]);

  if (!bgid) return null;
  const filteredData = filterData();

  return (
    <div className='alert-rules-list-container' style={{ height: '100%', overflowY: 'auto' }}>
      <Row justify='space-between'>
        <Col span={16}>
          <Space>
            <RefreshIcon
              onClick={() => {
                getAlertRules();
              }}
            />
            <AdvancedWrap var='VITE_IS_ALERT_ES'>
              {(isShow) => {
                return (
                  <DatasourceSelect
                    datasourceCate={filter.cate}
                    onDatasourceCateChange={(val) => {
                      setFilter({
                        ...filter,
                        cate: val,
                      });
                    }}
                    datasourceValue={filter.datasourceIds}
                    datasourceValueMode='multiple'
                    onDatasourceValueChange={(val: number[]) => {
                      setFilter({
                        ...filter,
                        datasourceIds: val,
                      });
                    }}
                    filterCates={(cates) => {
                      return _.filter(cates, (item) => {
                        if (item.value === 'elasticsearch') {
                          return isShow[0];
                        }
                        return true;
                      });
                    }}
                  />
                );
              }}
            </AdvancedWrap>
            <SearchInput
              placeholder={t('search_placeholder')}
              onSearch={(val) => {
                setFilter({
                  ...filter,
                  search: val,
                });
              }}
              allowClear
            />
          </Space>
        </Col>
        <Col>
          <Space>
            <Button
              type='primary'
              onClick={() => {
                history.push(`/alert-rules/add/${bgid}`);
              }}
              className='strategy-table-search-right-create'
            >
              {t('common:btn.add')}
            </Button>
            <MoreOperations bgid={bgid} selectRowKeys={selectRowKeys} selectedRows={selectedRows} getAlertRules={getAlertRules} />
          </Space>
        </Col>
      </Row>
      <Table
        size='small'
        rowKey='id'
        pagination={{
          total: filteredData.length,
          showQuickJumper: true,
          showSizeChanger: true,
          showTotal: (total) => {
            return `共 ${total} 条数据`;
          },
          pageSizeOptions: pageSizeOptionsDefault,
          defaultPageSize: 30,
        }}
        loading={loading}
        dataSource={filteredData}
        rowSelection={{
          selectedRowKeys: selectedRows.map((item) => item.id),
          onChange: (selectedRowKeys: React.Key[], selectedRows: AlertRuleType<any>[]) => {
            setSelectRowKeys(selectedRowKeys);
            setSelectedRows(selectedRows);
          },
        }}
        columns={columns}
      />
    </div>
  );
}
