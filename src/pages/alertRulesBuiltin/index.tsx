import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { List, Input, Button, Table, Space, Tag } from 'antd';
import { SafetyCertificateOutlined, SearchOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import Export from '@/pages/dashboard/List/Export';
import { CommonStateContext } from '@/App';
import { RuleCateType, RuleType } from './types';
import { getRuleCates, postBuiltinCateFavorite, deleteBuiltinCateFavorite } from './services';
import Import from './Import';
import './locale';
import './style.less';

export default function index() {
  const { t } = useTranslation('alertRulesBuiltin');
  const { busiGroups } = useContext(CommonStateContext);
  const [data, setData] = useState<RuleCateType[]>([]);
  const [active, setActive] = useState<RuleCateType>();
  const [cateSearch, setCateSearch] = useState<string>('');
  const [ruleSearch, setRuleSearch] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const allRules = useRef<RuleType[]>([]);
  const selectedRows = useRef<RuleType[]>([]);
  const curRules = active ? active.alert_rules : allRules.current;
  const filteredCates = _.orderBy(
    _.filter(data, (item) => {
      return _.upperCase(item.name).indexOf(_.upperCase(cateSearch)) > -1;
    }),
    ['favorite', 'name'],
    ['desc', 'asc'],
  );
  const filteredRules = _.filter(curRules, (item) => {
    if (!item) return false;
    const search = _.trim(ruleSearch);
    if (search) {
      return _.includes(item.name.toLowerCase(), search.toLowerCase()) || _.some(item.append_tags, (tag) => _.includes(tag.toLowerCase(), search.toLowerCase()));
    }
    return true;
  });

  const fetchData = () => {
    getRuleCates().then((res) => {
      allRules.current = _.reduce(
        res,
        (result, item) => {
          return _.concat(result, item.alert_rules);
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
              renderItem={(item, idx) => (
                <List.Item
                  key={item.name}
                  className={classNames('cate-list-item', { 'is-active': active?.name === item.name, 'is-last-favorite': item.favorite && !filteredCates[idx + 1]?.favorite })}
                  onClick={() => setActive(item)}
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
              <Space>
                <Button
                  onClick={() => {
                    Import({
                      data: JSON.stringify(selectedRows.current, null, 4),
                      busiGroups,
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
              rowKey='name'
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
                  title: t('common:operations'),
                  width: 120,
                  render: (record) => {
                    return (
                      <Space>
                        <Link
                          to={{
                            pathname: '/alert-rules-built-in/detail',
                            state: record,
                          }}
                        >
                          {t('common:btn.view')}
                        </Link>
                        <a
                          onClick={() => {
                            Import({
                              data: JSON.stringify(record, null, 4),
                              busiGroups,
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
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
