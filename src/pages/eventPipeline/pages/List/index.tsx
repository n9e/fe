import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { Space, Button, Input, Modal, Drawer, Select, Switch, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Info } from 'lucide-react';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import usePagination from '@/components/usePagination';
import Tags from '@/components/TableTags/Tags';
import EnhancedTable, { getEnabledStatusColumn } from '@/components/EnhancedTable';
import { tagsColumn, updateByColumn, dateColumn } from '@/components/EnhancedTable/columns';
import EllipsisText from '@/components/EllipsisText';
import EmptyGuide from '@/components/EmptyGuide';
import DocumentDrawer from '@/components/DocumentDrawer';

import { NS, DOC_URL, FILTER_SESSION_STORAGE_KEY, MAX_NAME_LENGTH } from '../../constants';
import { Item, getList, putItemsDisabled, deleteItems } from '../../services';
import { normalizeInitialValues } from '../../utils/normalizeValues';
import { truncateName } from '../../components/buildWorkflowName';
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
    // 首次请求成功返回过才算「加载完成」：只有这时列表为空才是真的没有工作流，
    // 否则（尚未发起 / 请求失败）会把首帧和接口故障都误报成空状态引导
    loaded: boolean;
  }>({
    list: [],
    loading: true,
    loaded: false,
  });
  // 选择态只存 id，行数据渲染时从最新的 data.list 现查：
  // 存 record 引用的话，行内启停或列表刷新后拿到的仍是勾选那一刻的旧对象，
  // 批量删除的「启用中不可删」校验会读到过期的 disabled 值而被绕过。
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  // 切换中的行：请求返回前必须挡住重复点击，否则两次请求的落库顺序不保证
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
        setData({ list: res, loading: false, loaded: true });
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

  // 抽屉里的表单是否有未保存的改动。用 ref 而不是 state：它只在关闭那一刻被读一次，
  // 放进 state 会让每次输入都重渲染整个列表页
  const formDirtyRef = React.useRef(false);

  const resetEventPipelineDrawerState = () => {
    formDirtyRef.current = false;
    setEventPipelineDrawerState({
      visible: false,
      action: 'add',
      id: undefined,
    });
  };

  // 关闭抽屉：配置表单填一屏要好几分钟，误关的代价很大，所以改动过就先问一句
  const closeEventPipelineDrawer = () => {
    if (!formDirtyRef.current) {
      resetEventPipelineDrawerState();
      return;
    }
    Modal.confirm({
      title: t('unsaved_confirm'),
      okButtonProps: { danger: true },
      onOk: resetEventPipelineDrawerState,
    });
  };

  useEffect(() => {
    featchData();
  }, []);

  const filteredData = useMemo(
    () =>
      _.filter(data.list, (item) => {
        if (filter?.search) {
          const keyword = filter.search.toLowerCase();
          const haystack = _.compact([item.name, item.description, ...getProcessorTypes(item).map((typ) => t(`processor.options.${typ}`))])
            .join(' ')
            .toLowerCase();
          if (!_.includes(haystack, keyword)) return false;
        }
        if (filter?.disabled !== undefined && item.disabled !== filter.disabled) return false;
        return true;
      }),
    [data.list, filter?.search, filter?.disabled, i18n.language],
  );

  // 选中项只从当前筛选结果里取。antd 的 useSelection 仅在用户点勾选框时（setSelectedKeys 内部）
  // 才剔除不在 dataSource 里的 key，筛选条件变化本身不会裁剪受控的 selectedRowKeys；
  // 若从未筛选的 data.list 派生，批量删除会删掉页面上一个勾选都看不到的行。
  const selectedRows = useMemo(() => _.filter(filteredData, (item) => _.includes(selectedRowKeys, item.id)), [filteredData, selectedRowKeys]);

  // 行内切换启用/停用：走只写 disabled 的窄接口，不再「先 GET 详情再整条 PUT 回去」。
  // 整条回写会用页面加载时的旧快照覆盖别人并发改过的 processors / 过滤条件；
  // 先 GET 只是把窗口缩小，并没有根治，窄接口才是。
  const toggleDisabled = (record: Item, checked: boolean) => {
    if (_.includes(togglingIds, record.id)) return;
    setTogglingIds((prev) => [...prev, record.id]);
    putItemsDisabled([record.id], !checked)
      .then(() => {
        message.success(t('common:success.modify'));
        // 重新拉列表而不是本地打补丁：还要刷新「更新时间 / 更新人」两列
        featchData();
      })
      .catch(() => {})
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
            // 不能用 disabled.label：它就是「启用」，和下面的选项同字，空筛选看起来像已经筛成了启用
            placeholder={t('disabled.filter_placeholder')}
            style={{ width: 120 }}
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
          data.loaded && !data.loading && data.list.length === 0
            ? {
                emptyText: (
                  <EmptyGuide
                    title={t('empty_guide.title')}
                    descriptionClassName='max-w-[620px]'
                    description={
                      <>
                        <div className='mb-1'>{t('scenario_tips.title')}</div>
                        <ScenarioList />
                        <div className='mt-3 flex items-start gap-2 rounded-md bg-fc-100 px-3 py-2 text-left text-soft'>
                          <Info size={14} className='mt-[4px] shrink-0 text-primary' />
                          <span>{t('empty_guide.mount_hint')}</span>
                        </div>
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
          dateColumn({ title: t('common:table.update_at'), dataIndex: 'update_at', unix: true, sortable: true, defaultSortOrder: 'descend' }),
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
                    // 列表接口返回的是后端格式（header / custom_params 为对象），而表单 Form.List 需要数组，
                    // 必须与编辑页一样先过 normalizeInitialValues，否则克隆出来的 header 在表单里渲染为空、保存时被破坏
                    ...normalizeInitialValues(_.omit(item, 'id')),
                    // 原名称已接近上限时直接拼后缀会超出后端 varchar(128)，先给后缀留出位置
                    name: `${truncateName(item.name, MAX_NAME_LENGTH - Array.from(t('clone_suffix')).length)}${t('clone_suffix')}`,
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
        onClose={closeEventPipelineDrawer}
        width='80%'
        // 点一下遮罩就丢掉整张表单的代价太大，只保留 × 与「取消」两个明确入口
        maskClosable={false}
        destroyOnClose
      >
        {eventPipelineDrawerState.action === 'add' && (
          <Add
            onSaved={featchData}
            onDirtyChange={(dirty) => (formDirtyRef.current = dirty)}
            onOk={() => {
              resetEventPipelineDrawerState();
              featchData();
            }}
            onCancel={closeEventPipelineDrawer}
          />
        )}
        {eventPipelineDrawerState.action === 'edit' && eventPipelineDrawerState?.id && (
          <Edit
            id={eventPipelineDrawerState.id}
            onDirtyChange={(dirty) => (formDirtyRef.current = dirty)}
            onOk={() => {
              resetEventPipelineDrawerState();
              featchData();
            }}
            onCancel={closeEventPipelineDrawer}
          />
        )}
        {eventPipelineDrawerState.action === 'clone' && eventPipelineDrawerState?.data && (
          <Add
            initialValues={eventPipelineDrawerState.data}
            onSaved={featchData}
            onDirtyChange={(dirty) => (formDirtyRef.current = dirty)}
            onOk={() => {
              resetEventPipelineDrawerState();
              featchData();
            }}
            onCancel={closeEventPipelineDrawer}
          />
        )}
      </Drawer>
    </>
  );
}
