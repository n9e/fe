import React, { useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Space, Table, Button, Modal, Tag, message, Switch } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { MenuOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { arrayMoveImmutable } from 'array-move';

import { getTeamInfoList } from '@/services/manage';
import PageLayout from '@/components/pageLayout';
import { eventBus, EVENT_KEYS } from '@/pages/embeddedProduct/eventBus';

import { NS, DETAIL_PATH } from '../../constants';
import { EmbeddedProductParams, EmbeddedProductResponse } from '../../types';
import {
  getEmbeddedProducts,
  addEmbeddedProducts,
  updateEmbeddedProducts,
  putEmbeddedProductsWeights,
  deleteEmbeddedProducts,
  putEmbeddedProductHide,
} from '../../services';
import EmbeddedProductModal from '../../components/EmbeddedProductModal';

import './style.less';

const DragHandle = SortableHandle((props: { disabled?: boolean }) => {
  return <Button type='text' size='small' icon={<MenuOutlined />} className='embedded-product-row-drag-handle' disabled={props.disabled} />;
});

const SortableBody = SortableContainer((props: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody {...props} />);
const SortableRow = SortableElement((props: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...props} />);

export default function Index() {
  const { t } = useTranslation(NS);
  const [data, setData] = useState<EmbeddedProductResponse[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<EmbeddedProductResponse | null>(null);
  const [userGroups, setUserGroups] = useState<{ id: number; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [hideSavingId, setHideSavingId] = useState<number | null>(null);

  const fetchData = async (): Promise<any> => {
    const res = await getEmbeddedProducts();
    if (res) setData(_.orderBy(res, ['weight', 'id'], ['asc', 'asc']));
  };

  const columns: ColumnType<EmbeddedProductResponse>[] = useMemo(() => {
    return [
      {
        title: '',
        dataIndex: '__sort',
        width: 40,
        className: 'embedded-product-sort-col',
        render: () => {
          return <DragHandle disabled={saving} />;
        },
      },
      {
        title: t('common:table.name'),
        dataIndex: 'name',
        render: (name, record) => {
          return <Link to={`${DETAIL_PATH}/${record.id}`}>{name}</Link>;
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
          return !val ? t('common:public') : t('common:private');
        },
      },
      {
        title: <span style={{ whiteSpace: 'nowrap' }}>{t('common:table.update_by')}</span>,
        dataIndex: 'update_by',
      },
      {
        title: t('common:table.update_at'),
        dataIndex: 'update_at',
        render: (text: string) => {
          return <div className='table-text'>{moment.unix(Number(text)).format('YYYY-MM-DD HH:mm:ss')}</div>;
        },
      },
      {
        title: t('show_in_menu'),
        dataIndex: 'hide',
        width: 140,
        render: (_val, record: EmbeddedProductResponse) => {
          const hide = record.hide ?? true;
          const checked = !hide;
          const disabled = saving || hideSavingId === record.id;
          return (
            <Switch
              size='small'
              checked={checked}
              disabled={disabled}
              onChange={async (nextChecked) => {
                if (disabled) return;
                const prevHide = record.hide ?? true;
                const nextHide = !nextChecked;
                setHideSavingId(record.id);
                setData((prev) => prev.map((item) => (item.id === record.id ? { ...item, hide: nextHide } : item)));
                try {
                  await putEmbeddedProductHide(String(record.id), { hide: nextHide });
                  message.success(t('common:success.save'));
                  fetchData();
                  eventBus.emit(EVENT_KEYS.EMBEDDED_PRODUCT_UPDATED);
                } catch (e) {
                  setData((prev) => prev.map((item) => (item.id === record.id ? { ...item, hide: prevHide } : item)));
                  message.error(t('common:error.save'));
                } finally {
                  setHideSavingId(null);
                }
              }}
            />
          );
        },
      },
      {
        title: t('common:table.operations'),
        dataIndex: 'operator',
        width: 120,
        render: (_val, record: EmbeddedProductResponse) => {
          return (
            <Space>
              <a
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentRecord(record);
                  setModalVisible(true);
                }}
              >
                {t('common:btn.edit')}
              </a>
              <a
                className='table-operator-area-warning'
                onClick={(e) => {
                  e.preventDefault();
                  Modal.confirm({
                    title: t('common:confirm.delete'),
                    onOk: () => {
                      return deleteEmbeddedProducts(String(record.id)).then(() => {
                        message.success(t('common:success.delete'));
                        fetchData();
                        eventBus.emit(EVENT_KEYS.EMBEDDED_PRODUCT_UPDATED);
                      });
                    },
                  });
                }}
              >
                {t('common:btn.delete')}
              </a>
            </Space>
          );
        },
      },
    ];
  }, [t, userGroups, saving, hideSavingId]);

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

  const DraggableBodyRow = (props: React.HTMLAttributes<HTMLTableRowElement>) => {
    const rowKey = (props as any)['data-row-key'] as number | string | undefined;
    const index = _.findIndex(data, (item) => String(item.id) === String(rowKey));
    if (index < 0) {
      return <tr {...props} />;
    }
    return <SortableRow index={index} {...props} />;
  };

  return (
    <PageLayout title={t('title')}>
      <div className='n9e'>
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

        <Table
          className='mt-2 embedded-product-sortable-table'
          size='small'
          rowKey='id'
          showSorterTooltip={false}
          pagination={false}
          dataSource={data}
          columns={columns}
          onRow={(record) => {
            return {
              onDoubleClick: () => {
                setCurrentRecord(record);
                setModalVisible(true);
              },
            };
          }}
          components={{
            body: {
              wrapper: (props: React.HTMLAttributes<HTMLTableSectionElement>) => {
                return (
                  <SortableBody
                    useDragHandle
                    helperClass='n9e-embedded-products-row-dragging'
                    hideSortableGhost
                    onSortEnd={async ({ oldIndex, newIndex }) => {
                      if (saving || oldIndex === newIndex) return;
                      const oldData = data;
                      const newData = arrayMoveImmutable(oldData, oldIndex, newIndex);
                      setData(newData);
                      setSaving(true);
                      try {
                        await putEmbeddedProductsWeights(
                          newData.map((item, idx) => ({
                            id: item.id,
                            weight: idx,
                          })),
                        );
                        message.success(t('common:success.save'));
                        fetchData();
                        eventBus.emit(EVENT_KEYS.EMBEDDED_PRODUCT_UPDATED);
                      } catch (e) {
                        setData(oldData);
                        message.error(t('common:error.save'));
                      } finally {
                        setSaving(false);
                      }
                    }}
                    {...props}
                  />
                );
              },
              row: DraggableBodyRow,
            },
          }}
        />
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
                weight: currentRecord.weight,
              }
            : undefined
        }
      />
    </PageLayout>
  );
}
