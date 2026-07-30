import React, { useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import { Modal, Form, Input, Radio, Checkbox, Button, Tag, Alert, Select, Space, Tooltip, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { SearchOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useDebounce } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { getCateByValue, getCateDisplayLabel } from '@/components/AdvancedWrap/utils';
import EnhancedTable from '@/components/EnhancedTable';
import usePagination from '@/components/usePagination';
import { fetchGrafanaDatasources, importGrafanaDatasources, getServerClusters } from '../../services';

interface Props {
  visible: boolean;
  onClose: () => void;
  // 导入成功后触发父组件刷新数据源列表（与关闭解耦，避免依赖关闭瞬间的状态）。
  onImported?: () => void;
}

// datasource 是后端已构建好、原样回传即可导入的 models.Datasource（字段动态，透传不强类型）。
interface PreviewItem {
  key: number;
  grafana_type: string;
  grafana_name: string;
  supported: boolean;
  need_auth: boolean;
  duplicate: boolean;
  reason?: string;
  datasource: any | null;
}

interface ImportResult {
  name: string;
  status: 'imported' | 'pending_auth' | 'skipped' | 'failed';
  reason?: string;
}

const AUTH_TOKEN = 'token';
const AUTH_BASIC = 'basic';

export default function GrafanaImportModal(props: Props) {
  const { visible, onClose, onImported } = props;
  const { t, i18n } = useTranslation('datasourceManage');
  const [form] = Form.useForm();
  const [authType, setAuthType] = useState<string>(AUTH_TOKEN);
  const [fetching, setFetching] = useState(false);
  const [importing, setImporting] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [searchVal, setSearchVal] = useState<string>('');
  const debouncedSearchValue = useDebounce(searchVal, { wait: 300 });
  const [clusters, setClusters] = useState<string[]>([]);
  // 整批导入统一设置的「关联告警引擎集群」。undefined = 尚未初始化（打开弹窗时自动选中第一个集群），
  // 空串 = 用户主动清空，此时不往 settings 里写这个键。
  const [clusterName, setClusterName] = useState<string | undefined>(undefined);
  // 显式钉死每页 10 条：usePagination 的默认值在企业版（IS_ENT）下是 15，不指定两个版本会不一致。
  const pagination = usePagination({ pageSizeLocalstorageKey: 'grafana_import_pagesize', defaultPageSize: 10 });

  const loading = fetching || importing;
  // 导入已执行完（results 非 null，含"0 条成功"的情况）——此时底部只保留「完成」。
  const finished = results !== null && !importing;

  const reset = () => {
    form.resetFields();
    setAuthType(AUTH_TOKEN);
    setFetching(false);
    setImporting(false);
    setFetched(false);
    setItems([]);
    setSelectedKeys([]);
    setResults(null);
    setSearchVal('');
    setClusterName(undefined); // 置回未初始化，下次打开弹窗重新默认选中第一个集群
  };

  // 集群列表只在弹窗真正打开时拉，避免数据源页每次加载都多打一次接口。
  // 与单条数据源表单（components/itemsNG/Cluster.tsx）一致：新增场景自动填第一个集群。
  useEffect(() => {
    if (!visible) return;
    getServerClusters().then((res) => {
      const list: string[] = res || [];
      setClusters(list);
      setClusterName((prev) => (prev === undefined ? list[0] : prev));
    });
  }, [visible]);

  const handleClose = () => {
    if (loading) return; // 拉取/导入进行中不允许关闭，避免竞态与陈旧回填
    reset();
    onClose();
  };

  const handleFetch = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    setFetching(true);
    setFetched(false);
    setItems([]);
    setSelectedKeys([]);
    setResults(null);
    setSearchVal(''); // 换一批数据源就把上一批的搜索条件清掉，避免新结果被旧关键字过滤成空
    try {
      const res = await fetchGrafanaDatasources({
        url: values.url,
        auth_type: values.auth_type,
        token: values.token,
        username: values.username,
        password: values.password,
        skip_tls_verify: !!values.skip_tls_verify,
      });
      // 显式判定结构而非 `|| []` 兜底：ClustersFromAPIs 模式下后端返回裸数组（无 items 字段）
      // 表示「拒绝执行」，假值兜底会把它渲染成「没有数据源」，把用户引向排查 Token 权限。
      if (!Array.isArray(res?.items)) {
        message.error(t('import_grafana.fetch_failed'));
        return;
      }
      const list: PreviewItem[] = res.items.map((it: any, idx: number) => ({
        key: idx,
        grafana_type: it.grafana_type,
        grafana_name: it.grafana_name,
        supported: !!it.supported,
        need_auth: !!it.need_auth,
        duplicate: !!it.duplicate,
        reason: it.reason,
        datasource: it.datasource || null,
      }));
      setItems(list);
      setSelectedKeys(list.filter((it) => it.supported && !it.duplicate).map((it) => it.key));
      setFetched(true);
    } catch (err: any) {
      message.error(err?.message || t('import_grafana.fetch_failed'));
    } finally {
      setFetching(false);
    }
  };

  const handleImport = async () => {
    const selected = items.filter((it) => selectedKeys.includes(it.key) && it.datasource);
    if (selected.length === 0) return;

    setImporting(true);
    try {
      // 关联告警引擎写进 settings 的 {plugin_type}.cluster_name —— 这是单条表单的存储位置
      // （components/itemsNG/Cluster.tsx），后端 import handler 会据此派生 cluster_name 列。
      // 只写 settings 不写列：两条落库路径行为一致，之后用户打开编辑表单也能看到已选的集群。
      // 不做类型白名单，所有导入项统一写；用户清空则不写这个键。
      const payload = selected.map((it) => {
        const ds = _.cloneDeep(it.datasource);
        if (clusterName) {
          ds.settings = { ...(ds.settings || {}), [`${ds.plugin_type}.cluster_name`]: clusterName };
        }
        return ds;
      });
      const res = await importGrafanaDatasources(payload);
      // 同 handleFetch：没有 items 字段说明服务端没执行，不能当成「导入了 0 条」渲染成绿色成功。
      if (!Array.isArray(res?.items)) {
        message.error(t('import_grafana.import_failed'));
        return;
      }
      const resultItems: ImportResult[] = res.items;
      setResults(resultItems);
      // 导入成功即刻独立触发父列表刷新，不依赖关闭瞬间捕获的状态。
      if (resultItems.some((r) => r.status === 'imported' || r.status === 'pending_auth')) {
        onImported?.();
      }
    } catch (err: any) {
      message.error(err?.message || t('import_grafana.import_failed'));
    } finally {
      setImporting(false);
    }
  };

  // 表格上方的分类计数：三档互斥且覆盖全部条目——
  // importable=可勾选且默认已勾；duplicate=可勾但默认不勾（后端会 skip）；unsupported=勾选框禁用。
  const counts = useMemo(
    () => ({
      importable: items.filter((it) => it.supported && !it.duplicate).length,
      duplicate: items.filter((it) => it.supported && it.duplicate).length,
      unsupported: items.filter((it) => !it.supported).length,
    }),
    [items],
  );

  // 按名称搜索。只过滤展示，不动 selectedKeys —— 勾选是跨筛选保留的（导入按选中项而非可见项），
  // 靠上方「已选 N 个」把真实选中数一直摆在明面上，避免筛完只看见几行就误判导入范围。
  const filteredItems = useMemo(() => {
    const kw = _.trim(debouncedSearchValue).toLowerCase();
    if (!kw) return items;
    return items.filter((it) => _.toLower(it.grafana_name).includes(kw));
  }, [items, debouncedSearchValue]);

  // Grafana 类型的筛选项从拉取结果去重生成，与仓库既有列筛选（EnhancedTable/columns.tsx）同一套做法。
  const typeFilters = useMemo(
    () =>
      _.sortBy(_.uniq(items.map((it) => it.grafana_type).filter(Boolean))).map((v) => ({
        text: v,
        value: v,
      })),
    [items],
  );

  const columns: ColumnsType<PreviewItem> = [
    {
      title: t('import_grafana.col_grafana_type'),
      dataIndex: 'grafana_type',
      filters: typeFilters,
      filterMultiple: true,
      onFilter: (value, r) => r.grafana_type === value,
    },
    { title: t('import_grafana.col_grafana_name'), dataIndex: 'grafana_name' },
    {
      title: t('import_grafana.col_type'),
      render: (_val: unknown, r: PreviewItem) =>
        r.datasource ? getCateDisplayLabel(getCateByValue(r.datasource.plugin_type), i18n.language) || r.datasource.plugin_type : '-',
    },
    {
      title: t('import_grafana.col_supported'),
      filters: [
        { text: t('import_grafana.tag_supported'), value: true },
        { text: t('import_grafana.tag_unsupported'), value: false },
      ],
      filterMultiple: false,
      onFilter: (value, r) => r.supported === value,
      render: (_val: unknown, r: PreviewItem) =>
        r.supported ? <Tag color='green'>{t('import_grafana.tag_supported')}</Tag> : <Tag color='red'>{t('import_grafana.tag_unsupported')}</Tag>,
    },
    {
      title: t('import_grafana.col_duplicate'),
      filters: [{ text: t('import_grafana.tag_duplicate'), value: true }],
      filterMultiple: false,
      onFilter: (value, r) => r.duplicate === value,
      render: (_val: unknown, r: PreviewItem) => (r.duplicate ? <Tag color='orange'>{t('import_grafana.tag_duplicate')}</Tag> : '-'),
    },
    {
      title: t('import_grafana.col_need_auth'),
      filters: [{ text: t('import_grafana.tag_need_auth'), value: true }],
      filterMultiple: false,
      onFilter: (value, r) => r.need_auth === value,
      render: (_val: unknown, r: PreviewItem) => (r.need_auth ? <Tag color='gold'>{t('import_grafana.tag_need_auth')}</Tag> : '-'),
    },
  ];

  // 把后端返回的英文 reason 归一成可读文案，未知的原样展示。
  const reasonText = (reason?: string) => {
    if (!reason) return '';
    if (reason === 'unsupported type') return t('import_grafana.reason_unsupported');
    if (reason === 'name already exists') return t('import_grafana.reason_duplicate');
    if (reason === 'credential required') return t('import_grafana.reason_credential');
    return reason;
  };

  const renderResult = () => {
    if (!results) return null;
    // 预览中「不支持」的项前端不会提交(勾选框禁用)，这里按跳过计入并给出原因，保证汇总口径完整。
    const unsupported = items
      .filter((it) => !it.supported)
      .map((it): ImportResult => ({ name: it.grafana_name, status: 'skipped', reason: it.reason || 'unsupported type' }));
    const all = [...results, ...unsupported];
    const count = (s: ImportResult['status']) => all.filter((r) => r.status === s).length;
    const summary = `${t('import_grafana.result_imported')} ${count('imported')} / ${t('import_grafana.result_pending_auth')} ${count(
      'pending_auth',
    )} / ${t('import_grafana.result_skipped')} ${count('skipped')} / ${t('import_grafana.result_failed')} ${count('failed')}`;
    // pending_auth 也逐条列名：这些源已入库但停用，用户必须知道是哪几个才能去补密钥。
    // 关掉弹窗后列表页不再区分「导入待补密钥」与「手动停用」，所以结果区必须自足。
    const detailed = all.filter((r) => r.status === 'pending_auth' || r.status === 'skipped' || r.status === 'failed');
    return (
      <Alert
        style={{ marginTop: 12 }}
        showIcon
        type={count('failed') > 0 ? 'warning' : 'success'}
        message={`${t('import_grafana.import_done')}: ${summary}`}
        description={
          detailed.length > 0 ? (
            <div>
              {detailed.map((r) => {
                const reason = reasonText(r.reason);
                return (
                  <div key={`${r.status}-${r.name}`}>
                    {r.name}: {t(`import_grafana.result_${r.status}`)}
                    {reason ? ` — ${reason}` : ''}
                  </div>
                );
              })}
            </div>
          ) : undefined
        }
      />
    );
  };

  // maskClosable 放开：点遮罩即关闭。拉取/导入进行中仍不允许（与 keyboard/closable 一致，
  // 避免竞态与陈旧回填）；关闭本就会 reset 掉表单，「取消」按钮也是同样效果，点遮罩不会多丢什么。
  return (
    <Modal
      title={t('import_grafana.modal_title')}
      visible={visible}
      destroyOnClose
      width={960}
      maskClosable={!loading}
      keyboard={!loading}
      closable={!loading}
      onCancel={handleClose}
      footer={
        // 导入完成后只剩「关闭」这一个动作：再点「导入」只会把同一批重导一遍（后端全判重名跳过），
        // 而「取消」在已经落库之后语义是错的。所以收敛成单个「完成」按钮。
        finished
          ? [
              <Button key='done' type='primary' onClick={handleClose}>
                {t('import_grafana.done_btn')}
              </Button>,
            ]
          : [
              <Button key='close' disabled={loading} onClick={handleClose}>
                {t('common:btn.cancel')}
              </Button>,
              <Button key='import' type='primary' loading={importing} disabled={loading || selectedKeys.length === 0} onClick={handleImport}>
                {t('import_grafana.import_btn')}
              </Button>,
            ]
      }
    >
      <Form
        form={form}
        layout='vertical'
        initialValues={{ auth_type: AUTH_TOKEN }}
        onValuesChange={(changed) => {
          if (changed.auth_type) setAuthType(changed.auth_type);
        }}
      >
        <Form.Item label={t('import_grafana.url')} name='url' rules={[{ required: true }]}>
          <Input placeholder={t('import_grafana.url_placeholder')} />
        </Form.Item>
        <Form.Item label={t('import_grafana.auth_type')} name='auth_type'>
          <Radio.Group>
            <Radio value={AUTH_TOKEN}>{t('import_grafana.auth_type_token')}</Radio>
            <Radio value={AUTH_BASIC}>{t('import_grafana.auth_type_basic')}</Radio>
          </Radio.Group>
        </Form.Item>
        {authType === AUTH_BASIC ? (
          <>
            <Form.Item label={t('import_grafana.username')} name='username'>
              <Input autoComplete='off' />
            </Form.Item>
            <Form.Item label={t('import_grafana.password')} name='password'>
              <Input.Password autoComplete='new-password' />
            </Form.Item>
          </>
        ) : (
          <Form.Item label={t('import_grafana.token')} name='token'>
            <Input.Password placeholder={t('import_grafana.token_placeholder')} autoComplete='new-password' />
          </Form.Item>
        )}
        <Form.Item name='skip_tls_verify' valuePropName='checked'>
          <Checkbox>{t('import_grafana.skip_tls')}</Checkbox>
        </Form.Item>
        {/* disabled 用 loading(=fetching||importing)：导入进行中若还能点拉取，
            旧批次的导入响应会回填到新批次的 items 上，汇总出跨批次的错误统计。 */}
        <Button type='primary' loading={fetching} disabled={loading} onClick={handleFetch}>
          {t('import_grafana.fetch_btn')}
        </Button>
      </Form>

      {items.length > 0 && (
        <>
          {/* 总条数由分页的 showTotal（共 N 条）承担，这行只补分页给不出的信息：
              分类计数，以及跨页/跨筛选的真实已选数——筛选后只看见几行时，它是判断导入范围的唯一依据。 */}
          <div
            style={{
              marginTop: 16,
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <Space size={12} wrap>
              <Input
                prefix={<SearchOutlined />}
                placeholder={t('import_grafana.search_placeholder')}
                allowClear
                style={{ width: 220 }}
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
              />
              {/* 整批统一设置。多机房部署下导入的数据源要归属到对应机房的告警引擎集群；
                  只有一个集群时保持默认即可（沿用单条表单的 form.cluster_tip 文案）。 */}
              <Space size={4}>
                <span style={{ color: 'var(--fc-text-3)' }}>{t('form.cluster')}</span>
                <Tooltip title={t('form.cluster_tip')}>
                  <QuestionCircleOutlined style={{ color: 'var(--fc-text-3)' }} />
                </Tooltip>
                <Select
                  allowClear
                  style={{ width: 200 }}
                  placeholder={t('import_grafana.cluster_placeholder')}
                  value={clusterName}
                  onChange={(v) => setClusterName(v)}
                  options={_.map(_.concat(clusters, 'no_assigned_engine'), (item) => ({ label: item, value: item }))}
                />
              </Space>
            </Space>
            <span style={{ color: 'var(--fc-text-3)' }}>
              {t('import_grafana.summary', {
                importable: counts.importable,
                duplicate: counts.duplicate,
                unsupported: counts.unsupported,
              })}
              <span style={{ marginLeft: 12 }}>{t('import_grafana.summary_selected', { count: selectedKeys.length })}</span>
            </span>
          </div>
          <EnhancedTable
            size='small'
            rowKey='key'
            columns={columns}
            dataSource={filteredItems}
            pagination={pagination}
            rowSelection={{
              selectedRowKeys: selectedKeys,
              onChange: (keys) => setSelectedKeys(keys),
              getCheckboxProps: (r) => ({ disabled: !r.supported }),
            }}
          />
        </>
      )}
      {fetched && items.length === 0 && <div style={{ marginTop: 16, color: 'var(--fc-text-3)' }}>{t('import_grafana.empty')}</div>}
      {renderResult()}
    </Modal>
  );
}
