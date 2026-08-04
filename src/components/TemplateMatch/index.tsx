import React, { useContext, useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import { Select, Space, Spin } from 'antd';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { getComponents } from '@/pages/builtInComponents/services';
import '@/pages/datasource/locale';

import { postTemplateMatch, TplMatchedComponent } from './services';
import ImportModal from './ImportModal';

/**
 * 组件模板匹配面板（产品方案 A4.8/A4.9）：
 * 网格卡片展示「数据源里实际存在数据」的组件，点卡片进导入弹窗。
 * 三个入口共用：保存结果页内嵌（传 datasourceId）、告警/仪表盘列表页弹窗（不传则出数据源选择器）。
 * 不设「查看全部模板」——有匹配时全库入口在导航「集成中心」；唯一兜底链接在零匹配空态。
 */

interface Props {
  datasourceId?: number;
  show: 'dashboards' | 'alerts' | 'both';
}

export default function TemplateMatchPanel(props: Props) {
  const { t } = useTranslation('datasourceManage');
  const { show } = props;
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const promDatasources = useMemo(() => _.filter(groupedDatasourceList?.prometheus, (item: any) => item.status !== 'disabled'), [groupedDatasourceList]);
  const [dsId, setDsId] = useState<number | undefined>(props.datasourceId ?? (promDatasources[0]?.id as number | undefined));
  const [loading, setLoading] = useState(false);
  const [matched, setMatched] = useState<TplMatchedComponent[]>();
  const [logoMap, setLogoMap] = useState<Record<string, string>>({});
  const [active, setActive] = useState<TplMatchedComponent>();

  useEffect(() => {
    getComponents()
      .then((comps) => {
        setLogoMap(_.fromPairs(_.map(comps, (c: any) => [String(c.id), c.logo])));
      })
      .catch(() => {
        // logo 加载失败不影响功能
      });
  }, []);

  useEffect(() => {
    if (!dsId) return;
    let alive = true;
    setLoading(true);
    // 「刚保存的数据源客户端还没就绪」的重试收在 postTemplateMatch 里，这里不再叠一层，
    // 否则真的连不上时要打满 4 次请求、等约 5 秒才落到空态。
    postTemplateMatch(dsId)
      .then((res) => {
        if (alive) setMatched(res);
      })
      .catch(() => {
        // 接口不可用（如旧后端）：不渲染匹配区，调用方保有集成中心的常规路径
        if (alive) setMatched(undefined);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [dsId]);

  const visibleEntries = useMemo(
    () =>
      _.filter(matched, (e) => {
        if (show === 'dashboards') return !_.isEmpty(e.dashboards);
        if (show === 'alerts') return !_.isEmpty(e.alert_groups);
        return !_.isEmpty(e.dashboards) || !_.isEmpty(e.alert_groups);
      }),
    [matched, show],
  );

  return (
    <div>
      {/* 列表页入口：未指定数据源时先选（仅启用中的 Prometheus 系，默认第一个） */}
      {props.datasourceId == null && (
        <Space className='mb-3'>
          <span>{t('tpl_match.pick_datasource')}</span>
          <Select style={{ minWidth: 220 }} value={dsId} onChange={setDsId} options={_.map(promDatasources, (item: any) => ({ label: item.name, value: item.id }))} />
        </Space>
      )}

      {loading && <Spin size='small' />}

      {!loading && matched !== undefined && _.isEmpty(visibleEntries) && (
        <div className='text-[var(--fc-text-3)]'>
          {t('tpl_match.empty')}{' '}
          <Link to='/components' target='_blank'>
            {t('tpl_match.goto_components')}
          </Link>
        </div>
      )}

      {!loading && !_.isEmpty(visibleEntries) && (
        <>
          <div className='mb-2'>{t('tpl_match.found', { count: visibleEntries.length })}</div>
          <div className='grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3'>
            {_.map(visibleEntries, (e) => {
              const dashCount = (e.dashboards || []).length;
              const alertCount = _.sumBy(e.alert_groups || [], (g) => g.rules.length);
              const logo = logoMap[String(e.component_id)];
              return (
                <div
                  key={e.component_id}
                  className='fc-border rounded-md p-3 cursor-pointer text-center flex flex-col hover:shadow-[var(--fc-shadow-md,0_2px_8px_rgba(0,0,0,0.09))] transition-shadow'
                  onClick={() => {
                    setActive(e);
                  }}
                >
                  {logo && <img src={logo} alt={e.component} className='h-8 mx-auto mb-1' />}
                  <div className='font-semibold'>{e.component}</div>
                  {/* 采集变体（categraf/telegraf）不在这里露出：选哪套规则是导入弹窗里的事，
                      卡片上只回答「这个组件有多少模板可导」。 */}
                  {/* 卡片等高，计数行贴底对齐，避免组件名换行导致的错落 */}
                  <div className='text-[var(--fc-text-3)] mt-auto pt-1'>
                    {show !== 'alerts' && (dashCount > 0 ? t('tpl_match.dashboards_count', { count: dashCount }) : '—')}
                    {show === 'both' && ' · '}
                    {show !== 'dashboards' && t('tpl_match.alerts_count', { count: alertCount })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {active && dsId != null && (
        <ImportModal
          datasourceId={dsId}
          entry={active}
          show={show}
          onClose={() => {
            setActive(undefined);
          }}
        />
      )}
    </div>
  );
}
