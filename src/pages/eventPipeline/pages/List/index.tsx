import React, { useState, useEffect, useContext, useMemo } from 'react';
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
import { Item, getList, getItem, putItem, deleteItems } from '../../services';
import { omitDerivedFields } from '../../utils/normalizeValues';
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
  // 选择态只存 id，行数据渲染时从最新的 data.list 现查：
  // 存 record 引用的话，行内启停或列表刷新后拿到的仍是勾选那一刻的旧对象，
  // 批量删除的「启用中不可删」校验会读到过期的 disabled 值而被绕过。
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  // 切换中的行：一次切换要先 GET 再 PUT，期间必须挡住重复点击，否则两次请求的落库顺序不保证
  const [togglingIds, setTogglingIds] = useState<number[]>([]);

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

  const selectedRows = useMemo(() => _.filter(data.list, (item) => _.includes(selectedRowKeys, item.id)), [data.list, selectedRowKeys]);

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

  // 行内切换启用/停用。后端 PUT 是全字段覆盖，而列表里的 record 是页面加载时的快照，
  // 期间别人可能已经改过这条工作流的 processors / 过滤条件——直接回传旧快照会静默回退对方的改动。
  // 所以先取一次最新详情，只在它之上改 disabled；再剔除后端派生的 nodes / connections。
  const toggleDisabled = (record: Item, checked: boolean) => {
    if (_.includes(togglingIds, record.id)) return;
    setTogglingIds((prev) => [...prev, record.id]);
    getItem(record.id)
      .then((latest) => putItem({ ...omitDerivedFields(latest), disabled: !checked }))
      .then(() => {
        message.success(t('common:success.modify'));
        // 重新拉列表而不是本地打补丁：详情接口不返回 update_by_nickname，
        // 拿它的返回值回填会把「更新人」列刷成空
        featchData();
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setTogglingIds((prev) => _.without(prev, record.id));
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
              setSelectedRowKeys([]);
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
              // Tags 对字符串元素会短路掉 getLabel/getKey，必须先翻译再传入
              const labels = _.map(types, (typ) => t(`processor.options.${typ}`));
              return <Tags type='outline' maxWidth={240} data={labels} />;
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
            render: (value, record: Item) => (
              <Switch size='small' checked={value === false} loading={_.includes(togglingIds, record.id)} onChange={(checked) => toggleDisabled(record, checked)} />
            ),
          },
        ]}
        dataSource={filteredData}
        loading={data.loading}
        pagination={pagination}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys: React.Key[]) => {
            setSelectedRowKeys(keys as number[]);
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
            onSaved={featchData}
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
            onSaved={featchData}
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
