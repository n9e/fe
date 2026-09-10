import { useMemoizedFn, useRequest } from 'ahooks';
import React, { useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import { Button, Modal, message, Switch } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { HolderOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { arrayMoveImmutable } from 'array-move';

import useRowMutation from '@/components/EnhancedTable/useRowMutation';
import { getTeamInfoList } from '@/services/manage';
import PageLayout from '@/components/pageLayout';
import EnhancedTable from '@/components/EnhancedTable';
import usePagination from '@/components/usePagination';
import { dateColumn, updateByColumn } from '@/components/EnhancedTable/columns';
import Tags from '@/components/TableTags/Tags';
import { eventBus, EVENT_KEYS } from '@/pages/embeddedProduct/eventBus';

import { NS, DETAIL_PATH } from '../../constants';
import { EmbeddedProductParams, EmbeddedProductResponse } from '../../types';
import { getEmbeddedProducts, addEmbeddedProducts, updateEmbeddedProducts, putEmbeddedProductsWeights, deleteEmbeddedProducts, putEmbeddedProductHide } from '../../services';
import EmbeddedProductModal from '../../components/EmbeddedProductModal';

import './style.less';

const DragHandle = SortableHandle<{ disabled?: boolean }>((props) => {
  return <Button type='text' size='small' icon={<HolderOutlined />} className='embedded-product-row-drag-handle' disabled={props.disabled} />;
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
  const { run: runMutation, pendingIds } = useRowMutation();
  const pagination = usePagination({ PAGESIZE_KEY: NS });

  const {
    run: fetchData,
    cancel,
    loading,
  } = useRequest(getEmbeddedProducts, {
    manual: true,
    onSuccess: (res) => {
      if (res) setData(_.orderBy(res, ['weight', 'id'], ['asc', 'asc']));
    },
  });
  const updateHide = useMemoizedFn((id: number, hide: boolean) => {
    cancel();
    setData((rows) => rows.map((row) => (row.id === id ? { ...row, hide } : row)));
    if (loading) fetchData();
  });

  const columns: ColumnType<EmbeddedProductResponse>[] = useMemo(() => {
    return [
      {
        title: '',
        dataIndex: '__sort',
        width: 40,
        className: 'embedded-product-sort-col',
        render: () => {
          return <DragHandle disabled={saving || pendingIds.size > 0} />;
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
          return <Tags<number> data={val} maxWidth={320} getKey={(item) => item} getLabel={(item) => _.find(userGroups, { id: item })?.name || String(item)} />;
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
        title: t('show_in_menu'),
        dataIndex: 'hide',
        width: 140,
        render: (_val, record: EmbeddedProductResponse) => {
          const hide = record.hide ?? true;
          const checked = !hide;
          const disabled = saving || pendingIds.has(record.id);
          return (
            <Switch
              size='small'
              checked={checked}
              disabled={disabled}
              loading={pendingIds.has(record.id)}
              onChange={async (nextChecked) => {
                const nextHide = !nextChecked;
                try {
                  await runMutation([record.id], async () => {
                    await putEmbeddedProductHide(String(record.id), { hide: nextHide });
                    updateHide(record.id, nextHide);
                    message.success(t('common:success.save'));
                    eventBus.emit(EVENT_KEYS.EMBEDDED_PRODUCT_UPDATED);
                  });
                } catch (e) {
                  message.error(t('common:error.save'));
                }
              }}
            />
          );
        },
      },
      dateColumn({ title: t('common:table.update_at'), dataIndex: 'update_at', unix: true, sortable: true, defaultSortOrder: 'descend' }) as any,
      updateByColumn({ title: t('common:table.update_by'), dataIndex: 'update_by', nickname: 'update_by_nickname' }) as any,
    ];
  }, [t, userGroups, saving, pendingIds]);

  useEffect(() => {
    fetchData();
    getTeamInfoList().then((res) => {
      setUserGroups(res.dat ?? []);
    });
  }, []);

  const handleModalOk = async (values: EmbeddedProductParams) => {
    try {
      if (currentRecord) {
        await runMutation([currentRecord.id], () => updateEmbeddedProducts(currentRecord.id.toString(), values));
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
    <PageLayout title={t('title')} doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/integrations/embedded-products/'>
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

        <EnhancedTable
          className='mt-2 embedded-product-sortable-table'
          size='small'
          rowKey='id'
          showSorterTooltip={false}
          pagination={pagination}
          dataSource={data}
          columns={columns}
          rowActions={(record: EmbeddedProductResponse) => ({
            inline: [
              {
                key: 'edit',
                icon: 'edit',
                text: t('common:btn.edit'),
                onClick: () => {
                  setCurrentRecord(record);
                  setModalVisible(true);
                },
              },
              {
                key: 'delete',
                icon: 'delete',
                text: t('common:btn.delete'),
                danger: true,
                onClick: () => {
                  Modal.confirm({
                    title: t('common:confirm.delete'),
                    onOk: () => {
                      return runMutation([record.id], () =>
                        deleteEmbeddedProducts(String(record.id)).then(() => {
                          message.success(t('common:success.delete'));
                          fetchData();
                          eventBus.emit(EVENT_KEYS.EMBEDDED_PRODUCT_UPDATED);
                        }),
                      );
                    },
                  });
                },
              },
            ],
          })}
          // fixed:false：本表可拖拽排序，默认 fixed:'right' 的 sticky 单元格在拖拽克隆行里会脱离行浮起；本表无横向滚动，无需固定
          actionColumn={{ title: t('common:table.operations'), width: 80, fixed: false }}
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
                      if (saving || pendingIds.size > 0 || oldIndex === newIndex) return;
                      const oldData = data;
                      const newData = arrayMoveImmutable(oldData, oldIndex, newIndex);
                      setData(newData);
                      setSaving(true);
                      try {
                        await runMutation(
                          newData.map((item) => item.id),
                          () =>
                            putEmbeddedProductsWeights(
                              newData.map((item, idx) => ({
                                id: item.id,
                                weight: idx,
                              })),
                            ),
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
