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
import { Button, Input, Table, Tooltip, message, Modal, Switch, Space, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { CloseCircleOutlined, ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation, Link } from 'react-router-dom';
import queryString from 'query-string';
import AdvancedWrap from '@/components/AdvancedWrap';
import PageLayout from '@/components/pageLayout';
import { getShieldList, deleteShields, updateShields } from '@/services/shield';
import { shieldItem, strategyStatus } from '@/store/warningInterface';
import { BusinessGroup } from '@/pages/targets';
import RefreshIcon from '@/components/RefreshIcon';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import { Pure as DatasourceSelect } from '@/components/DatasourceSelect';
import { CommonStateContext } from '@/App';
import { pageSizeOptionsDefault } from '../const';
import './locale';
import './index.less';

export { default as Add } from './add';
export { default as Edit } from './edit';

const { confirm } = Modal;

const Shield: React.FC = () => {
  const { t } = useTranslation('alertMutes');
  const history = useHistory();
  const { search } = useLocation();
  const { id } = queryString.parse(search);
  const commonState = useContext(CommonStateContext);
  const bgid = id ? Number(id) : commonState.curBusiId;
  const { groupedDatasourceList } = commonState;
  const [query, setQuery] = useState<string>('');
  const [currentShieldDataAll, setCurrentShieldDataAll] = useState<Array<shieldItem>>([]);
  const [currentShieldData, setCurrentShieldData] = useState<Array<shieldItem>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [cate, setCate] = useState<string>();
  const [datasourceIds, setDatasourceIds] = useState<number[]>();

  const columns: ColumnsType = [
    {
      title: t('common:datasource.type'),
      dataIndex: 'cate',
    },
    {
      title: t('common:datasource.id'),
      dataIndex: 'datasource_ids',
      render: (data, record: any) => {
        return _.map(data, (item) => {
          if (item === 0) {
            return (
              <Tag color='purple' key={item}>
                $all
              </Tag>
            );
          }
          return (
            <Tag color='purple' key={item}>
              {_.find(groupedDatasourceList[record.cate], { id: item })?.name!}
            </Tag>
          );
        });
      },
    },
    {
      title: t('note'),
      dataIndex: 'note',
      render: (data, record: any) => {
        return (
          <Link
            to={{
              pathname: `/alert-mutes/edit/${record.id}`,
              state: record,
            }}
          >
            {data}
          </Link>
        );
      },
    },
    {
      title: t('common:table.tag'),
      dataIndex: 'tags',
      render: (text: any) => {
        return (
          <>
            {text
              ? text.map((tag, index) => {
                  return tag ? (
                    <div key={index} style={{ lineHeight: '16px' }}>{`${tag.key} ${tag.func} ${tag.func === 'in' ? tag.value.split(' ').join(', ') : tag.value}`}</div>
                  ) : null;
                })
              : ''}
          </>
        );
      },
    },
    {
      title: t('cause'),
      dataIndex: 'cause',
      render: (text: string, record: shieldItem) => {
        return (
          <>
            <Tooltip placement='topLeft' title={text}>
              <div
                style={{
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  lineHeight: '16px',
                }}
              >
                {text}
              </div>
            </Tooltip>
            by {record.create_by}
          </>
        );
      },
    },
    {
      title: t('time'),
      dataIndex: 'btime',
      render: (text: number, record: shieldItem) => {
        if (record.mute_time_type === 0) {
          return (
            <div className='shield-time'>
              <div>{moment.unix(record?.btime).format('YYYY-MM-DD HH:mm:ss')}</div>
              <div>{moment.unix(record?.etime).format('YYYY-MM-DD HH:mm:ss')}</div>
            </div>
          );
        } else if (record.mute_time_type === 1) {
          return (
            <Tooltip
              overlayInnerStyle={{
                width: 350,
              }}
              title={_.map(record.periodic_mutes, (item, idx) => {
                return (
                  <div key={idx}>
                    <Space>
                      <div>
                        {item.enable_stime} ~ {item.enable_etime}
                      </div>
                      <Space>
                        {_.map(_.split(item.enable_days_of_week, ' '), (item) => {
                          return t(`common:time.weekdays.${item}`);
                        })}
                      </Space>
                    </Space>
                  </div>
                );
              })}
            >
              <a>{t('mute_type.1')}</a>
            </Tooltip>
          );
        }
      },
    },
    {
      title: t('common:table.enabled'),
      dataIndex: 'disabled',
      render: (disabled, record) => (
        <Switch
          checked={disabled === strategyStatus.Enable}
          size='small'
          onChange={() => {
            // @ts-ignore
            const { id, disabled } = record;
            updateShields(
              {
                ids: [id],
                fields: {
                  disabled: !disabled ? 1 : 0,
                },
              },
              Number(bgid),
            ).then(() => {
              refreshList();
            });
          }}
        />
      ),
    },
    {
      title: t('common:table.operations'),
      width: '98px',
      dataIndex: 'operation',
      render: (text: undefined, record: shieldItem) => {
        return (
          <>
            <div className='table-operator-area'>
              <div
                className='table-operator-area-normal'
                style={{
                  cursor: 'pointer',
                  display: 'inline-block',
                }}
                onClick={() => {
                  history.push(`/alert-mutes/edit/${record.id}?mode=clone`, {
                    ...record,
                    datasource_ids: record.datasource_ids || undefined,
                  });
                }}
              >
                {t('common:btn.clone')}
              </div>
              <div
                className='table-operator-area-warning'
                style={{
                  cursor: 'pointer',
                  display: 'inline-block',
                }}
                onClick={() => {
                  confirm({
                    title: t('common:confirm.delete'),
                    icon: <ExclamationCircleOutlined />,
                    onOk: () => {
                      dismiss(record.id);
                    },

                    onCancel() {},
                  });
                }}
              >
                {t('common:btn.delete')}
              </div>
            </div>
          </>
        );
      },
    },
  ];

  useEffect(() => {
    getList();
  }, [bgid]);

  useEffect(() => {
    filterData();
  }, [query, cate, datasourceIds, currentShieldDataAll]);

  const dismiss = (id: number) => {
    deleteShields({ ids: [id] }, Number(bgid)).then((res) => {
      refreshList();
      if (res.err) {
        message.success(res.err);
      } else {
        message.success(t('common:success.delete'));
      }
    });
  };

  const filterData = () => {
    const data = JSON.parse(JSON.stringify(currentShieldDataAll));
    const res = data.filter((item: shieldItem) => {
      const tagFind = item.tags.find((tag) => {
        return tag.key.indexOf(query) > -1 || tag.value.indexOf(query) > -1 || tag.func.indexOf(query) > -1;
      });
      return (
        (item.cause.indexOf(query) > -1 || !!tagFind) &&
        ((cate && cate === item.cate) || !cate) &&
        (_.some(item.datasource_ids, (id) => {
          if (id === 0) return true;
          return _.includes(datasourceIds, id);
        }) ||
          datasourceIds?.length === 0 ||
          !datasourceIds)
      );
    });
    setCurrentShieldData(res || []);
  };

  const getList = async () => {
    if (bgid) {
      setLoading(true);
      const { success, dat } = await getShieldList({ id: Number(bgid) });
      if (success) {
        setCurrentShieldDataAll(dat || []);
        setLoading(false);
      }
    }
  };

  const refreshList = () => {
    getList();
  };

  const onSearchQuery = (e) => {
    let val = e.target.value;
    setQuery(val);
  };

  return (
    <PageLayout title={t('title')} icon={<CloseCircleOutlined />}>
      <div className='shield-content'>
        <BusinessGroup
          curBusiId={bgid}
          setCurBusiId={(newId) => {
            history.push(`/alert-mutes?id=${newId}`);
            commonState.setCurBusiId(newId);
          }}
        />
        {bgid ? (
          <div className='shield-index' style={{ height: '100%', overflowY: 'auto' }}>
            <div className='header'>
              <Space>
                <RefreshIcon
                  onClick={() => {
                    refreshList();
                  }}
                />
                <AdvancedWrap var='VITE_IS_ALERT_ES'>
                  {(isShow) => {
                    return (
                      <DatasourceSelect
                        datasourceCate={cate}
                        onDatasourceCateChange={(val) => {
                          setCate(val);
                        }}
                        datasourceValue={datasourceIds}
                        datasourceValueMode='multiple'
                        onDatasourceValueChange={(val: number[]) => {
                          setDatasourceIds(val);
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
                <Input onPressEnter={onSearchQuery} prefix={<SearchOutlined />} placeholder={t('search_placeholder')} />
              </Space>
              <div className='header-right'>
                <Button
                  type='primary'
                  className='add'
                  onClick={() => {
                    history.push('/alert-mutes/add');
                  }}
                >
                  {t('common:btn.add')}
                </Button>
              </div>
            </div>
            <Table
              size='small'
              rowKey='id'
              pagination={{
                total: currentShieldData.length,
                showQuickJumper: true,
                showSizeChanger: true,
                showTotal: (total) => {
                  return t('common:table.total', { total });
                },
                pageSizeOptions: pageSizeOptionsDefault,
                defaultPageSize: 30,
              }}
              loading={loading}
              dataSource={currentShieldData}
              columns={columns}
            />
          </div>
        ) : (
          <BlankBusinessPlaceholder text='屏蔽规则' />
        )}
      </div>
    </PageLayout>
  );
};

export default Shield;
