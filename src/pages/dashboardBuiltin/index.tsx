import React, { useState, useEffect, useMemo, useRef, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import _ from 'lodash';
import queryString from 'query-string';
import { Tabs, Space, Button, Drawer, Input, Table, Tag } from 'antd';
import { SafetyCertificateOutlined, SearchOutlined, CloseOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import usePagination from '@/components/usePagination';
import Export from '@/pages/dashboard/List/Export';
import { CommonStateContext } from '@/App';
import { getDashboardCates, getDashboardDetail, postBuiltinCateFavorite, deleteBuiltinCateFavorite } from './services';
import { BoardCateType, BoardType } from './types';
import Import from './Import';
import Detail from './Detail';
import Instructions from './Instructions';
import './locale';
import './style.less';

export { Detail };

export default function indexV2() {
  const { t } = useTranslation('dashboardBuiltin');
  const { busiGroups } = useContext(CommonStateContext);
  const { search } = useLocation();
  const query = queryString.parse(search);
  const [data, setData] = useState<BoardCateType[]>([]);
  const [active, setActive] = useState<BoardCateType>();
  const [cateSearch, setCateSearch] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [boardSearch, setBoardSearch] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const pagination = usePagination({ PAGESIZE_KEY: 'dashboard-builtin-pagesize' });
  const selectedRows = useRef<BoardType[]>([]);
  const datasource = active ? active.boards : [];
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
      if (cbk) {
        cbk(res);
      }
    });
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
                <Input
                  prefix={<SearchOutlined />}
                  value={boardSearch}
                  onChange={(e) => {
                    setBoardSearch(e.target.value);
                  }}
                  style={{ width: 300 }}
                  allowClear
                  placeholder={t('search_placeholder')}
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
                className='mt8'
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
                            target='_blank'
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
            <Instructions name={(query.cate ? query.cate : active?.name) as any} />
          </Tabs.TabPane>
        </Tabs>
      </Drawer>
    </PageLayout>
  );
}
