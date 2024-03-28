import React, { useState, useEffect, useMemo, useRef, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import _ from 'lodash';
import queryString from 'query-string';
import { Tabs, Space, Button, Drawer, Input, Table, Tag, Select } from 'antd';
import { SafetyCertificateOutlined, SearchOutlined, CloseOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import usePagination from '@/components/usePagination';
import Export from '@/pages/dashboard/List/Export';
import { CommonStateContext } from '@/App';
import Instructions from '@/pages/dashboardBuiltin/Instructions';
import { getRuleCates, postBuiltinCateFavorite, deleteBuiltinCateFavorite } from './services';
import { RuleCateType, RuleType } from './types';
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

export default function indexV2() {
  const { t } = useTranslation('alertRulesBuiltin');
  const { busiGroups, groupedDatasourceList } = useContext(CommonStateContext);
  const { search } = useLocation();
  const query = queryString.parse(search);
  const [data, setData] = useState<RuleCateType[]>([]);
  const [active, setActive] = useState<RuleCateType>();
  const [group, setGroup] = useState<string>(sessionStorage.getItem('builtin-group') || '');
  const [cateSearch, setCateSearch] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ruleSearch, setRuleSearch] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const pagination = usePagination({ PAGESIZE_KEY: 'dashboard-builtin-pagesize' });
  const selectedRows = useRef<RuleType[]>([]);
  const curRules = active ? processRules(active.name, active.alert_rules) : [];
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
  const fetchData = (cbk?: (dat: RuleCateType[]) => void) => {
    getRuleCates().then((res) => {
      setData(res);
      if (cbk) {
        cbk(res);
      }
    });
  };

  const updateGroup = (group: string) => {
    setGroup(group);
    sessionStorage.setItem('builtin-group', group);
  };
  const updateRuleSearch = (search: string) => {
    setRuleSearch(search);
    sessionStorage.setItem('builtin-search', search);
  };

  const filteredCates = useMemo(() => {
    return _.orderBy(
      _.filter(data, (item) => {
        return _.upperCase(item.name).indexOf(_.upperCase(cateSearch)) > -1;
      }),
      ['favorite', 'name'],
      ['desc', 'asc'],
    );
  }, [data, cateSearch]);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PageLayout title={t('title')} icon={<SafetyCertificateOutlined />}>
      <div>
        <div style={{ background: 'unset' }}>
          <div className='mb2'>
            <Input
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={cateSearch}
              onChange={(e) => {
                setCateSearch(e.target.value);
              }}
              allowClear
              placeholder={t('search_placeholder')}
            />
          </div>
          <div className='builtin-cates-grid'>
            {filteredCates.map((item) => {
              return (
                <div
                  key={item.name}
                  className='builtin-cates-grid-item'
                  onClick={() => {
                    setActive(item);
                    setDrawerOpen(true);
                    updateGroup(_.map(_.groupBy(processRules(item.name, item.alert_rules), '__group__'), (v, k) => k)[0]);
                    updateRuleSearch('');
                  }}
                >
                  <img src={item.icon_url} style={{ height: 42, maxWidth: '60%' }} />
                  <div>{item.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Drawer
        width={800}
        visible={drawerOpen}
        closable={false}
        title={
          <Space>
            <img src={active?.icon_url} style={{ height: 24, width: 24 }} />
            <div>{active?.name}</div>
          </Space>
        }
        extra={
          <CloseOutlined
            onClick={() => {
              setDrawerOpen(false);
              setSelectedRowKeys([]);
              selectedRows.current = [];
            }}
          />
        }
        onClose={() => {
          setDrawerOpen(false);
          setSelectedRowKeys([]);
          selectedRows.current = [];
        }}
      >
        <Tabs>
          <Tabs.TabPane tab={t('tab_list')} key='list'>
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Space>
                  <Select
                    style={{ width: 200 }}
                    placeholder={t('group')}
                    value={group}
                    onChange={(val) => {
                      updateGroup(val);
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
                      updateRuleSearch(e.target.value);
                    }}
                    placeholder={t('search_placeholder')}
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
                className='mt8'
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
                      const cateValue = encodeURIComponent(active?.name || record?.__cate__);
                      const nameValue = encodeURIComponent(record?.name);
                      return (
                        <Space>
                          <Link
                            to={{
                              pathname: '/alert-rules-built-in/detail',
                              search: `?cate=${cateValue}&name=${nameValue}`,
                            }}
                            target='_blank'
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
                                data: JSON.stringify([record], null, 4),
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
            </>
          </Tabs.TabPane>
          <Tabs.TabPane tab={t('tab_instructions')} key='makedown'>
            <Instructions name={(query.cate ? query.cate : active?.name) as string} />
          </Tabs.TabPane>
        </Tabs>
      </Drawer>
    </PageLayout>
  );
}
