import React from 'react';
import { Alert, Button, Checkbox, Form, Modal, Select, Space, Spin } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, MinusCircleFilled, ThunderboltOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import { CommonStateContext, basePrefix } from '@/App';
import { getComponents, getPayloads, Payload } from '@/pages/builtInComponents/services';
import { TypeEnum } from '@/pages/builtInComponents/types';
import { createDashboard } from '@/pages/builtInComponents/Dashboards/services';
import DatasourceValueSelectV2 from '@/pages/alertRules/Form/components/DatasourceValueSelect/V2';
import QuickCreateModal from '@/pages/notificationRules/components/RuleDropdownSelect/QuickCreateModal';
import { getItems as getNotifyRules, RuleItem } from '@/pages/notificationRules/services';
import { getDashboards } from '@/services/dashboardV2';
import { refreshOnboardingProgress, OnboardingDisplayKey } from '@/components/OnboardingProgress/useOnboardingProgress';

import { LINUX_COMPONENT_IDENT, NS, PACK_ALERT_CATE } from '../constants';
import { resolvePack, ResolvedPack } from './resolvePack';
import { buildAlertRuleImportBody, buildBoardImportBody } from './transform';
import { importAlertRules } from './services';

type ItemStatus = 'ok' | 'skipped' | 'failed';

interface ImportItemResult {
  name: string;
  status: ItemStatus;
  detail?: string;
  /** 导入成功的大盘 id，用于「查看主机大盘」深链 */
  boardId?: number;
}

interface Props {
  onCancel: () => void;
  /** 已完成导入后请求打开发送测试告警 */
  onRequestTestAlert?: () => void;
}

function StatusIcon({ status }: { status: ItemStatus }) {
  if (status === 'ok') return <CheckCircleFilled className='mt-0.5 text-success' />;
  if (status === 'skipped') return <MinusCircleFilled className='mt-0.5 text-soft' />;
  return <CloseCircleFilled className='mt-0.5 text-error' />;
}

/**
 * 主机监控基础包：把 integrations/Linux 的内置大盘与告警规则打包成一个动作。
 *
 * 存在的理由是新人不知道「集成中心」这个概念，也不知道该导哪个模板。这里不新造后端能力，
 * 复用集成中心已有的 payload 列表与导入接口。
 */
export default function HostMonitorPackModal({ onCancel, onRequestTestAlert }: Props) {
  const { t } = useTranslation(NS);
  const { busiGroups, curBusiId, businessGroup, groupedDatasourceList, reloadGroupedDatasourceList } = React.useContext(CommonStateContext);
  const [form] = Form.useForm();
  const prometheusList = groupedDatasourceList?.prometheus ?? [];

  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string>();
  const [resolved, setResolved] = React.useState<ResolvedPack>();
  const [boardIds, setBoardIds] = React.useState<number[]>([]);
  const [ruleIds, setRuleIds] = React.useState<number[]>([]);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [existingBoardNames, setExistingBoardNames] = React.useState<Record<string, number>>({});
  const [notifyRules, setNotifyRules] = React.useState<RuleItem[]>([]);
  const [quickCreateVisible, setQuickCreateVisible] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [results, setResults] = React.useState<{ boards: ImportItemResult[]; rules: ImportItemResult[]; notifyBound: boolean }>();

  const defaultBgid = businessGroup?.id ?? (curBusiId > 0 ? curBusiId : undefined) ?? busiGroups?.[0]?.id;
  const bgid = Form.useWatch('bgid', form) ?? defaultBgid;

  React.useEffect(() => {
    let cancelled = false;
    getComponents()
      .then((list) => {
        const component = _.find(list, { ident: LINUX_COMPONENT_IDENT });
        if (!component) {
          if (!cancelled) setLoadError(t('pack.component_missing'));
          return undefined;
        }
        return Promise.all([
          getPayloads<Payload[]>({ component_id: component.id, type: TypeEnum.dashboard }),
          getPayloads<Payload[]>({ component_id: component.id, type: TypeEnum.alert, cate: PACK_ALERT_CATE }),
        ]);
      })
      .then((payloads) => {
        if (cancelled || !payloads) return;
        const next = resolvePack(payloads[0] ?? [], payloads[1] ?? []);
        setResolved(next);
        setBoardIds(next.defaultBoardIds);
        setRuleIds(next.defaultRuleIds);
      })
      .catch(() => {
        if (!cancelled) setLoadError(t('pack.load_failed'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    getNotifyRules().then(
      (list) => {
        if (cancelled) return;
        setNotifyRules(list);
        // 只有一条通知规则时直接预选：绝大多数新人就这一条，少一次选择
        const enabled = _.filter(list, (item) => item.enable !== false);
        if (enabled.length === 1) {
          form.setFieldsValue({ notify_rule_ids: [enabled[0].id] });
        }
      },
      () => undefined,
    );

    return () => {
      cancelled = true;
    };
  }, []);

  // 预查目标业务组已有的大盘：后端没有 board upsert，重名会硬失败，所以重名的直接跳过
  React.useEffect(() => {
    if (!bgid) return;
    let cancelled = false;
    getDashboards(bgid).then(
      (list) => {
        if (!cancelled) setExistingBoardNames(_.fromPairs(_.map(list ?? [], (board: { name: string; id: number }) => [board.name, board.id])));
      },
      () => {
        if (!cancelled) setExistingBoardNames({});
      },
    );
    return () => {
      cancelled = true;
    };
  }, [bgid]);

  const selectedBoards = React.useMemo(() => _.filter(resolved?.boards, (item) => _.includes(boardIds, item.id)), [resolved, boardIds]);
  const selectedRules = React.useMemo(() => _.filter(resolved?.rules, (item) => _.includes(ruleIds, item.id)), [resolved, ruleIds]);
  const alreadyImported = !_.isEmpty(selectedBoards) && _.every(selectedBoards, (item) => existingBoardNames[item.name] !== undefined);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      setSubmitting(true);
      const targetBgid = values.bgid;
      const notifyRuleIds: number[] = values.notify_rule_ids ?? [];

      const boardTasks = _.map(selectedBoards, (payload) => {
        if (existingBoardNames[payload.name] !== undefined) {
          return Promise.resolve<ImportItemResult>({ name: payload.name, status: 'skipped', boardId: existingBoardNames[payload.name] });
        }
        let body: ReturnType<typeof buildBoardImportBody>;
        try {
          body = buildBoardImportBody(payload.content);
        } catch (e) {
          return Promise.resolve<ImportItemResult>({ name: payload.name, status: 'failed', detail: t('pack.bad_template') });
        }
        // createDashboard 内部已 silence 并把异常收成 { err }，单个失败不会中断整批
        return createDashboard(targetBgid, body).then((res) =>
          res?.err ? ({ name: payload.name, status: 'failed', detail: res.err } as ImportItemResult) : ({ name: payload.name, status: 'ok', boardId: res?.id } as ImportItemResult),
        );
      });

      const ruleBodies = _.compact(
        _.map(selectedRules, (payload) => {
          try {
            return { name: payload.name, body: buildAlertRuleImportBody(payload.content, { datasourceQueries: values.datasource_queries, notifyRuleIds }) };
          } catch (e) {
            return null;
          }
        }),
      );
      const ruleTask: Promise<ImportItemResult[]> = _.isEmpty(ruleBodies)
        ? Promise.resolve([])
        : importAlertRules(targetBgid, _.map(ruleBodies, 'body')).then(
            // 响应是 name → 错误信息，空字符串表示成功
            (res) => _.map(ruleBodies, (item) => ({ name: item.name, status: res?.[item.name] ? 'failed' : 'ok', detail: res?.[item.name] } as ImportItemResult)),
            (err) => _.map(ruleBodies, (item) => ({ name: item.name, status: 'failed', detail: err?.message || t('pack.unknown_error') } as ImportItemResult)),
          );

      Promise.all([Promise.all(boardTasks), ruleTask])
        .then(([boards, rules]) => {
          setResults({ boards, rules, notifyBound: !_.isEmpty(notifyRuleIds) });
          // 只把确实生效的步骤标记为完成；「已存在」也算生效，用户确实已经有这个大盘了
          const keys: OnboardingDisplayKey[] = [];
          if (_.some(boards, (item) => item.status !== 'failed')) keys.push('dashboard', 'hostDashboard');
          if (_.some(rules, { status: 'ok' })) keys.push('alert', 'hostAlert');
          if (!_.isEmpty(keys)) refreshOnboardingProgress(keys);
        })
        .finally(() => {
          setSubmitting(false);
        });
    });
  };

  const viewBoardId = React.useMemo(() => _.find(results?.boards, (item) => !!item.boardId)?.boardId, [results]);
  const allFailed = !!results && _.every([...results.boards, ...results.rules], { status: 'failed' });

  const renderPreviewList = (payloads: Payload[], checked: number[], onChange: (next: number[]) => void) => (
    <div className='mt-1 max-h-[168px] overflow-y-auto fc-border rounded p-2'>
      <Checkbox.Group value={checked} onChange={(next) => onChange(next as number[])} className='flex flex-col gap-1'>
        {_.map(payloads, (payload) => (
          <Checkbox key={payload.id} value={payload.id}>
            {payload.name}
            {existingBoardNames[payload.name] !== undefined && payload.type === TypeEnum.dashboard && <span className='ml-1 text-soft'>{t('pack.existing')}</span>}
          </Checkbox>
        ))}
      </Checkbox.Group>
    </div>
  );

  return (
    <Modal
      visible
      width={640}
      title={t('pack.title')}
      onCancel={onCancel}
      footer={
        results ? (
          <Space>
            <Button onClick={onCancel}>{t('close')}</Button>
            {viewBoardId && (
              // 新标签页打开，并且不关本弹窗：用户看完大盘切回来还能接着「发送测试告警」，不用重走一遍导入。
              // 带 href 的 Button 渲染成 <a>，能沿用 footer 里的按钮样式；路径要自己拼 basePrefix，
              // 这条不走 Router，拿不到 basename。
              <Button href={`${basePrefix}/dashboards/${viewBoardId}`} target='_blank' rel='noreferrer'>
                {t('pack.view_board')}
              </Button>
            )}
            {onRequestTestAlert && !allFailed && (
              <Button type='primary' onClick={onRequestTestAlert}>
                {t('pack.next_test')}
              </Button>
            )}
          </Space>
        ) : (
          <Space>
            <Button onClick={onCancel}>{t('common:btn.cancel')}</Button>
            <Button type='primary' loading={submitting} disabled={loading || !!loadError || (_.isEmpty(selectedBoards) && _.isEmpty(selectedRules))} onClick={handleSubmit}>
              {t('pack.submit')}
            </Button>
          </Space>
        )
      }
    >
      <Spin spinning={loading}>
        {loadError ? (
          <Alert
            type='error'
            showIcon
            message={loadError}
            description={
              <Link to='/components' target='_blank'>
                {t('pack.go_components')}
              </Link>
            }
          />
        ) : results ? (
          <div>
            {!_.isEmpty(results.boards) && (
              <>
                <div className='mb-1 font-bold'>{t('pack.boards')}</div>
                {_.map(results.boards, (item) => (
                  <div key={item.name} className='flex items-start gap-2 py-1'>
                    <StatusIcon status={item.status} />
                    <div className='min-w-0 flex-1'>
                      <div>{item.name}</div>
                      {item.status === 'skipped' && <div className='text-soft'>{t('pack.existing_skipped')}</div>}
                      {item.status === 'failed' && <div className='break-all text-error'>{item.detail}</div>}
                    </div>
                  </div>
                ))}
              </>
            )}
            {!_.isEmpty(results.rules) && (
              <>
                <div className='mb-1 mt-3 font-bold'>{t('pack.rules')}</div>
                {_.map(results.rules, (item) => (
                  <div key={item.name} className='flex items-start gap-2 py-1'>
                    <StatusIcon status={item.status} />
                    <div className='min-w-0 flex-1'>
                      <div>{item.name}</div>
                      {item.status === 'failed' && <div className='break-all text-error'>{item.detail}</div>}
                    </div>
                  </div>
                ))}
              </>
            )}
            {!results.notifyBound && _.some(results.rules, { status: 'ok' }) && (
              <Alert
                className='mt-3'
                type='warning'
                showIcon
                message={t('pack.no_notify_warning')}
                description={
                  <Link to='/alert-rules' target='_blank'>
                    {t('pack.go_bind_notify')}
                  </Link>
                }
              />
            )}
          </div>
        ) : (
          <Form form={form} layout='vertical' initialValues={{ bgid: defaultBgid }}>
            <div className='mb-2'>{t('pack.intro')}</div>
            <div className='mb-3 fc-border rounded p-3'>
              <div className='flex items-center justify-between'>
                <span>{t('pack.boards_count', { count: selectedBoards.length })}</span>
                <a onClick={() => setPreviewOpen(!previewOpen)}>{previewOpen ? t('common:btn.collapse') : t('pack.preview')}</a>
              </div>
              {/* 名字由后端按语言翻译过，直接展示实际选中的，不写死在文案里 */}
              {!previewOpen && !_.isEmpty(selectedBoards) && <div className='text-soft'>{_.join(_.map(selectedBoards, 'name'), '、')}</div>}
              {previewOpen && renderPreviewList(resolved?.boards ?? [], boardIds, setBoardIds)}
              <div className='mt-2'>{t('pack.rules_count', { count: selectedRules.length })}</div>
              {previewOpen && renderPreviewList(resolved?.rules ?? [], ruleIds, setRuleIds)}
              {resolved?.boardsIncomplete && <div className='mt-2 text-warning'>{t('pack.boards_incomplete')}</div>}
              {alreadyImported && <div className='mt-2 text-soft'>{t('pack.already_imported')}</div>}
            </div>

            <Form.Item label={t('common:business_group')} name='bgid' rules={[{ required: true }]}>
              <Select
                showSearch
                optionFilterProp='label'
                options={_.map(busiGroups, (item) => ({ value: item.id, label: item.name }))}
                onChange={() => setResults(undefined)}
              />
            </Form.Item>

            {/* prometheus 数据源为空时整块隐藏：该控件的 values 是必填，留着会把提交堵死；
                此时 datasource_queries 为空，后端会自动填成「全部数据源」 */}
            {!_.isEmpty(prometheusList) && (
              <DatasourceValueSelectV2 datasourceList={prometheusList} reloadGroupedDatasourceList={reloadGroupedDatasourceList} datasourceCate='prometheus' />
            )}

            <Form.Item
              label={
                <Space size={4}>
                  {t('pack.notify_rules')}
                  <a onClick={() => setQuickCreateVisible(true)}>
                    <ThunderboltOutlined className='mr-1' />
                    {t('pack.quick_create')}
                  </a>
                </Space>
              }
              name='notify_rule_ids'
              extra={t('pack.notify_rules_tip')}
            >
              <Select
                mode='multiple'
                allowClear
                placeholder={t('pack.notify_rules_placeholder')}
                options={_.map(notifyRules, (item) => ({ value: item.id, label: item.enable === false ? `${item.name}（${t('common:disabled')}）` : item.name }))}
              />
            </Form.Item>
          </Form>
        )}
      </Spin>

      {/* 自己挂 QuickCreateModal 而不是走 Provider：走 Provider 会把本弹窗顶掉，用户填的业务组/数据源就丢了 */}
      <QuickCreateModal
        visible={quickCreateVisible}
        onCancel={() => setQuickCreateVisible(false)}
        onSuccess={(ruleId) => {
          refreshOnboardingProgress(['notification']);
          getNotifyRules().then(setNotifyRules, () => undefined);
          form.setFieldsValue({ notify_rule_ids: _.union(form.getFieldValue('notify_rule_ids') ?? [], [ruleId]) });
        }}
      />
    </Modal>
  );
}
