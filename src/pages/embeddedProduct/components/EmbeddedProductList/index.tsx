import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Space, Table, Button, Switch, Modal, Tag, message } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import usePagination from '@/components/usePagination';
import { getTeamInfoList } from '@/services/manage';
import PageLayout from '@/components/pageLayout';
import { eventBus, EVENT_KEYS } from '@/pages/embeddedProduct/eventBus';

import { EmbeddedProductParams, EmbeddedProductResponse } from '../../types';
import { deleteEmbeddedProducts, getEmbeddedProducts, addEmbeddedProducts, updateEmbeddedProducts } from '../../services';
import EmbeddedProductModal from '../EmbeddedProductModal';

export default function Index() {
  const { t } = useTranslation('embeddedProduct');
  const pagination = usePagination({ PAGESIZE_KEY: 'embedded-products-pagesize' });
  const [data, setData] = useState<EmbeddedProductResponse[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<EmbeddedProductResponse | null>(null);
  const [userGroups, setUserGroups] = useState<{ id: number; name: string }[]>([]);
  const columns: ColumnType<EmbeddedProductResponse>[] = [
    {
      title: t('common:table.name'),
      dataIndex: 'name',
      render: (name, record) => {
        return <Link to={`/embedded-product/${record.id}`}>{name}</Link>;
      },
    },
    {
      title: t('team_ids'),
      dataIndex: 'team_ids',
      render: (val) => {
        return _.map(val, (item) => {
          const name = _.find(userGroups, { id: item })?.name;
          return <Tag key={item}>{name || item}</Tag>;
        });
      },
    },
    {
      title: t('common:table.status'),
      dataIndex: 'is_private',
      render: (val) => {
        return val ? t('common:public') : t('common:private');
      },
    },
    {
      title: <span style={{ whiteSpace: 'nowrap' }}>{t('common:table.update_by')}</span>,
      dataIndex: 'update_by',
      sorter: true,
    },
    {
      title: t('common:table.update_at'),
      dataIndex: 'update_at',
      sorter: (a, b) => {
        return a.update_at - b.update_at;
      },
      render: (text: string) => {
        return <div className='table-text'>{moment.unix(Number(text)).format('YYYY-MM-DD HH:mm:ss')}</div>;
      },
    },
    {
      title: t('common:table.operations'),
      dataIndex: 'operator',

      render: (data, record: any) => {
        return (
          <Space>
            <a
              onClick={() => {
                setCurrentRecord(record);
                setModalVisible(true);
              }}
            >
              {t('common:btn.edit')}
            </a>
            <div
              onClick={() => {
                Modal.confirm({
                  title: t('common:confirm.delete'),
                  onOk: () => {
                    deleteEmbeddedProducts(record.id).then(() => {
                      message.success(t('common:success.delete'));
                      fetchData();
                      eventBus.emit(EVENT_KEYS.EMBEDDED_PRODUCT_UPDATED);
                    });
                  },
                  onCancel() {},
                });
              }}
              className='table-operator-area-warning'
              style={{ cursor: 'pointer' }}
            >
              {t('common:btn.delete')}
            </div>
          </Space>
        );
      },
    },
  ];

  const fetchData = async (): Promise<any> => {
    const res = await getEmbeddedProducts();
    if (res) setData(res);
  };

  useEffect(() => {
    fetchData();
    getTeamInfoList().then((res) => {
      setUserGroups(res.dat ?? []);
    });
  }, []);

  const handleModalOk = async (values: EmbeddedProductParams) => {
    try {
      if (currentRecord) {
        await updateEmbeddedProducts(currentRecord.id.toString(), values);
        message.success(t('common:success.edit'));
      } else {
        await addEmbeddedProducts([values]);
        message.success(t('common:success.create'));
      }
      setModalVisible(false);
      fetchData();
      eventBus.emit(EVENT_KEYS.EMBEDDED_PRODUCT_UPDATED);
    } catch (error) {
      message.error(currentRecord ? t('common:error.update') : t('common:error.create'));
    }
  };

  return (
    <PageLayout title={t('title')}>
      <div>
        <div className='n9e-border-base flex-1 p-[16px]'>
          <div className='flex justify-end items-center'>
            <Button
              type='primary'
              onClick={() => {
                setCurrentRecord(null);
                setModalVisible(true);
              }}
            >
              {t('common:btn.add')}
            </Button>
          </div>

          <Table className='mt8' size='small' rowKey='id' showSorterTooltip={false} pagination={pagination} dataSource={data} columns={columns} />
        </div>
      </div>
      <EmbeddedProductModal
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        initialValues={
          currentRecord
            ? {
                id: currentRecord.id,
                name: currentRecord.name,
                url: currentRecord.url,
                is_private: currentRecord.is_private,
                team_ids: currentRecord.team_ids,
              }
            : undefined
        }
      />
    </PageLayout>
  );
}
