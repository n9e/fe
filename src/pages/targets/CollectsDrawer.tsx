import React, { useEffect, useState } from 'react';
import { Drawer } from 'antd';
import { useTranslation } from 'react-i18next';
import { Table, Switch, Space, Row, Col, Select } from 'antd';
import { ColumnType } from 'antd/lib/table';
import _ from 'lodash';
import moment from 'moment';
import { Link } from 'react-router-dom';
import RefreshIcon from '@/components/RefreshIcon';
import SearchInput from '@/components/BaseSearchInput';
import usePagination from '@/components/usePagination';
import { getCollectsByIdent, getCollectCates, putCollectStatus } from 'plus:/pages/collects/services';
import { CollectType, CollectCateType, StatusType } from 'plus:/pages/collects/types';

interface IProps {
  ident: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

interface Filter {
  cate?: string;
  search?: string;
}

export default function CollectsDrawer(props: IProps) {
  const { t } = useTranslation('collects');
  const pagination = usePagination({ PAGESIZE_KEY: 'collects-pagesize' });
  const { ident, visible, setVisible } = props;
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
        return (
          <Link target='_blank' to={`/collects/edit/${record.id}`}>
            {text}
          </Link>
        );
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
  ];
  const filterData = () => {
    return data.filter((item) => {
      const { cate, search } = filter;
      const lowerCaseQuery = search?.toLowerCase() || '';
      return item.name.toLowerCase().indexOf(lowerCaseQuery) > -1 && ((cate && cate === item.cate) || !cate);
    });
  };
  const filteredData = filterData();

  const fetchData = async () => {
    setLoading(true);
    getCollectsByIdent(ident)
      .then((dat) => {
        setData(dat || []);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (ident && visible) {
      fetchData();
    }
  }, [ident, visible]);

  useEffect(() => {
    if (import.meta.env['VITE_IS_COLLECT']) {
      getCollectCates().then((res) => {
        setCates(res);
      });
    }
  }, []);

  return (
    <Drawer
      destroyOnClose
      title={t('title')}
      width={800}
      placement='right'
      onClose={() => {
        setVisible(false);
      }}
      visible={visible}
    >
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
      </Row>
      <Table style={{ marginTop: 16 }} size='small' rowKey='id' pagination={pagination} loading={loading} dataSource={filteredData} columns={columns} />
    </Drawer>
  );
}
