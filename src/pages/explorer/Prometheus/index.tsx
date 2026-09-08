import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import queryString from 'query-string';
import moment from 'moment';
import _ from 'lodash';
import { Space, Tooltip } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';

import { SIZE } from '@/utils/constant';
import PromGraph, { PromGraphControl } from '@/components/PromGraphCpt';
import { IRawTimeRange, timeRangeUnix, isMathString } from '@/components/TimeRangePicker';
import { getHistoryEventsById } from '@/services/warning';

import { buildPageFrom } from '@/components/AiChatNG/recommend';
import { NAME_SPACE as AI_CHAT_NS } from '@/components/AiChatNG/constants';
import AiQueryDock from '@/components/AiQueryDock';

import { queryStringOptions } from '../constants';
import ProbeBanner from '../components/ProbeBanner';
import HistoricalRecords, { setLocalQueryHistory } from './HistoricalRecords';
import { useMetricExplorerAIActions } from './useMetricExplorerAIActions';

const LOCAL_KEY = 'n9e-query-promql-history';

type IMode = 'table' | 'graph';
interface IProps {
  headerExtra: HTMLDivElement | null;
  datasourceValue: number;
  form: FormInstance;
  panelKey?: string;
  panelIdx?: number;
  showBuiltinMetrics?: boolean;
  allowReplaceHistory?: boolean;
  promQL?: string;
  defaultUnit?: string;
  showGlobalMetrics?: boolean;
  showBuilder?: boolean;
  onChange?: (promQL?: string) => void;
  promQLInputTooltip?: string;
  graphStandardOptionsType?: 'vertical' | 'horizontal';
  defaultType?: IMode; // 受控的 mode 和 querystring (mode) 是互斥的
  onDefaultTypeChange?: (newMode: IMode) => void;
  defaultTime?: IRawTimeRange; // 受控的 time 和 allowReplaceHistory 的 querystring (start, end) 是互斥的
  onDefaultTimeChange?: (newRange: IRawTimeRange) => void;
}

export default function Prometheus(props: IProps) {
  const {
    headerExtra,
    datasourceValue,
    form,
    panelKey,
    panelIdx = 0,
    showBuiltinMetrics = true,
    allowReplaceHistory,
    promQL,
    defaultUnit,
    showGlobalMetrics,
    showBuilder,
    onChange,
    promQLInputTooltip,
    graphStandardOptionsType = 'vertical',
    defaultType,
    onDefaultTypeChange,
    defaultTime,
    onDefaultTimeChange,
  } = props;
  const { t: tAi } = useTranslation(AI_CHAT_NS);
  const history = useHistory();
  const { search } = useLocation();
  const query = queryString.parse(search, queryStringOptions);
  const defaultPromQL = promQL ? promQL : typeof query.prom_ql === 'string' ? query.prom_ql : '';
  const [defaultTimeState, setDefaultTimeState] = useState<undefined | IRawTimeRange>();
  const [promql, setPromql] = useState<string>(defaultPromQL);
  // 体检落地横幅：仅 __from=ds_verify 进入且首个面板展示；用户接管（改查询/点查询）或点 × 后收起
  const [probeBannerVisible, setProbeBannerVisible] = useState<boolean>(query.__from === 'ds_verify' && panelIdx === 0);
  const [aiOpen, setAiOpen] = useState(false);
  // Stable per data source: the chat treats a new page-info object as a new conversation.
  const aiPageFrom = useMemo(() => buildPageFrom({ param: { datasource_type: 'prometheus', datasource_id: datasourceValue } }), [datasourceValue]);
  const aiPromptList = useMemo(() => ['cpu', 'memory', 'disk'].map((metric) => ({ label: tAi(`dock.prompt_${metric}`), value: tAi(`dock.prompt_${metric}_query`) })), [tAi]);
  // This panel's own query box; panels on this page can each be on a different
  // data source, so the assistant is handed the box, not a page-wide lookup.
  const graphControl = useRef<PromGraphControl | null>(null);

  const aiActions = useMetricExplorerAIActions({
    // Only the panel whose dock is open may be written to by the assistant.
    enabled: aiOpen,
    datasourceValue,
    getControl: () => graphControl.current,
  });

  useEffect(() => {
    if (query.__event_id) {
      getHistoryEventsById(_.toNumber(query.__event_id)).then((res) => {
        const dat = res.dat;
        if (dat.cate === 'prometheus') {
          form.setFieldsValue({
            datasourceValue: dat.datasource_id,
          });
          setPromql(dat.prom_ql);
        }
      });
    } else {
      setPromql(defaultPromQL);
    }
  }, [query.__event_id, defaultPromQL]);

  useEffect(() => {
    if (!defaultTime) {
      if (typeof query.start === 'string' && typeof query.end === 'string') {
        setDefaultTimeState({
          start: isMathString(query.start) ? query.start : moment.unix(_.toNumber(query.start)),
          end: isMathString(query.end) ? query.end : moment.unix(_.toNumber(query.end)),
        });
      }
    } else {
      setDefaultTimeState(defaultTime);
    }
  }, []);

  return (
    <>
      <PromGraph
        controlRef={graphControl}
        onUserContextChange={aiActions.invalidateUndo}
        // key={promql} // 当存在 query.__event_id 时需要异步获取 datasourceValue 和 prom_ql，这时需要强制重新渲染
        type={query.mode as IMode}
        defaultType={defaultType}
        defaultTime={defaultTimeState}
        onTimeChange={(newRange) => {
          let { start, end } = newRange;
          if (moment.isMoment(start) && moment.isMoment(end)) {
            const parsedRange = timeRangeUnix(newRange);
            start = parsedRange.start as any;
            end = parsedRange.end as any;
          }
          if (panelIdx === 0 && allowReplaceHistory) {
            history.replace({
              search: queryString.stringify({ ...query, start, end }),
            });
          }
          if (onDefaultTimeChange) {
            onDefaultTimeChange(newRange);
          }
        }}
        promQL={promql}
        datasourceValue={datasourceValue}
        graphOperates={{ enabled: true }}
        globalOperates={{ enabled: true }}
        headerExtra={headerExtra}
        executeQuery={() => {
          // 用户主动点「查询」= 已接管，体检横幅让位
          setProbeBannerVisible(false);
          form.validateFields();
        }}
        showBuiltinMetrics={showBuiltinMetrics}
        graphStandardOptionsType={graphStandardOptionsType}
        graphStandardOptionsPlacement='bottomRight'
        defaultUnit={defaultUnit}
        showGlobalMetrics={showGlobalMetrics}
        showBuilder={showBuilder}
        noticeBanner={
          <>
            <AiQueryDock
              open={aiOpen}
              pageFrom={aiPageFrom}
              progress={aiActions.progress}
              prepareTurn={aiActions.prepareTurn}
              canUndo={aiActions.canUndo}
              onUndo={aiActions.undo}
              promptList={aiPromptList}
              onClose={() => {
                aiActions.cancel();
                setAiOpen(false);
              }}
            />
            {probeBannerVisible ? (
              <ProbeBanner
                datasourceId={datasourceValue}
                onClose={() => {
                  setProbeBannerVisible(false);
                }}
              />
            ) : undefined}
          </>
        }
        onChange={(newPromQL) => {
          if (newPromQL && newPromQL !== defaultPromQL) {
            // 用户改了查询 = 已接管，体检横幅让位
            setProbeBannerVisible(false);
          }
          if (newPromQL) {
            setLocalQueryHistory(`${LOCAL_KEY}-${datasourceValue}`, newPromQL);
          }
          onChange && onChange(newPromQL);
        }}
        promQLInputTooltip={promQLInputTooltip}
        onTypeChange={(newType) => {
          if (onDefaultTypeChange) {
            onDefaultTypeChange(newType);
          }
        }}
        leadingExtra={
          <Tooltip title={tAi('dock.open')}>
            <button
              type='button'
              aria-label={tAi('dock.open')}
              aria-pressed={aiOpen}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full border-0 p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                aiOpen ? 'bg-fc-200/80 text-primary' : 'bg-transparent text-primary/80 hover:bg-fc-200/80 hover:text-primary'
              }`}
              onClick={() => {
                // Opening the assistant is taking over, same as editing the
                // query by hand: the onboarding banner steps aside.
                setProbeBannerVisible(false);
                if (aiOpen) aiActions.cancel();
                setAiOpen((previous) => !previous);
              }}
            >
              <Sparkles size={16} strokeWidth={1.75} aria-hidden='true' />
            </button>
          </Tooltip>
        }
        leadingExtraActive={aiOpen}
        extra={
          <Space size={SIZE}>
            <HistoricalRecords localKey={LOCAL_KEY} datasourceValue={datasourceValue} onChange={setPromql} />
          </Space>
        }
        showExportButton
      />
    </>
  );
}
