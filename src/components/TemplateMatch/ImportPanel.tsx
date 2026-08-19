import React, { useContext, useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import { Alert, Button, Checkbox, message, Modal, Select, Tabs } from 'antd';
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

import { TplMatchedComponent, parseVariant } from './services';

/**
 * 模板导入面板：两个 Tab 对应「导入仪表盘模板 / 导入告警规则模板」，模板逐条勾选默认全选，
 * 就地落库。与集成中心手动导入的全部差别 = 数据源预绑定（上下文由调用方带过来）。
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

interface Props {
  datasourceId: number;
  entry: TplMatchedComponent;
  show: 'dashboards' | 'alerts' | 'both';
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

export default function ImportPanel(props: Props) {
  const { t } = useTranslation('datasourceManage');
  const { datasourceId, entry, show, defaultBgid, onImported, ctx } = props;
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

  const dashboards = entry.dashboards || [];
  const alertGroups = entry.alert_groups || [];
  const [dashChecked, setDashChecked] = useState<(number | string)[]>(_.map(dashboards, 'uuid'));
  // 已成功导入的仪表盘：面板保持打开，靠它防止同一份被点出多个副本
  const [dashImported, setDashImported] = useState<(number | string)[]>([]);
  // 调用方给了落点就用它；否则业务组只有一个时直接填上，用户不必为一个没得选的选项点一次
  const [bgid, setBgid] = useState<number | undefined>(() => defaultBgid ?? (busiGroups?.length === 1 ? busiGroups[0].id : undefined));
  const [activeCate, setActiveCate] = useState<string | undefined>(alertGroups[0]?.cate);
  // 勾选态按分类分别保存，来回切分类不丢用户已经挑好的规则
  const [alertCheckedMap, setAlertCheckedMap] = useState<Record<string, (number | string)[]>>(() => _.fromPairs(_.map(alertGroups, (g) => [g.cate, _.map(g.rules, 'uuid')])));
  const [importing, setImporting] = useState(false);
  // 已导入的告警条数，累计——用户可能先导 categraf 那组，再切到 exporter 组接着导
  const [alertImportedCount, setAlertImportedCount] = useState(0);

  const defaultTab = show === 'alerts' || (show === 'both' && _.isEmpty(dashboards)) ? 'alerts' : 'dashboards';
  // uuid 在 match 接口里是 number、在 payload 接口里可能是 string，一律按字符串比对，
  // 否则「已导入」置灰会因类型不同而失效
  const isDashImported = (uuid: number | string) => _.includes(_.map(dashImported, String), String(uuid));
  const selectableDashboards = _.reject(dashboards, (d) => isDashImported(d.uuid));

  const activeGroup = _.find(alertGroups, { cate: activeCate });
  const activeRules = activeGroup?.rules || [];
  const activeChecked = (activeCate ? alertCheckedMap[activeCate] : undefined) || [];
  const setActiveChecked = (vals: (number | string)[]) => {
    if (!activeCate) return;
    setAlertCheckedMap((prev) => ({ ...prev, [activeCate]: vals }));
  };

  /** cate 形如 linux_by_categraf 时给出「categraf 采集」，解析不出就用原值（如 Common Alert Rules - Categraf） */
  const groupLabel = (cate: string) => {
    const variant = parseVariant(cate);
    return variant ? t('tpl_match.variant', { variant }) : cate;
  };

  // 按分类拉一次模板内容即可：payload 只随分类变，不随勾选变（旧实现是每次点「导入」都重拉一遍）
  const [alertPayloads, setAlertPayloads] = useState<PayloadLike[]>([]);
  const [alertPayloadsLoading, setAlertPayloadsLoading] = useState(false);
  useEffect(() => {
    if (!activeCate) return undefined;
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
  }, [entry.component_id, activeCate]);

  // 勾选变化时只在本地过滤，不再发请求
  const alertData = useMemo(
    () =>
      formatBeautifyJsons(
        _.map(
          _.filter(alertPayloads, (p) => _.includes(_.map(activeChecked, String), String(p.uuid))),
          'content',
        ),
      ),
    [alertPayloads, activeChecked],
  );
  const boundDatasourceQueries = useMemo(() => [{ match_type: 0, op: 'in', values: [datasourceId] }], [datasourceId]);

  /**
   * 仪表盘就地导入：模板内容是用户勾出来的，再弹一个 JSON 文本框让人确认没有意义，
   * 缺的只是「放到哪个业务组」。直接调 createDashboard，不经原来的第二个弹窗。
   */
  const importDashboards = () => {
    if (!bgid) return;
    setImporting(true);
    getPayloads<PayloadLike[]>({ component_id: entry.component_id, type: TypeEnum.dashboard })
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
      <Tabs defaultActiveKey={defaultTab}>
        {show !== 'alerts' && (
          <Tabs.TabPane tab={t('tpl_match.tab_dashboards', { count: dashboards.length })} key='dashboards' disabled={_.isEmpty(dashboards)}>
            {/* 缺的只是「放到哪个业务组」，就地问一次即可，不必再开一个弹窗 */}
            <div className='flex items-center gap-2 mb-2'>
              <span className='shrink-0'>{t('common:business_group')}</span>
              <Select
                className='flex-1'
                showSearch
                optionFilterProp='label'
                placeholder={t('tpl_match.pick_busi_group')}
                value={bgid}
                onChange={setBgid}
                options={_.map(busiGroups, (item: any) => ({ label: item.name, value: item.id }))}
              />
            </div>

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

            <Checkbox
              className='mb-1'
              indeterminate={!_.isEmpty(dashChecked) && dashChecked.length < selectableDashboards.length}
              checked={!_.isEmpty(selectableDashboards) && dashChecked.length === selectableDashboards.length}
              disabled={_.isEmpty(selectableDashboards)}
              onChange={(e) => {
                setDashChecked(e.target.checked ? _.map(selectableDashboards, 'uuid') : []);
              }}
            >
              {t('tpl_match.selected_count', { checked: dashChecked.length, total: selectableDashboards.length })}
            </Checkbox>
            <div className='max-h-[40vh] overflow-y-auto mb-3'>
              <Checkbox.Group
                className='flex flex-col gap-1'
                value={dashChecked}
                onChange={(vals) => {
                  setDashChecked(vals as (number | string)[]);
                }}
                options={_.map(dashboards, (d) => {
                  const imported = isDashImported(d.uuid);
                  return { label: imported ? t('tpl_match.already_imported', { name: d.name }) : d.name, value: d.uuid, disabled: imported };
                })}
              />
            </div>
            <Button type='primary' loading={importing} disabled={_.isEmpty(dashChecked) || !bgid} onClick={importDashboards}>
              {t('tpl_match.import_dashboards_btn', { count: dashChecked.length })}
            </Button>
            {_.isEmpty(busiGroups) && <div className='mt-2 text-[var(--fc-fill-alert)]'>{t('tpl_match.no_busi_group')}</div>}
          </Tabs.TabPane>
        )}
        {show !== 'dashboards' && (
          <Tabs.TabPane tab={t('tpl_match.tab_alerts', { count: _.sumBy(alertGroups, (g) => g.rules.length) })} key='alerts' disabled={_.isEmpty(alertGroups)}>
            {/* 多分类时先选一组：正常用户只会导入其中一组 */}
            {alertGroups.length > 1 && (
              <div className='flex items-center gap-2 mb-2'>
                <span className='shrink-0'>{t('tpl_match.pick_group')}</span>
                <Select
                  className='flex-1'
                  value={activeCate}
                  onChange={setActiveCate}
                  options={_.map(alertGroups, (g) => ({
                    label: t('tpl_match.group_option', { name: groupLabel(g.cate), count: g.rules.length }),
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
              submitDisabled={_.isEmpty(activeChecked) || alertPayloadsLoading}
              beforeSubmit={
                <>
                  <Checkbox
                    className='mb-1'
                    indeterminate={!_.isEmpty(activeChecked) && activeChecked.length < activeRules.length}
                    checked={!_.isEmpty(activeRules) && activeChecked.length === activeRules.length}
                    onChange={(e) => {
                      setActiveChecked(e.target.checked ? _.map(activeRules, 'uuid') : []);
                    }}
                  >
                    {t('tpl_match.selected_count', { checked: activeChecked.length, total: activeRules.length })}
                  </Checkbox>
                  {/* 规则条数不定（Linux 通用组就有 26 条），列表内部滚动，不把容器顶出视口 */}
                  <div className='max-h-[28vh] overflow-y-auto mb-3'>
                    <Checkbox.Group
                      className='flex flex-col gap-1'
                      value={activeChecked}
                      onChange={(vals) => {
                        setActiveChecked(vals as (number | string)[]);
                      }}
                      options={_.map(activeRules, (r) => ({ label: r.name, value: r.uuid }))}
                    />
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
          </Tabs.TabPane>
        )}
      </Tabs>
      <div className='mt-3 text-[var(--fc-text-4)]'>{t('tpl_match.datasource_bound', { id: datasourceId })}</div>
    </>
  );
}
