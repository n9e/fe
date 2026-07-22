import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { Space, Button, Input, Modal, Drawer, Select, Switch, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import usePagination from '@/components/usePagination';
import Tags from '@/components/TableTags/Tags';
import EnhancedTable, { getEnabledStatusColumn } from '@/components/EnhancedTable';
import { tagsColumn, updateByColumn, dateColumn } from '@/components/EnhancedTable/columns';
import EllipsisText from '@/components/EllipsisText';
import EmptyGuide from '@/components/EmptyGuide';
import DocumentDrawer from '@/components/DocumentDrawer';

import { NS, DOC_URL, FILTER_SESSION_STORAGE_KEY } from '../../constants';
import { Item, getList, putItem, deleteItems } from '../../services';
import ScenarioList from '../../components/ScenarioList';
import Add from '../Add';
import Edit from '../Edit';
import MoreOperations from './MoreOperations';

interface Filter {
  search?: string;
  disabled?: boolean;
}

const readFilter = (): Filter => {
  try {
    return JSON.parse(window.sessionStorage.getItem(FILTER_SESSION_STORAGE_KEY) || '{}');
  } catch (e) {
    return {};
  }
};

// 单条工作流的处理器类型列表，兼容后端 typ 与旧类型 type
const getProcessorTypes = (item: Item): string[] => _.compact(_.map(item.processors, (p: any) => p?.typ ?? p?.type));

export default function List() {
  const { t, i18n } = useTranslation(NS);
  const history = useHistory();
  const { darkMode } = useContext(CommonStateContext);
  const [filter, setFilter] = useState<Filter>(readFilter);
  const [data, setData] = useState<{
    list: Item[];
    loading: boolean;
  }>({
    list: [],
    loading: false,
  });
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);

  const pagination = usePagination({ PAGESIZE_KEY: 'event-pipelines-pagesize' });

  // 筛选条件写入 sessionStorage，刷新后不丢
  const updateFilter = (patch: Partial<Filter>) => {
    setFilter((prev) => {
      const next = { ...prev, ...patch };
      window.sessionStorage.setItem(FILTER_SESSION_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

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
    if (filter?.search) {
      const keyword = filter.search.toLowerCase();
      const haystack = _.compact([item.name, item.description, ...getProcessorTypes(item).map((typ) => t(`processor.options.${typ}`))])
        .join(' ')
        .toLowerCase();
      if (!_.includes(haystack, keyword)) return false;
    }
    if (filter?.disabled !== undefined && item.disabled !== filter.disabled) return false;
    return true;
  });

  // 行内切换启用/停用：item 是列表接口返回的完整对象，整体回传不会丢字段
  const toggleDisabled = (record: Item, checked: boolean) => {
    putItem({ ...record, disabled: !checked })
      .then(() => {
        message.success(t('common:success.modify'));
        setData((prev) => ({
          ...prev,
          list: _.map(prev.list, (item) => (item.id === record.id ? { ...item, disabled: !checked } : item)),
        }));
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const openDoc = () => {
    DocumentDrawer({
      language: i18n.language,
      darkMode,
      title: t('common:page_help'),
      type: 'iframe',
      documentPath: DOC_URL,
    });
  };

  return (
    <>
      <div className='flex justify-between items-center pb-2'>
        <Space wrap>
          <Input
            placeholder={t('search_placeholder')}
            style={{ width: 260 }}
            value={filter?.search}
            onChange={(e) => updateFilter({ search: e.target.value })}
            prefix={<SearchOutlined />}
            allowClear
          />
          <Select
            allowClear
            placeholder={t('disabled.label')}
            options={[
              { label: t('disabled.false'), value: false },
              { label: t('disabled.true'), value: true },
            ]}
            value={filter?.disabled}
            onChange={(value) => updateFilter({ disabled: value })}
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
          <MoreOperations
            selectedRows={selectedRows}
            onFinished={() => {
              setSelectedRows([]);
              featchData();
            }}
          />
        </Space>
      </div>
      <EnhancedTable
        size='small'
        rowKey='id'
        scroll={{ x: 'max-content' }}
        locale={
          !data.loading && data.list.length === 0
            ? {
                emptyText: (
                  <EmptyGuide
                    title={t('empty_guide.title')}
                    descriptionClassName='max-w-[620px]'
                    description={
                      <>
                        <div className='mb-1'>{t('scenario_tips.title')}</div>
                        <ScenarioList />
                        <div className='mt-2 text-warning'>{t('empty_guide.mount_hint')}</div>
                      </>
                    }
                    actions={
                      <>
                        <Button
                          type='primary'
                          onClick={() => {
                            setEventPipelineDrawerState({ visible: true, action: 'add' });
                          }}
                        >
                          {t('common:btn.add')}
                        </Button>
                        <a onClick={openDoc}>{t('empty_guide.doc')}</a>
                      </>
                    }
                  />
                ),
              }
            : undefined
        }
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
            title: t('processors_col'),
            dataIndex: 'processors',
            width: 260,
            render: (_val, item: Item) => {
              const types = getProcessorTypes(item);
              if (_.isEmpty(types)) return '-';
              return <Tags type='outline' maxWidth={240} data={types} getKey={(typ) => typ} getLabel={(typ) => t(`processor.options.${typ}`)} />;
            },
          },
          {
            title: t('common:table.note'),
            dataIndex: 'description',
            // 不用列 ellipsis：它会把 tableLayout 切成 fixed，页面变窄时无宽度列被无限压缩
            render: (val) => <EllipsisText style={{ width: '100%' }} text={val} />,
          },
          tagsColumn({ title: t('teams'), dataIndex: 'team_names', maxWidth: 180 }),
          dateColumn({ title: t('common:table.update_at'), dataIndex: 'update_at', unix: true, sortable: true }),
          updateByColumn({ title: t('common:table.update_by'), dataIndex: 'update_by', nickname: 'update_by_nickname' }),
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
            width: 90,
            render: (value, record: Item) => <Switch size='small' checked={value === false} onChange={(checked) => toggleDisabled(record, checked)} />,
          },
        ]}
        dataSource={filteredData}
        loading={data.loading}
        pagination={pagination}
        rowSelection={{
          selectedRowKeys: selectedRows.map((item) => item.id),
          onChange: (_selectedRowKeys: React.Key[], rows: Item[]) => {
            setSelectedRows(rows);
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
                  data: {
                    ..._.omit(item, 'id'),
                    name: `${item.name}${t('clone_suffix')}`,
                  },
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
