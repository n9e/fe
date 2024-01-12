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
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Input, Table, Switch, Tag, Select, Modal, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ColumnType } from 'antd/lib/table';
import moment from 'moment';
import { debounce } from 'lodash';
import _ from 'lodash';
import { strategyItem, strategyStatus } from '@/store/warningInterface';
import { getStrategyGroupSubList, updateAlertRules } from '@/services/warning';
import { priorityColor } from '@/utils/constant';
import { getBusinessTeamList } from '@/services/manage';
import { CommonStateContext } from '@/App';
import usePagination from '@/components/usePagination';

const { Option } = Select;
interface props {
  visible: boolean;
  ruleModalClose: Function;
  subscribe: Function;
  selectedRules: any[];
}

const ruleModal: React.FC<props> = (props) => {
  const { visible, ruleModalClose, subscribe } = props;
  const { t } = useTranslation('alertSubscribes');
  const pagination = usePagination({ PAGESIZE_KEY: 'alert-rules-pagesize' });
  const { businessGroup, datasourceList } = useContext(CommonStateContext);
  const curBusiId = businessGroup.id!;
  const [busiGroups, setBusiGroups] = useState<{ id: number; name: string }[]>([]);
  const [currentStrategyDataAll, setCurrentStrategyDataAll] = useState([]);
  const [currentStrategyData, setCurrentStrategyData] = useState([]);
  const [bgid, setBgid] = useState(curBusiId);
  const [query, setQuery] = useState<string>('');
  const [selectedRules, setSelectedRules] = useState<any[]>([]);

  useEffect(() => {
    setBgid(curBusiId);
  }, [curBusiId]);

  useEffect(() => {
    getAlertRules();
  }, [bgid]);

  useEffect(() => {
    getTeamList('');
  }, []);

  useEffect(() => {
    filterData();
  }, [query, currentStrategyDataAll]);

  useEffect(() => {
    setSelectedRules(props.selectedRules);
  }, [props.selectedRules]);

  // 获取业务组列表
  const getTeamList = (query: string) => {
    let params = {
      all: 1,
      query,
      limit: 200,
    };
    getBusinessTeamList(params).then((data) => {
      setBusiGroups(data.dat || []);
    });
  };

  const debounceFetcher = useCallback(debounce(getTeamList, 400), []);

  const getAlertRules = async () => {
    const { success, dat } = await getStrategyGroupSubList({ id: bgid });
    if (success) {
      setCurrentStrategyDataAll(dat || []);
    }
  };

  const bgidChange = (val) => {
    setBgid(val);
  };

  const filterData = () => {
    const data = JSON.parse(JSON.stringify(currentStrategyDataAll));
    const res = data.filter((item) => {
      return item.name.indexOf(query) > -1 || item.append_tags.join(' ').indexOf(query) > -1;
    });
    setCurrentStrategyData(res || []);
  };

  const onSearchQuery = (e) => {
    let val = e.target.value;
    setQuery(val);
  };

  const columns: ColumnType<strategyItem>[] = [
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
              const name = _.find(datasourceList, { id: item })?.name;
              if (!name) return '';
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
    {
      title: t('alertRules:severity'),
      dataIndex: 'severities',
      render: (data) => {
        return _.map(data, (severity) => {
          return (
            <Tag key={severity} color={priorityColor[severity - 1]}>
              S{severity}
            </Tag>
          );
        });
      },
    },
    {
      title: t('common:table.name'),
      dataIndex: 'name',
      render: (data, record) => {
        return (
          <Link
            className='table-text'
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
      title: t('alertRules:notify_groups'),
      dataIndex: 'notify_groups_obj',
      render: (data, record) => {
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
      title: t('alertRules:append_tags'),
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
      render: (text: string) => {
        return <div className='table-text'>{moment.unix(Number(text)).format('YYYY-MM-DD HH:mm:ss')}</div>;
      },
    },
    {
      title: t('common:table.enabled'),
      dataIndex: 'disabled',
      render: (disabled, record) => (
        <Switch
          checked={disabled === strategyStatus.Enable}
          disabled
          size='small'
          onChange={() => {
            const { id, disabled } = record;
            updateAlertRules(
              {
                ids: [id],
                fields: {
                  disabled: !disabled ? 1 : 0,
                },
              },
              curBusiId,
            ).then(() => {
              getAlertRules();
            });
          }}
        />
      ),
    },
  ];

  const handleSubscribe = (record) => {
    subscribe(record);
  };

  const modalClose = () => {
    ruleModalClose();
  };

  return (
    <>
      <Modal
        destroyOnClose
        forceRender
        width='80%'
        title={t('sub_rule_name')}
        visible={visible}
        onCancel={() => {
          modalClose();
          setSelectedRules([]);
        }}
        onOk={() => {
          handleSubscribe(selectedRules);
          setSelectedRules([]);
        }}
      >
        {!_.isEmpty(selectedRules) && (
          <div className='mb16'>
            <Space>
              <span>{t('sub_rule_selected')}: </span>
              {_.map(selectedRules, (item) => (
                <Tag
                  color='purple'
                  key={item.id}
                  closable
                  onClose={() => {
                    setSelectedRules(selectedRules.filter((row) => row.id !== item.id));
                  }}
                >
                  <Link to={`/alert-rules/edit/${item.id}`} target='_blank'>
                    {item.name}
                  </Link>
                </Tag>
              ))}
            </Space>
          </div>
        )}
        <div>
          <Select
            style={{ width: '280px' }}
            value={bgid}
            onChange={bgidChange}
            showSearch
            optionFilterProp='children'
            filterOption={false}
            onSearch={(e) => debounceFetcher(e)}
            onBlur={() => getTeamList('')}
          >
            {busiGroups.map((item) => (
              <Option value={item.id} key={item.id}>
                {item.name}
              </Option>
            ))}
          </Select>
          <Input style={{ marginLeft: 10, width: '280px' }} onPressEnter={onSearchQuery} prefix={<SearchOutlined />} placeholder={t('alertRules:search_placeholder')} />
        </div>
        <div className='rule_modal_table mt16'>
          <Table
            size='small'
            rowKey='id'
            pagination={pagination}
            dataSource={currentStrategyData}
            columns={columns}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: selectedRules.map((row) => row.id),
              onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
                setSelectedRules(_.unionBy(selectedRules, selectedRows, 'id'));
              },
            }}
          />
        </div>
      </Modal>
    </>
  );
};

export default ruleModal;
