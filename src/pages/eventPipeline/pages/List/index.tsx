import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { Space, Button, Input, Modal, Drawer, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import _ from 'lodash';

import usePagination from '@/components/usePagination';
import Tags from '@/components/TableTags/Tags';
import EnhancedTable, { getEnabledStatusColumn } from '@/components/EnhancedTable';
import { tagsColumn, updateByColumn, dateColumn } from '@/components/EnhancedTable/columns';
import EllipsisText from '@/components/EllipsisText';

import { NS } from '../../constants';
import { Item, getList, deleteItems } from '../../services';
import Add from '../Add';
import Edit from '../Edit';
import MoreOperations from './MoreOperations';

export default function List() {
  const { t } = useTranslation(NS);
  const history = useHistory();
  const [filter, setFilter] = useState<{
    search?: string;
    use_case?: string;
    trigger_mode?: string;
    disabled?: boolean;
  }>();
  const [data, setData] = useState<{
    list: Item[];
    loading: boolean;
  }>({
    list: [],
    loading: false,
  });
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);

  const pagination = usePagination({ PAGESIZE_KEY: 'event-pipelines-pagesize' });

  const featchData = () => {
    setData((prev) => ({ ...prev, loading: true }));
    getList()
      .then((res) => {
        setData({ list: res, loading: false });
      })
      .catch(() => {
        setData((prev) => ({ ...prev, loading: false }));
      });
  };

  const [eventPipelineDrawerState, setEventPipelineDrawerState] = useState<{
    visible: boolean;
    action: 'add' | 'edit' | 'clone';
    id?: number;
    data?: any;
  }>({
    visible: false,
    action: 'add',
  });

  const resetEventPipelineDrawerState = () => {
    setEventPipelineDrawerState({
      visible: false,
      action: 'add',
      id: undefined,
    });
  };

  useEffect(() => {
    featchData();
  }, []);

  const filteredData = _.filter(data.list, (item) => {
    let pass = true;
    if (filter?.search) {
      if (!_.includes(item.name, filter.search)) {
        pass = false;
      }
    }
    if (filter?.use_case) {
      if (item.use_case !== filter.use_case) {
        pass = false;
      }
    }
    if (filter?.trigger_mode) {
      if (item.trigger_mode !== filter.trigger_mode) {
        pass = false;
      }
    }
    if (filter?.disabled !== undefined) {
      if (item.disabled !== filter.disabled) {
        pass = false;
      }
    }
    return pass;
  });

  return (
    <>
      <div className='flex justify-between items-center pb-2'>
        <Space>
          <Input
            placeholder={t('common:search_placeholder')}
            style={{ width: 200 }}
            value={filter?.search}
            onChange={(e) => {
              setFilter({
                ...filter,
                search: e.target.value,
              });
            }}
            prefix={<SearchOutlined />}
          />
          <Select
            allowClear
            dropdownMatchSelectWidth={false}
            placeholder={t('use_case.label')}
            options={[
              {
                label: t('use_case.firemap'),
                value: 'firemap',
              },
              {
                label: t('use_case.event_pipeline'),
                value: 'event_pipeline',
              },
            ]}
            value={filter?.use_case}
            onChange={(value) => setFilter((prev) => ({ ...prev, use_case: value }))}
          />
          <Select
            allowClear
            dropdownMatchSelectWidth={false}
            placeholder={t('trigger_mode.label')}
            options={[
              {
                label: t('trigger_mode.event'),
                value: 'event',
              },
              {
                label: t('trigger_mode.api'),
                value: 'api',
              },
            ]}
            value={filter?.trigger_mode}
            onChange={(value) => setFilter((prev) => ({ ...prev, trigger_mode: value }))}
          />
          <Select
            allowClear
            placeholder={t('disabled.label')}
            options={[
              {
                label: t('disabled.false'),
                value: false,
              },
              {
                label: t('disabled.true'),
                value: true,
              },
            ]}
            value={filter?.disabled}
            onChange={(value) => setFilter((prev) => ({ ...prev, disabled: value }))}
          />
        </Space>
        <Space>
          <Button
            type='primary'
            onClick={() => {
              setEventPipelineDrawerState({
                visible: true,
                action: 'add',
              });
            }}
          >
            {t('common:btn.add')}
          </Button>
          <MoreOperations selectedRows={selectedRows} />
        </Space>
      </div>
      <EnhancedTable
        size='small'
        rowKey='id'
        scroll={{ x: 'max-content' }}
        columns={[
          {
            title: t('common:table.name'),
            dataIndex: 'name',
            render: (val, item: Item) => {
              return (
                <a
                  onClick={() => {
                    setEventPipelineDrawerState({
                      visible: true,
                      action: 'edit',
                      id: item.id,
                    });
                  }}
                >
                  {val}
                </a>
              );
            },
          },
          {
            title: t('common:table.note'),
            dataIndex: 'description',
            // 不用列 ellipsis：它会把 tableLayout 切成 fixed，页面变窄时无宽度列被无限压缩
            render: (val) => <EllipsisText style={{ width: '100%' }} text={val} />,
          },
          {
            title: t('use_case.label'),
            dataIndex: 'use_case',
            width: 100,
            render: (value) => {
              return <Tags type='outline' maxWidth={100} data={[t(`use_case.${value}`)]} />;
            },
          },
          {
            title: t('trigger_mode.label'),
            dataIndex: 'trigger_mode',
            width: 100,
            render: (value) => {
              return <Tags type='outline' maxWidth={100} data={[t(`trigger_mode.${value}`)]} />;
            },
          },
          {
            ...getEnabledStatusColumn({
              title: t('disabled.label'),
              dataIndex: 'disabled',
              enabledText: t('disabled.false'),
              disabledText: t('disabled.true'),
              enabledValue: false,
              disabledValue: true,
            }),
            key: 'disabled',
            width: 100,

            render: (value) => {
              return (
                <Tags
                  type='fill'
                  data={[t(`disabled.${value}`)]}
                  bgColor={() => (value === false ? 'var(--fc-green-3)' : 'var(--fc-red-3)')}
                  fontColor={() => (value === false ? 'var(--fc-green-11)' : 'var(--fc-red-11)')}
                />
              );
            },
          },
          tagsColumn({ title: t('teams'), dataIndex: 'team_names', maxWidth: 180 }),
          dateColumn({ title: t('common:table.update_at'), dataIndex: 'update_at', unix: true, sortable: true }),
          updateByColumn({ title: t('common:table.update_by'), dataIndex: 'update_by', nickname: 'update_by_nickname' }),
        ]}
        dataSource={filteredData}
        loading={data.loading}
        pagination={pagination}
        rowSelection={{
          selectedRowKeys: selectedRows.map((item) => item.id),
          onChange: (_selectedRowKeys: React.Key[], selectedRows: Item[]) => {
            setSelectedRows(selectedRows);
          },
        }}
        rowActions={(item: Item) => ({
          inline: [
            {
              key: 'executions',
              text: t('executions.title'),
              onClick: () => history.push(`/event-pipelines-executions?pipeline_id=${item.id}`),
            },
            {
              key: 'clone',
              icon: 'copy',
              text: t('common:btn.clone'),
              onClick: () => {
                setEventPipelineDrawerState({
                  visible: true,
                  action: 'clone',
                  data: _.omit(item, 'id'),
                });
              },
            },
            {
              key: 'edit',
              icon: 'edit',
              text: t('common:btn.edit'),
              onClick: () => {
                setEventPipelineDrawerState({
                  visible: true,
                  action: 'edit',
                  id: item.id,
                });
              },
            },
            {
              key: 'delete',
              icon: 'delete',
              text: t('common:btn.delete'),
              danger: true,
              disabled: item.disabled === false,
              tooltip: item.disabled === false ? t('common:delete_disable_first') : undefined,
              onClick: () => {
                Modal.confirm({
                  title: t('common:confirm.delete'),
                  onOk: () => {
                    deleteItems([item.id]).then(() => {
                      featchData();
                    });
                  },
                });
              },
            },
          ],
        })}
        actionColumn={{ title: t('common:table.operations'), width: 130 }}
      />
      <Drawer
        title={t(`${NS}:title_${eventPipelineDrawerState.action}`)}
        visible={eventPipelineDrawerState.visible}
        onClose={resetEventPipelineDrawerState}
        width='80%'
        destroyOnClose
      >
        {eventPipelineDrawerState.action === 'add' && (
          <Add
            onOk={() => {
              resetEventPipelineDrawerState();
              featchData();
            }}
            onCancel={() => {
              resetEventPipelineDrawerState();
            }}
          />
        )}
        {eventPipelineDrawerState.action === 'edit' && eventPipelineDrawerState?.id && (
          <Edit
            id={eventPipelineDrawerState.id}
            onOk={() => {
              resetEventPipelineDrawerState();
              featchData();
            }}
            onCancel={() => {
              resetEventPipelineDrawerState();
            }}
          />
        )}
        {eventPipelineDrawerState.action === 'clone' && eventPipelineDrawerState?.data && (
          <Add
            initialValues={eventPipelineDrawerState.data}
            onOk={() => {
              resetEventPipelineDrawerState();
              featchData();
            }}
            onCancel={() => {
              resetEventPipelineDrawerState();
            }}
          />
        )}
      </Drawer>
    </>
  );
}
