import React, { useState, useEffect, useRef, useContext } from 'react';
import _ from 'lodash';
import { Link, useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { List, Input, Button, Table, Space, Tag, Tabs } from 'antd';
import { SafetyCertificateOutlined, SearchOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import Export from '@/pages/dashboard/List/Export';
import usePagination from '@/components/usePagination';
import { CommonStateContext } from '@/App';
import { BoardCateType, BoardType } from './types';
import { getDashboardCates, getDashboardDetail, postBuiltinCateFavorite, deleteBuiltinCateFavorite } from './services';
import Import from './Import';
import Detail from './Detail';
import Instructions from './Instructions';
import './locale';
import './style.less';

export { Detail };

export default function index() {
  const { t } = useTranslation('dashboardBuiltin');
  const history = useHistory();
  const { search } = useLocation();
  const query = queryString.parse(search);
  const { busiGroups } = useContext(CommonStateContext);
  const [data, setData] = useState<BoardCateType[]>([]);
  const [active, setActive] = useState<BoardCateType>();
  const [cateSearch, setCateSearch] = useState<string>('');
  const [boardSearch, setBoardSearch] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const pagination = usePagination({ PAGESIZE_KEY: 'dashboard-builtin-pagesize' });
  const selectedRows = useRef<BoardType[]>([]);
  const datasource = active ? active.boards : [];
  const filteredCates = _.orderBy(
    _.filter(data, (item) => {
      return _.upperCase(item.name).indexOf(_.upperCase(cateSearch)) > -1;
    }),
    ['favorite', 'name'],
    ['desc', 'asc'],
  );
  const filteredDatasource = _.filter(datasource, (item) => {
    const search = _.trim(boardSearch);
    if (search) {
      return _.includes(item.name.toLowerCase(), search.toLowerCase()) || item.tags.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const fetchData = (cbk?: (dat: BoardCateType[]) => void) => {
    getDashboardCates().then((res) => {
      setData(res);
      setActive(_.orderBy(res, ['favorite', 'name'], ['desc', 'asc'])[0]);
      if (cbk) {
        cbk(res);
      }
    });
  };

  useEffect(() => {
    fetchData((dat) => {
      const cateStr = query.cate ? query.cate : localStorage.getItem('builtin-cate');
      if (cateStr) {
        const cate = _.find(dat, { name: cateStr }) as BoardCateType;
        if (cate) {
          setActive(cate);
        }
      }
    });
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
                    history.replace({
                      pathname: '/dashboards-built-in',
                      search: `?cate=${item.name}`,
                    });
                    localStorage.setItem('builtin-cate', item.name);
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
            <Tabs>
              <Tabs.TabPane tab={t('tab_list')} key='list'>
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Input
                      prefix={<SearchOutlined />}
                      value={boardSearch}
                      onChange={(e) => {
                        setBoardSearch(e.target.value);
                      }}
                      style={{ width: 300 }}
                      allowClear
                    />
                    <Space>
                      <Button
                        onClick={() => {
                          const requests = _.map(selectedRows.current, (item) => {
                            return getDashboardDetail(item);
                          });
                          Promise.all(requests).then((res) => {
                            Import({
                              data: JSON.stringify(res, null, 4),
                              busiGroups,
                            });
                          });
                        }}
                      >
                        {t('common:btn.batch_clone')}
                      </Button>
                      <Button
                        onClick={() => {
                          const requests = _.map(selectedRows.current, (item) => {
                            return getDashboardDetail(item);
                          });
                          Promise.all(requests).then((res) => {
                            Export({
                              data: JSON.stringify(res, null, 4),
                            });
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
                    pagination={pagination}
                    dataSource={filteredDatasource}
                    rowSelection={{
                      selectedRowKeys,
                      onChange: (selectedRowKeys: string[], rows: BoardType[]) => {
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
                        title: t('tags'),
                        dataIndex: 'tags',
                        key: 'tags',
                        render: (val) => {
                          const tags = _.compact(_.split(val, ' '));
                          return (
                            <Space size='middle'>
                              {_.map(tags, (tag, idx) => {
                                return (
                                  <Tag
                                    key={idx}
                                    color='purple'
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                      const queryItem = _.compact(_.split(boardSearch, ' '));
                                      if (queryItem.includes(tag)) return;
                                      setBoardSearch((searchVal) => {
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
                                  pathname: '/dashboards-built-in/detail',
                                  search: `__built-in-cate=${cateValue}&__built-in-name=${nameValue}`,
                                }}
                              >
                                {t('common:btn.view')}
                              </Link>
                              <a
                                onClick={() => {
                                  getDashboardDetail(record).then((res) => {
                                    Import({
                                      data: JSON.stringify(res, null, 4),
                                      busiGroups,
                                    });
                                  });
                                }}
                              >
                                {t('common:btn.clone')}
                              </a>
                              <a
                                onClick={() => {
                                  getDashboardDetail(record).then((res) => {
                                    Export({
                                      data: JSON.stringify(res, null, 4),
                                    });
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
                </>
              </Tabs.TabPane>
              <Tabs.TabPane tab={t('tab_instructions')} key='makedown'>
                <Instructions name={(query.cate ? query.cate : localStorage.getItem('builtin-cate')) as any} />
              </Tabs.TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
