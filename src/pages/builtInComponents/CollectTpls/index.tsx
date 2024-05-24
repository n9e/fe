import React, { useState, useRef, useContext, useEffect } from 'react';
import _ from 'lodash';
import { Table, Space, Button, Input, Select, Dropdown, Menu, Modal } from 'antd';
import { SearchOutlined, MoreOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useDebounceEffect } from 'ahooks';
import { CommonStateContext } from '@/App';
import usePagination from '@/components/usePagination';
import { getPayloads, deletePayloads, getCates } from '../services';
import { TypeEnum, Payload } from '../types';
import PayloadFormModal from '../components/PayloadFormModal';

interface Props {
  component: string;
}

export default function index(props: Props) {
  const { component } = props;
  const { t } = useTranslation();
  const { darkMode } = useContext(CommonStateContext);
  const [filter, setFilter] = useState<{
    cate?: string;
    query?: string;
  }>({ cate: undefined, query: undefined });
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<Payload[]>();
  const [cateList, setCateList] = useState<string[]>([]);
  const pagination = usePagination({ PAGESIZE_KEY: 'dashboard-builtin-pagesize' });
  const selectedRows = useRef<Payload[]>([]);
  const fetchData = () => {
    setLoading(true);
    getPayloads<Payload[]>({ component, type: TypeEnum.collect, cate: filter.cate, query: filter.query })
      .then((res) => {
        setData(res);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useDebounceEffect(
    () => {
      fetchData();
    },
    [component, filter.cate, filter.query],
    {
      wait: 500,
    },
  );

  useEffect(() => {
    getCates({
      component,
      type: TypeEnum.collect,
    }).then((res) => {
      setCateList(res);
      setFilter({
        ...filter,
        cate: _.head(res),
      });
    });
  }, []);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Select
            style={{ width: 200 }}
            value={filter.cate}
            loading={loading}
            placeholder={t('builtInComponents:cate')}
            onChange={(val) => {
              setFilter({ ...filter, cate: val });
            }}
          >
            {_.map(cateList, (item) => {
              return (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              );
            })}
          </Select>
          <Input
            prefix={<SearchOutlined />}
            value={filter.query}
            onChange={(e) => {
              setFilter({ ...filter, query: e.target.value });
            }}
            placeholder={t('common:search_placeholder')}
            style={{ width: 300 }}
            allowClear
          />
        </Space>
        <Space>
          <Button
            type='primary'
            onClick={() => {
              PayloadFormModal({
                darkMode,
                action: 'create',
                cateList,
                contentMode: 'yaml',
                initialValues: {
                  type: TypeEnum.collect,
                  component,
                },
                onOk: () => {
                  fetchData();
                },
              });
            }}
          >
            {t('common:btn.create')}
          </Button>
        </Space>
      </div>
      <Table
        className='mt8'
        size='small'
        rowKey='id'
        loading={loading}
        dataSource={data}
        rowSelection={{
          selectedRowKeys,
          onChange: (selectedRowKeys: string[], rows: Payload[]) => {
            setSelectedRowKeys(selectedRowKeys);
            selectedRows.current = rows;
          },
        }}
        columns={[
          {
            title: t('common:table.name'),
            dataIndex: 'name',
            key: 'name',
          },
          {
            title: t('common:table.operations'),
            width: 100,
            render: (record) => {
              return (
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item>
                        <a
                          onClick={() => {
                            PayloadFormModal({
                              darkMode,
                              action: 'edit',
                              cateList,
                              contentMode: 'yaml',
                              initialValues: record,
                              onOk: () => {
                                fetchData();
                              },
                            });
                          }}
                        >
                          {t('common:btn.edit')}
                        </a>
                      </Menu.Item>
                      <Menu.Item>
                        <Button
                          type='link'
                          danger
                          className='p0 height-auto'
                          onClick={() => {
                            Modal.confirm({
                              title: t('common:confirm.delete'),
                              onOk() {
                                deletePayloads([record.id]).then(() => {
                                  fetchData();
                                });
                              },
                            });
                          }}
                        >
                          {t('common:btn.delete')}
                        </Button>
                      </Menu.Item>
                    </Menu>
                  }
                >
                  <Button type='link' icon={<MoreOutlined />} />
                </Dropdown>
              );
            },
          },
        ]}
        pagination={pagination}
      />
    </>
  );
}
