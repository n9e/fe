import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { List, Input, Button, Table, Space, Tag, Select } from 'antd';
import { SafetyCertificateOutlined, SearchOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import Export from '@/pages/dashboard/List/Export';
import { CommonStateContext } from '@/App';
import usePagination from '@/components/usePagination';
import { RuleCateType, RuleType } from './types';
import { getRuleCates, postBuiltinCateFavorite, deleteBuiltinCateFavorite } from './services';
import Import from './Import';
import Detail from './Detail';
import './locale';
import './style.less';

export { Detail };

function processRules(cate: string, alertRules: { [key: string]: RuleType[] }) {
  return _.reduce(
    alertRules,
    (subResult, rules, group) => {
      return _.concat(
        subResult,
        _.map(rules, (rule) => ({ ...rule, __cate__: cate, __group__: group })),
      );
    },
    [],
  );
}

export default function index() {
  const { t } = useTranslation('alertRulesBuiltin');
  const { busiGroups, groupedDatasourceList } = useContext(CommonStateContext);
  const pagination = usePagination({ PAGESIZE_KEY: 'alert-rules-builtin-pagesize' });
  const [data, setData] = useState<RuleCateType[]>([]);
  const [active, setActive] = useState<RuleCateType>();
  const [group, setGroup] = useState<string>();
  const [cateSearch, setCateSearch] = useState<string>('');
  const [ruleSearch, setRuleSearch] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const allRules = useRef<RuleType[]>([]);
  const selectedRows = useRef<RuleType[]>([]);
  const curRules = active ? processRules(active.name, active.alert_rules) : allRules.current;
  const filteredCates = _.orderBy(
    _.filter(data, (item) => {
      return _.upperCase(item.name).indexOf(_.upperCase(cateSearch)) > -1;
    }),
    ['favorite', 'name'],
    ['desc', 'asc'],
  );
  const filteredRules = _.filter(curRules, (item) => {
    if (!item) return false;
    let isMatch = true;
    const search = _.trim(ruleSearch);
    if (search) {
      isMatch = _.includes(item.name.toLowerCase(), search.toLowerCase()) || _.some(item.append_tags, (tag) => _.includes(tag.toLowerCase(), search.toLowerCase()));
    }
    if (group) {
      isMatch = isMatch && item.__group__ === group;
    }
    return isMatch;
  });

  const fetchData = () => {
    getRuleCates().then((res) => {
      allRules.current = _.reduce(
        res,
        (result, item) => {
          const rules = processRules(item.name, item.alert_rules);
          return _.concat(result, rules);
        },
        [] as RuleType[],
      );
      setData(res);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PageLayout title={t('title')} icon={<SafetyCertificateOutlined />}>
      <div className='user-manage-content builtin-container'>
        <div style={{ display: 'flex', height: '100%' }}>
          <div className='left-tree-area'>
            <div className='sub-title'>{t('cate')}</div>
            <div style={{ display: 'flex', margin: '5px 0px 12px' }}>
              <Input
                prefix={<SearchOutlined />}
                value={cateSearch}
                onChange={(e) => {
                  setCateSearch(e.target.value);
                }}
                placeholder={t('common:search_placeholder')}
                allowClear
              />
            </div>

            <List
              style={{
                marginBottom: '12px',
                flex: 1,
                overflow: 'auto',
              }}
              dataSource={filteredCates}
              size='small'
              renderItem={(item: any, idx) => (
                <List.Item
                  key={item.name}
                  className={classNames('cate-list-item', { 'is-active': active?.name === item.name, 'is-last-favorite': item.favorite && !filteredCates[idx + 1]?.favorite })}
                  onClick={() => {
                    setActive(item);
                    setGroup(_.map(_.groupBy(processRules(item.name, item.alert_rules), '__group__'), (v, k) => k)[0]);
                  }}
                  extra={
                    <span
                      className='cate-list-item-extra'
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.favorite) {
                          deleteBuiltinCateFavorite(item.name).then(() => {
                            fetchData();
                          });
                        } else {
                          postBuiltinCateFavorite(item.name).then(() => {
                            fetchData();
                          });
                        }
                      }}
                    >
                      {item.favorite ? <StarFilled style={{ color: 'orange' }} /> : <StarOutlined />}
                    </span>
                  }
                >
                  <Space>
                    <img src={item.icon_url} style={{ width: 24, height: 24 }} />
                    {item.name}
                  </Space>
                </List.Item>
              )}
            />
          </div>
          <div className='resource-table-content'>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Space>
                <Select
                  style={{ width: 200 }}
                  placeholder={t('group')}
                  value={group}
                  onChange={(val) => {
                    setGroup(val);
                  }}
                >
                  {_.map(_.groupBy(curRules, '__group__'), (_rules, group) => {
                    return (
                      <Select.Option key={group} value={group}>
                        {group}
                      </Select.Option>
                    );
                  })}
                </Select>
                <Input
                  prefix={<SearchOutlined />}
                  value={ruleSearch}
                  onChange={(e) => {
                    setRuleSearch(e.target.value);
                  }}
                  placeholder={t('common:search_placeholder')}
                  style={{ width: 300 }}
                  allowClear
                />
              </Space>
              <Space>
                <Button
                  onClick={() => {
                    Import({
                      data: JSON.stringify(selectedRows.current, null, 4),
                      busiGroups,
                      groupedDatasourceList,
                    });
                  }}
                >
                  {t('common:btn.batch_clone')}
                </Button>
                <Button
                  onClick={() => {
                    Export({
                      data: JSON.stringify(selectedRows.current, null, 4),
                    });
                  }}
                >
                  {t('common:btn.batch_export')}
                </Button>
              </Space>
            </div>
            <Table
              size='small'
              rowKey={(record) => `${record.__cate__}-${record.__group__}-${record.name}`}
              dataSource={filteredRules}
              rowSelection={{
                selectedRowKeys,
                onChange: (selectedRowKeys: string[], rows: RuleType[]) => {
                  setSelectedRowKeys(selectedRowKeys);
                  selectedRows.current = rows;
                },
              }}
              columns={[
                {
                  title: t('name'),
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: t('append_tags'),
                  dataIndex: 'append_tags',
                  key: 'append_tags',
                  render: (val) => {
                    return (
                      <Space size='middle'>
                        {_.map(val, (tag, idx) => {
                          return (
                            <Tag
                              key={idx}
                              color='purple'
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                const queryItem = _.compact(_.split(ruleSearch, ' '));
                                if (queryItem.includes(tag)) return;
                                setRuleSearch((searchVal) => {
                                  if (searchVal) {
                                    return searchVal + ' ' + tag;
                                  }
                                  return tag;
                                });
                              }}
                            >
                              {tag}
                            </Tag>
                          );
                        })}
                      </Space>
                    );
                  },
                },
                {
                  title: t('common:table.operations'),
                  width: 120,
                  render: (record) => {
                    return (
                      <Space>
                        <Link
                          to={{
                            pathname: '/alert-rules-built-in/detail',
                            search: `?cate=${active?.name || record?.__cate__}&name=${record?.name}`,
                          }}
                        >
                          {t('common:btn.view')}
                        </Link>
                        <a
                          onClick={() => {
                            Import({
                              data: JSON.stringify(record, null, 4),
                              busiGroups,
                              groupedDatasourceList,
                            });
                          }}
                        >
                          {t('common:btn.clone')}
                        </a>
                        <a
                          onClick={() => {
                            Export({
                              data: JSON.stringify(record, null, 4),
                            });
                          }}
                        >
                          {t('common:btn.export')}
                        </a>
                      </Space>
                    );
                  },
                },
              ]}
              pagination={pagination}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
