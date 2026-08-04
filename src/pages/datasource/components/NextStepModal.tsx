import React, { useContext, useMemo } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Button, Modal, Space, Spin, Tag, Tooltip } from 'antd';
import { ArrowRightOutlined, CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled, InfoCircleFilled, MinusCircleFilled, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { basePrefix, CommonStateContext } from '@/App';
import { allCates, getCateDisplayLabel, Cate } from '@/components/AdvancedWrap/utils';
import TemplateMatchPanel from '@/components/TemplateMatch';

import { getNextActions } from '../nextActions';
import { helpLinkMap } from '../config';
import useDataProbe, { metricSelector } from '../utils/useDataProbe';
import NextActionButton from './NextActionButton';
import '../locale';

/**
 * 数据源「下一步引导」弹窗（原独立结果页 /datasources/result/:id 改造而来）。
 *
 * 两个入口共用同一套内容 —— 数据体检 → 下一步动作 → 组件模板匹配：
 *   - saved / updated：表单页保存成功后自动弹出。保存是表单页的一个环节而不是一次跳转，
 *     弹窗让用户留在发起动作的位置：关掉回列表，体检说连不上就地退回编辑，不产生不可回退的中间页。
 *   - inspect：列表行主动点开。回答「这个数据源现在还通不通、接下来能干嘛」，
 *     而不是把人一脚踢进即时查询页面。
 *
 * 连通性结论有两个来源，各说各的、不互相冒充：
 *   - verification：后端 upsert 顺手跑的那次连通性测试（只在 saved/updated 语境有）；
 *   - probe：前端落地后实测的一次查询。体检能说话时，saved_unverified 这种「不知道」的话就不说了。
 */

/** 后端 upsert 返回的连通性测试结论，见 center/router/router_datasource.go: datasourceVerification */
export interface Verification {
  state: 'verified' | 'saved_unverified' | 'force_saved_failed';
  stage?: string;
  latency_ms?: number;
  /** 已脱敏的错误信息；非失败态为空 */
  message?: string;
}

interface Props {
  datasourceId: number;
  pluginType: string;
  name: string;
  mode: 'saved' | 'updated' | 'inspect';
  /** 仅 saved/updated 语境有；旧后端不返回时为 undefined */
  verification?: Verification;
  /** 已停用的数据源查询必然失败，不能把「停用」误报成「连不上」 */
  disabled?: boolean;
  /** 关闭（X / ESC / 遮罩 / 右下角按钮） */
  onClose: () => void;
  /** 去编辑这个数据源 */
  onEdit: () => void;
  /** 保存完接着录下一个；仅 saved 语境提供 */
  onContinueAdd?: () => void;
}

const STATE_COLOR = {
  success: 'var(--fc-fill-success)',
  warning: 'var(--fc-fill-alert)',
  error: 'var(--fc-fill-error)',
  info: 'var(--fc-fill-primary)',
  muted: 'var(--fc-text-4)',
} as const;

type Tone = keyof typeof STATE_COLOR;

const VERIF_TONE: Record<Verification['state'], Tone> = {
  verified: 'success',
  saved_unverified: 'info',
  force_saved_failed: 'error',
};

export default function NextStepModal(props: Props) {
  const { t, i18n } = useTranslation('datasourceManage');
  const { datasourceId, pluginType, name, mode, verification, disabled, onClose, onEdit, onContinueAdd } = props;
  const { isPlus } = useContext(CommonStateContext);

  const cate = useMemo(() => _.find(allCates, { value: pluginType }) as Cate | undefined, [pluginType]);
  const cateLabel = getCateDisplayLabel(cate, i18n.language) || pluginType;
  const actions = useMemo(() => getNextActions(cate, datasourceId, isPlus), [cate, datasourceId, isPlus]);
  const { probe, reprobe } = useDataProbe(disabled ? undefined : datasourceId, pluginType);
  const state = disabled ? 'disabled' : probe.state;

  const exploreAction = _.find(actions, (a) => a.enabled && (a.key === 'explore_metric' || a.key === 'explore_log'));
  // 体检跑通的查询直接带进探索器：落地即出图，无需重跑探测
  const exploreUrl =
    state === 'hasData' && probe.sampleMetric
      ? `/metric/explorer?data_source_name=prometheus&data_source_id=${datasourceId}&prom_ql=${encodeURIComponent(metricSelector(probe.sampleMetric))}&__from=ds_verify`
      : exploreAction?.url;
  const docUrl = _.get(helpLinkMap, pluginType);

  /** 下一步动作一律新标签打开：用户挑一件事去做，不该把弹窗和没看完的体检结论一起冲掉 */
  const blankLinkProps = (url: string) => ({ href: `${basePrefix}${url}`, target: '_blank', rel: 'noopener noreferrer' });

  const renderStatusBlock = (tone: Tone, icon: React.ReactNode, title: React.ReactNode, desc?: React.ReactNode) => (
    <div className='fc-border rounded-md p-3 pl-4 flex gap-3 relative overflow-hidden'>
      {/* .fc-border 用 !important 锁死了 border-width，状态色条只能另起一个元素 */}
      <span className='absolute left-0 top-0 bottom-0 w-[3px]' style={{ background: STATE_COLOR[tone] }} />
      <span className='text-base leading-6' style={{ color: STATE_COLOR[tone] }}>
        {icon}
      </span>
      <div className='min-w-0 flex-1'>
        <div className='font-semibold'>{title}</div>
        {desc && <div className='text-[var(--fc-text-3)] mt-1'>{desc}</div>}
      </div>
    </div>
  );

  /**
   * 保存时那次连通性测试的结论。只在它比体检多说了点什么时才占一块：
   * 失败必须说；「不知道通不通」只在体检也说不出话（不支持/已停用）时才说；
   * 「已验证」同理 —— 体检能出结论时，实测结果比保存那一刻的握手更有说服力。
   */
  const renderVerification = () => {
    if (!verification) return null;
    const probeIsMute = state === 'unsupported' || state === 'disabled';
    if (verification.state !== 'force_saved_failed' && !probeIsMute) return null;

    const tone = VERIF_TONE[verification.state];
    const icon = tone === 'success' ? <CheckCircleFilled /> : tone === 'error' ? <CloseCircleFilled /> : <InfoCircleFilled />;
    const lines = _.compact([verification.message, verification.latency_ms ? t('result.latency', { ms: verification.latency_ms }) : undefined]);
    // 字面量映射而非 t(`result.${state}`)：动态 key 会让 check_locale_keys 看不见这三条文案
    const title = {
      verified: t('result.verified'),
      saved_unverified: t('result.saved_unverified'),
      force_saved_failed: t('result.force_saved_failed'),
    }[verification.state];
    return renderStatusBlock(
      tone,
      icon,
      title,
      _.isEmpty(lines) ? undefined : (
        <>
          {_.map(lines, (line) => (
            <div key={line} className='break-all'>
              {line}
            </div>
          ))}
        </>
      ),
    );
  };

  const renderProbe = () => {
    switch (state) {
      case 'disabled':
        return renderStatusBlock('muted', <MinusCircleFilled />, t('result.ds_disabled'), t('result.ds_disabled_desc'));
      case 'probing':
        return (
          <div className='fc-border rounded-md p-3 flex items-center gap-3 text-[var(--fc-text-3)]'>
            <Spin size='small' />
            <span>{t('result.probing')}</span>
          </div>
        );
      case 'hasData':
        return renderStatusBlock(
          'success',
          <CheckCircleFilled />,
          t('result.has_data'),
          <>
            <div>
              {t('result.has_data_desc', {
                count: probe.metricCount,
                ago: probe.lastDataTs ? moment.unix(probe.lastDataTs).fromNow() : '-',
                ms: probe.latencyMs,
              })}
            </div>
            {probe.sampleMetric && (
              <div className='mt-1'>
                {t('result.sample_metric')}：<code className='break-all'>{probe.sampleMetric}</code>
              </div>
            )}
          </>,
        );
      case 'noData':
        return renderStatusBlock('warning', <ExclamationCircleFilled />, t('result.no_data'), t('result.no_data_desc'));
      case 'staleData':
        return renderStatusBlock('warning', <ExclamationCircleFilled />, t('result.stale_data'), t('result.stale_data_desc'));
      case 'unreachable':
        return renderStatusBlock(
          'error',
          <CloseCircleFilled />,
          t('result.unreachable'),
          <>
            {probe.errorMessage && <div className='break-all'>{probe.errorMessage}</div>}
            <div>{t('result.unreachable_desc')}</div>
          </>,
        );
      case 'unsupported':
      default:
        // 一期只有 Prometheus 系能体检。不硬凑结论，但也不能让弹窗看起来是空的 ——
        // 说清楚「测不了」比什么都不说强。
        return renderStatusBlock('muted', <MinusCircleFilled />, t('result.probe_unsupported'), t('result.probe_unsupported_desc'));
    }
  };

  // 这两种情况主按钮本身就是「编辑此配置」，页脚不必再摆一个一模一样的
  const primaryIsEdit = state === 'disabled' || (state === 'unreachable' && mode === 'inspect');

  // 主按钮随体检结论变文案：有数据 → 探索；没数据 → 看接入文档；连不上 → 去改配置
  const renderPrimaryActions = () => {
    if (state === 'disabled') {
      return (
        <Button type='primary' onClick={onEdit}>
          {t('result.footer_edit')}
        </Button>
      );
    }
    if (state === 'probing') {
      return (
        <Button type='primary' loading>
          {t('result.explore_btn')}
        </Button>
      );
    }
    if (state === 'noData' || state === 'staleData') {
      return (
        <>
          {docUrl && (
            <Button type='primary' href={docUrl} target='_blank'>
              {t('result.view_doc_btn')}
            </Button>
          )}
          <Button icon={<ReloadOutlined />} onClick={reprobe}>
            {t('result.reprobe_btn')}
          </Button>
          {exploreAction?.url && (
            <Button type='link' {...blankLinkProps(exploreAction.url)}>
              {t('result.open_explorer_anyway')}
            </Button>
          )}
        </>
      );
    }
    if (state === 'unreachable') {
      return (
        <>
          <Button type='primary' onClick={onEdit}>
            {mode === 'inspect' ? t('result.footer_edit') : t('result.back_edit_btn')}
          </Button>
          <Button icon={<ReloadOutlined />} onClick={reprobe}>
            {t('result.reprobe_btn')}
          </Button>
        </>
      );
    }
    // hasData / unsupported：探索是唯一的主路径
    return exploreUrl ? (
      <Tooltip title={t('result.explore_hint')}>
        <Button type='primary' {...blankLinkProps(exploreUrl)}>
          {t('result.explore_btn')} <ArrowRightOutlined />
        </Button>
      </Tooltip>
    ) : null;
  };

  return (
    <Modal
      visible
      width={720}
      maskClosable
      onCancel={onClose}
      title={
        mode === 'inspect' ? (
          <Space size={8}>
            <span>{name}</span>
            <Tag className='m-0'>{cateLabel}</Tag>
          </Space>
        ) : (
          <Space size={8}>
            {/* 存成功是确定的，图标只在后端明确说了「测试没过但强存了」时才转红 */}
            {verification?.state === 'force_saved_failed' ? (
              <CloseCircleFilled style={{ color: STATE_COLOR.error }} />
            ) : (
              <CheckCircleFilled style={{ color: STATE_COLOR.success }} />
            )}
            <span>
              {cateLabel}「{name}」{mode === 'updated' ? t('result.updated') : t('result.saved')}
            </span>
          </Space>
        )
      }
      footer={
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            {onContinueAdd && (
              <Button type='link' size='small' onClick={onContinueAdd}>
                {t('result.footer_add')}
              </Button>
            )}
            {!primaryIsEdit && (
              <Button type='link' size='small' onClick={onEdit}>
                {t('result.footer_edit')}
              </Button>
            )}
          </div>
          <Button onClick={onClose}>{mode === 'inspect' ? t('result.footer_close') : t('result.footer_back')}</Button>
        </div>
      }
    >
      <div className='max-h-[60vh] overflow-y-auto pr-1 flex flex-col gap-4'>
        {renderVerification()}
        {renderProbe()}

        <div>
          <div className='font-semibold mb-2'>{t('result.next_step')}</div>
          {/* 有模板匹配时，一键导入现成的盘和告警才是主路径，这两个「从空白开始」降为文字链 */}
          <Space wrap>
            {renderPrimaryActions()}
            <NextActionButton action={_.find(actions, { key: 'create_dashboard' })} label={t('result.create_dashboard')} hint={t('result.create_dashboard_hint')} type='link' />
            <NextActionButton action={_.find(actions, { key: 'create_alert' })} label={t('result.create_alert')} hint={t('result.create_alert_hint')} type='link' />
          </Space>
        </div>

        {/* 组件模板匹配：仅在体检有数据时展示 —— 连数据都没有时推荐模板只会装出一堆 No Data 大盘 */}
        {state === 'hasData' && (
          <div className='border-t border-[var(--fc-border-color)] pt-4'>
            <TemplateMatchPanel datasourceId={datasourceId} show='both' />
          </div>
        )}
      </div>
    </Modal>
  );
}
