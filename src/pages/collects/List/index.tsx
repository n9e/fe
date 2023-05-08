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
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, Link } from 'react-router-dom';
import _ from 'lodash';
import moment from 'moment';
import { Table, Switch, Modal, Space, Button, Row, Col, message, Select } from 'antd';
import { ColumnType } from 'antd/lib/table';
import RefreshIcon from '@/components/RefreshIcon';
import SearchInput from '@/components/BaseSearchInput';
import usePagination from '@/components/usePagination';
import { getCollectCates, getCollects, putCollectStatus, deleteCollects } from '../services';
import { CollectCateType, CollectType, StatusType } from '../types';

interface ListProps {
  bgid?: number;
}

interface Filter {
  cate?: string;
  search?: string;
}

export default function List(props: ListProps) {
  const { bgid } = props;
  const { t } = useTranslation('collects');
  const history = useHistory();
  const pagination = usePagination({ PAGESIZE_KEY: 'collects-pagesize' });
  const [cates, setCates] = useState<CollectCateType[]>([]);
  const [filter, setFilter] = useState<Filter>({});
  const [data, setData] = useState<CollectType[]>([]);
  const [loading, setLoading] = useState(false);
  const columns: ColumnType<CollectType>[] = [
    {
      title: t('cate'),
      dataIndex: 'cate',
      render: (text) => {
        const cate = _.find(cates, { name: text });
        return (
          <Space>
            <img
              src={cate?.icon_url}
              alt={cate?.name}
              style={{
                width: 32,
                height: 32,
              }}
            />
            {text}
          </Space>
        );
      },
    },
    {
      title: t('name'),
      dataIndex: 'name',
      render: (text, record) => {
        return <Link to={`/collects/edit/${record.id}`}>{text}</Link>;
      },
    },
    {
      title: t('queries'),
      dataIndex: 'queries',
      render: (queries) => {
        return _.map(queries, (query, idx) => {
          return (
            <div key={idx} className='table-text'>
              {t(`query.key.${query.key}`)}
              {query.key !== 'all_hosts' && query.op}
              {query.key !== 'all_hosts' && _.join(query.values, ', ')}
            </div>
          );
        });
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
      title: t('common:table.update_by'),
      dataIndex: 'update_by',
    },
    {
      title: t('common:table.enabled'),
      dataIndex: 'disabled',
      render: (disabled, record) => (
        <Switch
          checked={disabled === StatusType.Enable}
          size='small'
          onChange={() => {
            const { id, disabled } = record;
            putCollectStatus(id, {
              id,
              disabled: !disabled ? 1 : 0,
            }).then(() => {
              fetchData();
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
                pathname: `/collects/edit/${record.id}?mode=clone`,
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
                    deleteCollects([record.id]).then(() => {
                      message.success(t('common:success.delete'));
                      fetchData();
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

  const filterData = () => {
    return data.filter((item) => {
      const { cate, search } = filter;
      const lowerCaseQuery = search?.toLowerCase() || '';
      return item.name.toLowerCase().indexOf(lowerCaseQuery) > -1 && ((cate && cate === item.cate) || !cate);
    });
  };
  const fetchData = async () => {
    if (!bgid) {
      return;
    }
    setLoading(true);
    getCollects(bgid)
      .then((dat) => {
        setData(dat || []);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getCollectCates().then((res) => {
      setCates(res);
    });
  }, []);

  useEffect(() => {
    if (bgid) {
      fetchData();
    }
  }, [bgid]);

  if (!bgid) return null;
  const filteredData = filterData();

  return (
    <div className='collects-list-container' style={{ height: '100%', overflowY: 'auto' }}>
      <Row justify='space-between'>
        <Col span={20}>
          <Space>
            <RefreshIcon
              onClick={() => {
                fetchData();
              }}
            />
            <Select
              allowClear
              placeholder={t('cate')}
              style={{ width: 120 }}
              maxTagCount='responsive'
              value={filter.cate}
              onChange={(val) => {
                setFilter({
                  ...filter,
                  cate: val,
                });
              }}
            >
              {_.map(cates, (cate) => {
                return (
                  <Select.Option key={cate.name} value={cate.name}>
                    {cate.name}
                  </Select.Option>
                );
              })}
            </Select>
            <SearchInput
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
                history.push(`/collects/add/${bgid}`);
              }}
              className='strategy-table-search-right-create'
            >
              {t('common:btn.add')}
            </Button>
          </Space>
        </Col>
      </Row>
      <Table size='small' rowKey='id' pagination={pagination} loading={loading} dataSource={filteredData} columns={columns} />
    </div>
  );
}
