import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import { Alert, Button, Checkbox, Form, message, Modal, Select, Tabs, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { useIsAuthorized } from '@/components/AuthorizationWrapper';
import { PERM as notificationRulesPerm } from '@/pages/notificationRules/constants';
import { getPayloads } from '@/pages/builtInComponents/services';
import { TypeEnum } from '@/pages/builtInComponents/types';
import { formatBeautifyJsons } from '@/pages/builtInComponents/utils';
import { createDashboard } from '@/pages/builtInComponents/Dashboards/services';
import ImportForm from '@/pages/builtInComponents/AlertRules/ImportForm';

import { computeCoverage, extractAlertRuleMetrics, extractDashboardMetrics, hasAnyCoverage, isFullyCovered, MetricCoverage } from './metricCoverage';
import { TplMatchedComponent, parseVariant } from './services';

/**
 * 模板导入面板：两个 Tab 对应「导入仪表盘模板 / 导入告警规则模板」，通常默认全选；
 * 采集配置保存入口传入指标时，按覆盖率默认勾选推荐项。与集成中心手动导入的全部差别 = 数据源预绑定。
 *
 * 告警规则按分类下拉切换，一次只展示一组、也只导入这一组：
 * 后端 match 是「组内任一哨兵命中即整组返回」（router_template_match.go），
 * 而 categraf 与 telegraf 的指标名大量重合，多组同时返回并不代表两种采集器都在用。
 * 平铺全选会把同一条告警的两种采集器实现一起导进去，产生重复告警。
 *
 * 两个消费方，形态不同但内容一致：
 *   - 数据源保存后的引导（ImportModal）：套一层弹窗，因为那里先要在组件卡片里挑一个；
 *   - 采集配置保存后的到达验证抽屉：直接内联 —— 组件、业务组、数据源在那个语境里都已确定，
 *     没有可挑的，再叠一层弹窗只是多一次点击。
 */

export interface TemplateMatchExtraTab {
  key: string;
  label: React.ReactNode;
  children: React.ReactNode;
}

interface Props {
  datasourceId: number;
  entry: TplMatchedComponent;
  show: 'dashboards' | 'alerts' | 'both';
  /**
   * 额外 Tab。不传则只有仪表盘 / 告警两个 Tab，默认选中也不变。
   * 企业版用来放「观测闭环建设」；开源与夜莺不传。
   */
  extraTab?: TemplateMatchExtraTab;
  /**
   * 告警规则模板 Tab 内容区顶部的常驻说明。不参与导入按钮，不弹确认框。
   */
  alertsNotice?: React.ReactNode;
  /** 采集配置保存后的 SNMP 模板产出指标；不传时保持数据源引导的原有行为。 */
  providedMetrics?: string[];
  /** 没有可用覆盖率数据时是否默认全选；普通导入保持原行为。 */
  defaultSelectAll?: boolean;
  /** 采集模板指标无法读取或匹配时，显示覆盖率不可用说明。 */
  coverageUnavailable?: boolean;
  /**
   * 预填业务组。调用方知道该落哪个组时传（如采集配置所在的组）；
   * 不传则沿用「只有一个业务组就自动选中」的规则。用户仍可改。
   */
  defaultBgid?: number;
  /** 导入成功。旅程标记这类调用方专属的副作用放在这里做，面板本身不认识它们 */
  onImported?: (type: 'dashboard' | 'alert') => void;
  /**
   * 游离树里的调用方必须把这些传进来。
   *
   * ModalHOC 用 createRoot 把内容挂到 body 上，那棵树在 App 的 Provider 之外，
   * useContext(CommonStateContext) 恒为 `{}` —— 业务组会是空数组，选择器只能显示
   * 原始 id，还会误报「还没有业务组」。正常树里的调用方（数据源那边）不传，走 context。
   */
  ctx?: {
    busiGroups?: { id: number; name: string }[];
    groupedDatasourceList?: any;
    reloadGroupedDatasourceList?: () => void;
    datasourceCateOptions?: any[];
    notificationRulesAuthorized?: boolean;
  };
}

interface PayloadLike {
  uuid: number | string;
  content: string;
}

interface CoverageEntry<T> {
  item: T;
  coverage: MetricCoverage;
  index: number;
}

const EMPTY_DASHBOARDS: NonNullable<TplMatchedComponent['dashboards']> = [];
const EMPTY_ALERT_GROUPS: NonNullable<TplMatchedComponent['alert_groups']> = [];
const EMPTY_COVERAGE: MetricCoverage = { hit: 0, total: 0, covered: [], missing: [], ratio: 0 };
const EMPTY_COVERAGE_MAP: Map<string, MetricCoverage> = new Map();

const compareCoverage = <T,>(left: CoverageEntry<T>, right: CoverageEntry<T>) =>
  right.coverage.ratio - left.coverage.ratio || right.coverage.hit - left.coverage.hit || right.coverage.total - left.coverage.total || left.index - right.index;

export default function ImportPanel(props: Props) {
  const { t } = useTranslation('datasourceManage');
  const {
    datasourceId,
    entry,
    show,
    defaultBgid,
    onImported,
    ctx,
    extraTab,
    alertsNotice,
    providedMetrics,
    defaultSelectAll = true,
    coverageUnavailable: coverageUnavailableFromCaller = false,
  } = props;
  const provided = useContext(CommonStateContext);
  // 调用方给了就用它的，否则走 Provider —— 游离树里 Provider 是空的，见 ctx 的注释
  const busiGroups = ctx?.busiGroups ?? provided.busiGroups;
  const groupedDatasourceList = ctx?.groupedDatasourceList ?? provided.groupedDatasourceList;
  const reloadGroupedDatasourceList = ctx?.reloadGroupedDatasourceList ?? provided.reloadGroupedDatasourceList;
  const datasourceCateOptions = ctx?.datasourceCateOptions ?? provided.datasourceCateOptions;
  // 在这里算好传给告警导入弹窗：那个弹窗同样渲染在游离节点上，自己读不到 CommonStateContext。
  // hook 不能条件调用，所以先照常算，再让调用方的值优先
  const authorizedFromCtx = useIsAuthorized([notificationRulesPerm]);
  const notificationRulesAuthorized = ctx?.notificationRulesAuthorized ?? authorizedFromCtx;

  const dashboards = entry.dashboards || EMPTY_DASHBOARDS;
  const alertGroups = entry.alert_groups || EMPTY_ALERT_GROUPS;
  const hasProvidedMetrics = Array.isArray(providedMetrics) && providedMetrics.length > 0;
  const providedMetricsKey = hasProvidedMetrics ? providedMetrics.join('\u0000') : '';
  const selectAllByDefault = defaultSelectAll && !hasProvidedMetrics;
  const [dashChecked, setDashChecked] = useState<(number | string)[]>(() => (selectAllByDefault ? _.map(dashboards, 'uuid') : []));
  const dashUserEditedRef = useRef(false);
  const dashInitializedRef = useRef(false);
  const [dashboardPayloads, setDashboardPayloads] = useState<PayloadLike[]>();
  const [dashboardPayloadsStatus, setDashboardPayloadsStatus] = useState<'idle' | 'loading' | 'loaded' | 'failed'>('idle');
  // 已成功导入的仪表盘：面板保持打开，靠它防止同一份被点出多个副本
  const [dashImported, setDashImported] = useState<(number | string)[]>([]);
  // 调用方给了落点就用它；否则业务组只有一个时直接填上，用户不必为一个没得选的选项点一次
  const [bgid, setBgid] = useState<number | undefined>(() => defaultBgid ?? (busiGroups?.length === 1 ? busiGroups[0].id : undefined));
  const [activeCate, setActiveCate] = useState<string | undefined>(alertGroups[0]?.cate);
  const activeCateUserSelectedRef = useRef(false);
  const activeCateInitializedRef = useRef(false);
  const alertUserEditedCatesRef = useRef(new Set<string>());
  const alertInitializedCatesRef = useRef(new Set<string>());
  const [alertPayloadsByCate, setAlertPayloadsByCate] = useState<Record<string, PayloadLike[]>>({});
  const [alertCoverageLoaded, setAlertCoverageLoaded] = useState(false);
  const [alertPayloadsFailed, setAlertPayloadsFailed] = useState(false);
  const coverageUnavailable = coverageUnavailableFromCaller || (hasProvidedMetrics && (dashboardPayloadsStatus === 'failed' || alertPayloadsFailed));
  // 勾选态按分类分别保存，来回切分类不丢用户已经挑好的规则
  const [alertCheckedMap, setAlertCheckedMap] = useState<Record<string, (number | string)[]>>(() =>
    _.fromPairs(_.map(alertGroups, (group) => [group.cate, selectAllByDefault ? _.map(group.rules, 'uuid') : []])),
  );
  const [importing, setImporting] = useState(false);
  // 已导入的告警条数，累计——用户可能先导 categraf 那组，再切到 exporter 组接着导
  const [alertImportedCount, setAlertImportedCount] = useState(0);

  const defaultTab = extraTab ? extraTab.key : show === 'alerts' || (show === 'both' && _.isEmpty(dashboards)) ? 'alerts' : 'dashboards';
  // uuid 在 match 接口里是 number、在 payload 接口里可能是 string，一律按字符串比对，
  // 否则「已导入」置灰会因类型不同而失效
  const isDashImported = (uuid: number | string) => _.includes(_.map(dashImported, String), String(uuid));

  const activeGroup = _.find(alertGroups, { cate: activeCate });
  const activeRules = activeGroup?.rules || [];
  const activeChecked = (activeCate ? alertCheckedMap[activeCate] : undefined) || [];
  const setActiveChecked = (vals: (number | string)[]) => {
    if (!activeCate) return;
    alertUserEditedCatesRef.current.add(activeCate);
    setAlertCheckedMap((prev) => ({ ...prev, [activeCate]: vals }));
  };

  /** cate 形如 linux_by_categraf 时给出「categraf 采集」，解析不出就用原值（如 Common Alert Rules - Categraf） */
  const groupLabel = (cate: string) => {
    const variant = parseVariant(cate);
    return variant ? t('tpl_match.variant', { variant }) : cate;
  };

  // 有采集模板时先拉所有分类，才能比较每组可推荐规则数；普通数据源引导仍只拉当前分类。
  const [alertPayloads, setAlertPayloads] = useState<PayloadLike[]>([]);
  const [alertPayloadsLoading, setAlertPayloadsLoading] = useState(false);
  useEffect(() => {
    if (!hasProvidedMetrics) return undefined;
    let alive = true;
    setAlertPayloadsLoading(true);
    setAlertCoverageLoaded(false);
    setAlertPayloadsFailed(false);
    Promise.all(
      _.map(
        alertGroups,
        (group): Promise<readonly [string, PayloadLike[], boolean]> =>
          getPayloads<PayloadLike[]>({ component_id: entry.component_id, type: TypeEnum.alert, cate: group.cate })
            .then((payloads): readonly [string, PayloadLike[], boolean] => [group.cate, payloads || [], false])
            .catch((): readonly [string, PayloadLike[], boolean] => [group.cate, [], true]),
      ),
    )
      .then((results) => {
        if (!alive) return;
        setAlertPayloadsByCate(_.fromPairs(_.map(results, ([cate, payloads]) => [cate, payloads] as [string, PayloadLike[]])));
        setAlertPayloadsFailed(_.some(results, ([, , failed]) => failed));
      })
      .finally(() => {
        if (alive) {
          setAlertCoverageLoaded(true);
          setAlertPayloadsLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [entry.component_id, hasProvidedMetrics, providedMetricsKey, alertGroups]);

  useEffect(() => {
    if (hasProvidedMetrics || !activeCate) return undefined;
    let alive = true;
    setAlertPayloadsLoading(true);
    getPayloads<PayloadLike[]>({ component_id: entry.component_id, type: TypeEnum.alert, cate: activeCate })
      .then((res) => {
        if (alive) setAlertPayloads(res || []);
      })
      .catch(() => {
        if (alive) setAlertPayloads([]);
      })
      .finally(() => {
        if (alive) setAlertPayloadsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [entry.component_id, activeCate, hasProvidedMetrics]);

  useEffect(() => {
    if (!hasProvidedMetrics || _.isEmpty(dashboards)) return undefined;
    let alive = true;
    setDashboardPayloads(undefined);
    setDashboardPayloadsStatus('loading');
    getPayloads<PayloadLike[]>({ component_id: entry.component_id, type: TypeEnum.dashboard })
      .then((payloads) => {
        if (!alive) return;
        setDashboardPayloads(payloads || []);
        setDashboardPayloadsStatus('loaded');
      })
      .catch(() => {
        if (alive) setDashboardPayloadsStatus('failed');
      });
    return () => {
      alive = false;
    };
  }, [entry.component_id, hasProvidedMetrics, providedMetricsKey, dashboards]);

  const dashboardCoverageByUuid = useMemo(() => {
    const coverageByUuid = new Map<string, MetricCoverage>();
    if (!hasProvidedMetrics || !providedMetrics) return coverageByUuid;
    const payloadByUuid = new Map<string, PayloadLike>((dashboardPayloads || []).map((payload): [string, PayloadLike] => [String(payload.uuid), payload]));

    dashboards.forEach((dashboard) => {
      const payload = payloadByUuid.get(String(dashboard.uuid));
      coverageByUuid.set(String(dashboard.uuid), computeCoverage(providedMetrics, payload ? extractDashboardMetrics(payload.content) : []));
    });
    return coverageByUuid;
  }, [hasProvidedMetrics, providedMetrics, dashboardPayloads, dashboards]);

  const alertCoverageByCate = useMemo(() => {
    const result: Record<string, Map<string, MetricCoverage>> = {};
    if (!hasProvidedMetrics || !providedMetrics) return result;

    alertGroups.forEach((group) => {
      const payloadByUuid = new Map<string, PayloadLike>((alertPayloadsByCate[group.cate] || []).map((payload): [string, PayloadLike] => [String(payload.uuid), payload]));
      const coverageByUuid = new Map<string, MetricCoverage>();
      group.rules.forEach((rule) => {
        const payload = payloadByUuid.get(String(rule.uuid));
        coverageByUuid.set(String(rule.uuid), computeCoverage(providedMetrics, payload ? extractAlertRuleMetrics(payload.content) : []));
      });
      result[group.cate] = coverageByUuid;
    });
    return result;
  }, [hasProvidedMetrics, providedMetrics, alertPayloadsByCate, alertGroups]);

  const dashboardAnalysisResolved = dashboardPayloadsStatus === 'loaded' || dashboardPayloadsStatus === 'failed' || _.isEmpty(dashboards);
  const coverageAnalysisAvailable = hasProvidedMetrics && dashboardAnalysisResolved && dashboardPayloadsStatus !== 'failed' && alertCoverageLoaded && !alertPayloadsFailed;
  const recommendationMode =
    coverageAnalysisAvailable &&
    (Array.from(dashboardCoverageByUuid.values()).some(hasAnyCoverage) ||
      Object.values(alertCoverageByCate).some((coverageByUuid) => Array.from(coverageByUuid.values()).some(hasAnyCoverage)));
  const recommendedDashboards = useMemo(
    () =>
      dashboards.filter((dashboard) => {
        const coverage = dashboardCoverageByUuid.get(String(dashboard.uuid));
        return !!coverage && isFullyCovered(coverage);
      }),
    [dashboards, dashboardCoverageByUuid],
  );
  const displayedDashboards = useMemo(() => {
    if (!coverageAnalysisAvailable) return dashboards;
    const coveredDashboards = dashboards
      .map((item, index) => ({ item, index, coverage: dashboardCoverageByUuid.get(String(item.uuid)) || EMPTY_COVERAGE }))
      .filter(({ coverage }) => hasAnyCoverage(coverage));
    if (!recommendationMode) return coveredDashboards.map(({ item }) => item);
    return coveredDashboards.sort(compareCoverage).map(({ item }) => item);
  }, [coverageAnalysisAvailable, recommendationMode, dashboards, dashboardCoverageByUuid]);
  const selectableDashboards = _.reject(displayedDashboards, (dashboard) => isDashImported(dashboard.uuid));
  const coverageAnalysisPending = hasProvidedMetrics && (!dashboardAnalysisResolved || !alertCoverageLoaded);

  useEffect(() => {
    if (!coverageAnalysisAvailable || dashInitializedRef.current) return;
    if (dashUserEditedRef.current) {
      setDashChecked((prev) =>
        _.filter(prev, (uuid) => {
          const coverage = dashboardCoverageByUuid.get(String(uuid));
          return !!coverage && hasAnyCoverage(coverage);
        }),
      );
    } else {
      setDashChecked(_.map(recommendedDashboards, 'uuid'));
    }
    dashInitializedRef.current = true;
  }, [coverageAnalysisAvailable, dashboardCoverageByUuid, recommendedDashboards]);

  useEffect(() => {
    if (!hasProvidedMetrics || !dashboardAnalysisResolved || !alertCoverageLoaded || coverageAnalysisAvailable) return;

    if (!dashInitializedRef.current) {
      if (!dashUserEditedRef.current) setDashChecked(defaultSelectAll ? _.map(dashboards, 'uuid') : []);
      dashInitializedRef.current = true;
    }
    alertGroups.forEach((group) => {
      if (alertInitializedCatesRef.current.has(group.cate)) return;
      if (!alertUserEditedCatesRef.current.has(group.cate)) setAlertCheckedMap((prev) => ({ ...prev, [group.cate]: defaultSelectAll ? _.map(group.rules, 'uuid') : [] }));
      alertInitializedCatesRef.current.add(group.cate);
    });
  }, [hasProvidedMetrics, dashboardAnalysisResolved, alertCoverageLoaded, coverageAnalysisAvailable, dashboards, alertGroups, defaultSelectAll]);

  useEffect(() => {
    if (!coverageAnalysisAvailable) return;

    alertGroups.forEach((group) => {
      if (alertInitializedCatesRef.current.has(group.cate)) return;
      const coverageByUuid = alertCoverageByCate[group.cate] || EMPTY_COVERAGE_MAP;
      if (alertUserEditedCatesRef.current.has(group.cate)) {
        setAlertCheckedMap((prev) => ({
          ...prev,
          [group.cate]: _.filter(prev[group.cate] || [], (uuid) => {
            const coverage = coverageByUuid.get(String(uuid));
            return !!coverage && hasAnyCoverage(coverage);
          }),
        }));
      } else {
        const recommended = group.rules.filter((rule) => {
          const coverage = coverageByUuid.get(String(rule.uuid));
          return !!coverage && isFullyCovered(coverage);
        });
        setAlertCheckedMap((prev) => ({ ...prev, [group.cate]: _.map(recommended, 'uuid') }));
      }
      alertInitializedCatesRef.current.add(group.cate);
    });
  }, [coverageAnalysisAvailable, alertGroups, alertCoverageByCate]);

  useEffect(() => {
    if (!coverageAnalysisAvailable || activeCateInitializedRef.current || activeCateUserSelectedRef.current) return;
    const bestGroup = _.maxBy(alertGroups, (group) => {
      const coverageByUuid = alertCoverageByCate[group.cate] || EMPTY_COVERAGE_MAP;
      return group.rules.filter((rule) => {
        const coverage = coverageByUuid.get(String(rule.uuid));
        return !!coverage && isFullyCovered(coverage);
      }).length;
    });
    if (bestGroup) setActiveCate(bestGroup.cate);
    activeCateInitializedRef.current = true;
  }, [coverageAnalysisAvailable, alertGroups, alertCoverageByCate]);

  const activeAlertPayloads = hasProvidedMetrics ? alertPayloadsByCate[activeCate || ''] || [] : alertPayloads;
  const displayedRulesByCate = useMemo(() => {
    const result: Record<string, NonNullable<TplMatchedComponent['alert_groups']>[number]['rules']> = {};
    alertGroups.forEach((group) => {
      const coverageByUuid = alertCoverageByCate[group.cate] || EMPTY_COVERAGE_MAP;
      result[group.cate] = coverageAnalysisAvailable
        ? group.rules.filter((rule) => {
            const coverage = coverageByUuid.get(String(rule.uuid));
            return !!coverage && hasAnyCoverage(coverage);
          })
        : group.rules;
    });
    return result;
  }, [alertGroups, alertCoverageByCate, coverageAnalysisAvailable]);
  const visibleAlertCount = _.sumBy(alertGroups, (group) => displayedRulesByCate[group.cate]?.length || 0);
  const displayedActiveRules = useMemo(() => {
    if (!activeCate) return activeRules;
    const coveredRules = displayedRulesByCate[activeCate] || activeRules;
    if (!recommendationMode) return coveredRules;
    const coverageByUuid = alertCoverageByCate[activeCate] || EMPTY_COVERAGE_MAP;
    return coveredRules
      .map((item, index) => ({ item, index, coverage: coverageByUuid.get(String(item.uuid)) || EMPTY_COVERAGE }))
      .sort(compareCoverage)
      .map(({ item }) => item);
  }, [recommendationMode, activeCate, activeRules, displayedRulesByCate, alertCoverageByCate]);

  const renderCoverage = (coverage: MetricCoverage) => (
    <Tooltip
      placement='right'
      overlayClassName='ant-tooltip-max-width-600 ant-tooltip-max-height-600'
      title={
        <div className='space-y-2 break-words'>
          {!_.isEmpty(coverage.covered) && (
            <div>
              <div>{t('tpl_match.coverage_covered')}</div>
              {coverage.covered.map((metric) => (
                <div key={metric}>{metric}</div>
              ))}
            </div>
          )}
          {!_.isEmpty(coverage.missing) && (
            <div>
              <div>{t('tpl_match.coverage_missing')}</div>
              {coverage.missing.map((metric) => (
                <div key={metric}>{metric}</div>
              ))}
            </div>
          )}
        </div>
      }
    >
      <span className='shrink-0 text-xs text-[var(--fc-text-4)]'>{t('tpl_match.coverage', { hit: coverage.hit, total: coverage.total })}</span>
    </Tooltip>
  );

  const recommendationHintNode = recommendationMode ? (
    <span className='inline-flex items-center gap-1 text-soft text-xs'>
      <InfoCircleOutlined />
      <span>{t('tpl_match.recommended_tip')}</span>
    </span>
  ) : undefined;

  // 勾选变化时只在本地过滤，不再发请求
  const alertData = useMemo(
    () =>
      formatBeautifyJsons(
        _.map(
          _.filter(activeAlertPayloads, (p) => _.includes(_.map(activeChecked, String), String(p.uuid))),
          'content',
        ),
      ),
    [activeAlertPayloads, activeChecked],
  );
  const boundDatasourceQueries = useMemo(() => [{ match_type: 0, op: 'in', values: [datasourceId] }], [datasourceId]);
  // 底部那行提示显示名字而不是主键：用户认得的是「VictoriaMetrics」，不是「ID: 1」。
  // 数据源列表里找不到（被删了、或调用方没给列表）才退回显示 id
  const boundDatasourceName = useMemo(
    () => _.get(_.find(groupedDatasourceList?.prometheus, { id: datasourceId }), 'name') || String(datasourceId),
    [groupedDatasourceList, datasourceId],
  );
  const datasourceBound = <div className='mt-3 text-xs text-soft'>{t('tpl_match.datasource_bound', { name: boundDatasourceName })}</div>;

  /**
   * 仪表盘就地导入：模板内容是用户勾出来的，再弹一个 JSON 文本框让人确认没有意义，
   * 缺的只是「放到哪个业务组」。直接调 createDashboard，不经原来的第二个弹窗。
   */
  const importDashboards = () => {
    if (!bgid) return;
    setImporting(true);
    (dashboardPayloads !== undefined ? Promise.resolve(dashboardPayloads) : getPayloads<PayloadLike[]>({ component_id: entry.component_id, type: TypeEnum.dashboard }))
      .then((payloads) => {
        const selected = _.filter(payloads, (p) => _.includes(_.map(dashChecked, String), String(p.uuid)));
        if (_.isEmpty(selected)) return undefined;
        // 逐份记账而非全有全无：createDashboard 把单份失败 catch 成 { err }，成功的那几份此刻已经真实落库。
        // 出错就整体早返回的话，成功项既不置灰、勾选也不清空，而后端 Board.Add 有 name+group_id 唯一校验，
        // 用户重试时它们必然回 "Name duplicate"，真正失败的那几份就永远导不进来了。
        return Promise.all(
          _.map(selected, (p) => {
            const board = JSON.parse(p.content);
            return createDashboard(bgid, { ...board, configs: JSON.stringify(board.configs) }).then((r) => ({ payload: p, err: _.get(r, 'err') as string | undefined }));
          }),
        ).then((results) => {
          const succeeded = _.filter(results, (r) => !r.err);
          const failed = _.filter(results, (r) => !!r.err);

          if (!_.isEmpty(succeeded)) {
            // 面板不关，用户可以接着导告警；已导入的置灰以免重复点出多份副本
            const succeededUuids = _.map(succeeded, (r) => r.payload.uuid);
            setDashImported((prev) => _.union(prev, succeededUuids));
            setDashChecked((prev) => _.reject(prev, (uuid) => _.includes(_.map(succeededUuids, String), String(uuid))));
            onImported?.('dashboard');
          }

          if (!_.isEmpty(failed)) {
            // 带上仪表盘名，用户才知道该重试哪几份
            Modal.error({
              title: t('tpl_match.import_failed'),
              content: (
                <div>
                  {_.map(failed, (r) => (
                    <div key={r.payload.uuid}>
                      {_.get(
                        _.find(dashboards, (d) => String(d.uuid) === String(r.payload.uuid)),
                        'name',
                      ) || r.payload.uuid}
                      : {r.err}
                    </div>
                  ))}
                </div>
              ),
            });
          }
          return undefined;
        });
      })
      .catch((e) => {
        // 模板拉取失败、或某份模板 content 不是合法 JSON（JSON.parse 同步抛）都会走到这里，
        // 不兜住的话按钮只是恢复可点，用户看不到任何反馈也留不下排查线索
        console.error(e);
        message.error(t('tpl_match.import_error'));
      })
      .finally(() => {
        setImporting(false);
      });
  };

  return (
    <>
      {coverageUnavailable && <div className='mb-2 rounded-md fc-border bg-fc-100 px-3 py-2 text-xs text-soft'>{t('tpl_match.coverage_unavailable')}</div>}
      <Tabs className='[&>.ant-tabs-nav]:!mb-2' defaultActiveKey={defaultTab}>
        {extraTab && (
          <Tabs.TabPane tab={extraTab.label} key={extraTab.key}>
            {extraTab.children}
          </Tabs.TabPane>
        )}
        {show !== 'alerts' && (
          <Tabs.TabPane tab={t('tpl_match.tab_dashboards', { count: displayedDashboards.length })} key='dashboards' disabled={_.isEmpty(dashboards)}>
            {/* 缺的只是「放到哪个业务组」，就地问一次即可，不必再开一个弹窗 */}
            <Form layout='vertical'>
              <Form.Item
                className='mb-2'
                label={t('common:business_group')}
                required
                validateStatus={!bgid && !_.isEmpty(busiGroups) ? 'error' : undefined}
                help={!bgid && !_.isEmpty(busiGroups) ? t('tpl_match.pick_busi_group') : undefined}
              >
                <Select
                  className='w-full'
                  showSearch
                  optionFilterProp='label'
                  placeholder={t('tpl_match.pick_busi_group')}
                  value={bgid}
                  onChange={setBgid}
                  options={_.map(busiGroups, (item: any) => ({ label: item.name, value: item.id }))}
                />
              </Form.Item>
            </Form>

            {!_.isEmpty(dashImported) && (
              <Alert
                className='mb-2'
                type='success'
                showIcon
                message={
                  <span>
                    {t('tpl_match.imported_dashboards', { count: dashImported.length })} {/* 新标签打开：用户可能还要接着导告警，不该把这里冲掉 */}
                    <Link to='/dashboards' target='_blank'>
                      {t('tpl_match.goto_dashboards')}
                    </Link>
                  </span>
                }
              />
            )}

            <div className='flex items-center gap-2 mb-1'>
              <Checkbox
                className='mb-0 !items-center'
                indeterminate={!_.isEmpty(dashChecked) && dashChecked.length < selectableDashboards.length}
                checked={!_.isEmpty(selectableDashboards) && dashChecked.length === selectableDashboards.length}
                disabled={coverageAnalysisPending || _.isEmpty(selectableDashboards)}
                onChange={(e) => {
                  if (coverageAnalysisPending) return;
                  dashUserEditedRef.current = true;
                  setDashChecked(e.target.checked ? _.map(selectableDashboards, 'uuid') : []);
                }}
              >
                {t('tpl_match.selected_count', { checked: dashChecked.length, total: selectableDashboards.length })}
              </Checkbox>
              {recommendationHintNode}
            </div>
            <div className='max-h-[40vh] overflow-y-auto mb-3'>
              {coverageAnalysisAvailable && _.isEmpty(displayedDashboards) ? (
                <div className='py-3 text-center text-soft text-xs'>{t('tpl_match.no_covered_dashboards')}</div>
              ) : (
                <Checkbox.Group
                  className='flex flex-col gap-1'
                  disabled={coverageAnalysisPending}
                  value={dashChecked}
                  onChange={(vals) => {
                    if (coverageAnalysisPending) return;
                    dashUserEditedRef.current = true;
                    setDashChecked(vals as (number | string)[]);
                  }}
                  options={_.map(displayedDashboards, (d) => {
                    const imported = isDashImported(d.uuid);
                    const coverage = dashboardCoverageByUuid.get(String(d.uuid));
                    return {
                      label: (
                        <span className='flex min-w-0 items-center gap-2'>
                          <span className='min-w-0 truncate'>{imported ? t('tpl_match.already_imported', { name: d.name }) : d.name}</span>
                          {coverageAnalysisAvailable && coverage && renderCoverage(coverage)}
                        </span>
                      ),
                      value: d.uuid,
                      disabled: imported,
                    };
                  })}
                />
              )}
            </div>
            <Button type='primary' loading={importing} disabled={_.isEmpty(dashChecked) || !bgid || coverageAnalysisPending} onClick={importDashboards}>
              {t('tpl_match.import_dashboards_btn', { count: dashChecked.length })}
            </Button>
            {_.isEmpty(busiGroups) && <div className='mt-2 text-[var(--fc-fill-alert)]'>{t('tpl_match.no_busi_group')}</div>}
            {datasourceBound}
          </Tabs.TabPane>
        )}
        {show !== 'dashboards' && (
          <Tabs.TabPane tab={t('tpl_match.tab_alerts', { count: visibleAlertCount })} key='alerts' disabled={_.isEmpty(alertGroups)}>
            {alertsNotice}
            {/* 多分类时先选一组：正常用户只会导入其中一组 */}
            {alertGroups.length > 1 && (
              <div className='flex items-center gap-2 mb-2'>
                <span className='shrink-0'>{t('tpl_match.pick_group')}</span>
                <Select
                  className='flex-1'
                  value={activeCate}
                  onChange={(cate) => {
                    activeCateUserSelectedRef.current = true;
                    setActiveCate(cate);
                  }}
                  options={_.map(alertGroups, (g) => ({
                    label: t('tpl_match.group_option', { name: groupLabel(g.cate), count: displayedRulesByCate[g.cate]?.length || 0 }),
                    value: g.cate,
                  }))}
                />
              </div>
            )}

            {alertImportedCount > 0 && (
              <Alert
                className='mb-2'
                type='success'
                showIcon
                message={
                  <span>
                    {t('tpl_match.imported_alerts', { count: alertImportedCount })} {/* 新标签打开：用户可能还要接着导别的，不该把这里冲掉 */}
                    <Link to='/alert-rules' target='_blank'>
                      {t('tpl_match.goto_alerts')}
                    </Link>
                  </span>
                }
              />
            )}

            {/* 与集成中心弹窗共用同一个 ImportForm，只是内联在这里，不再叠第二层弹窗。
                规则列表经 beforeSubmit 插在字段与提交按钮之间：配置项必须在长列表之前，
                否则几十条规则一滚，业务组/通知规则就被埋到看不见的地方了。 */}
            <ImportForm
              data={alertData}
              busiGroups={busiGroups}
              groupedDatasourceList={groupedDatasourceList}
              reloadGroupedDatasourceList={reloadGroupedDatasourceList}
              datasourceCateOptions={datasourceCateOptions}
              initialDatasourceQueries={boundDatasourceQueries}
              contextBound
              initialBgid={bgid}
              notificationRulesAuthorized={notificationRulesAuthorized}
              submitText={t('tpl_match.import_alerts_btn', { count: activeChecked.length })}
              submitDisabled={_.isEmpty(activeChecked) || alertPayloadsLoading || coverageAnalysisPending}
              beforeSubmit={
                <>
                  <div className='flex items-center gap-2 mb-1'>
                    <Checkbox
                      className='mb-0 !items-center'
                      indeterminate={!_.isEmpty(activeChecked) && activeChecked.length < displayedActiveRules.length}
                      checked={!_.isEmpty(displayedActiveRules) && activeChecked.length === displayedActiveRules.length}
                      disabled={coverageAnalysisPending}
                      onChange={(e) => {
                        if (coverageAnalysisPending) return;
                        setActiveChecked(e.target.checked ? _.map(displayedActiveRules, 'uuid') : []);
                      }}
                    >
                      {t('tpl_match.selected_count', { checked: activeChecked.length, total: displayedActiveRules.length })}
                    </Checkbox>
                    {recommendationHintNode}
                  </div>
                  {/* 规则条数不定（Linux 通用组就有 26 条），列表内部滚动，不把容器顶出视口 */}
                  <div className='max-h-[28vh] overflow-y-auto mb-3'>
                    {coverageAnalysisAvailable && _.isEmpty(displayedActiveRules) ? (
                      <div className='py-3 text-center text-soft text-xs'>{t('tpl_match.no_covered_alerts')}</div>
                    ) : (
                      <Checkbox.Group
                        className='flex flex-col gap-1'
                        disabled={coverageAnalysisPending}
                        value={activeChecked}
                        onChange={(vals) => {
                          if (coverageAnalysisPending) return;
                          setActiveChecked(vals as (number | string)[]);
                        }}
                        options={_.map(displayedActiveRules, (rule) => {
                          const coverage = activeCate ? alertCoverageByCate[activeCate]?.get(String(rule.uuid)) : undefined;
                          return {
                            label: (
                              <span className='flex min-w-0 items-center gap-2'>
                                <span className='min-w-0 truncate'>{rule.name}</span>
                                {coverageAnalysisAvailable && coverage && renderCoverage(coverage)}
                              </span>
                            ),
                            value: rule.uuid,
                          };
                        })}
                      />
                    )}
                  </div>
                </>
              }
              onSuccess={() => {
                // ImportForm 只在整批都成功时才回调，所以提交时勾了几条就是导入了几条
                setAlertImportedCount((prev) => prev + activeChecked.length);
                // 清空该组勾选：导完还留着全选，用户很容易再点一次导出重复规则。
                // 不置灰是因为规则内容由 activeChecked 过滤而来，清空即可让按钮变成「导入 0 条」
                setActiveChecked([]);
                onImported?.('alert');
              }}
            />
            {datasourceBound}
          </Tabs.TabPane>
        )}
      </Tabs>
    </>
  );
}
