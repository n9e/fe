import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import queryString from 'query-string';
import moment from 'moment';
import _ from 'lodash';
import { Space } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import { useTranslation } from 'react-i18next';

import { IS_ENT, SIZE } from '@/utils/constant';
import PromGraph, { PromGraphControl } from '@/components/PromGraphCpt';
import { IRawTimeRange, timeRangeUnix, isMathString } from '@/components/TimeRangePicker';
import { getHistoryEventsById } from '@/services/warning';

import { AiButton } from '@/components/AiChatNG/FlashAiButton';
import { buildPageFrom, getExplorerPrompts } from '@/components/AiChatNG/recommend';
import { NAME_SPACE as AI_CHAT_NS } from '@/components/AiChatNG/constants';
import AiQueryDock from '@/components/AiQueryDock';
import { AiQueryDockTrigger } from '@/components/AiQueryDock/Trigger';
import { useQueryDockActions, QueryDockAction } from '@/components/AiQueryDock/useQueryDockActions';

import { queryStringOptions } from '../constants';
import ProbeBanner from '../components/ProbeBanner';
import HistoricalRecords, { setLocalQueryHistory } from './HistoricalRecords';

const LOCAL_KEY = 'n9e-query-promql-history';
// How this panel's statement is named to the assistant.
const PROMQL_ACTION: QueryDockAction = {
  name: 'set_metric_query',
  argument: 'promql',
  language: 'PromQL expression',
  followUpExample: '改成按 env 分组取平均',
  page: { title: 'Metric explorer', summary: 'The user writes PromQL and reads its results in a single query panel.' },
};

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
  const { t: tAi, i18n } = useTranslation(AI_CHAT_NS);
  const history = useHistory();
  const { search } = useLocation();
  const query = queryString.parse(search, queryStringOptions);
  const defaultPromQL = promQL ? promQL : typeof query.prom_ql === 'string' ? query.prom_ql : '';
  const [defaultTimeState, setDefaultTimeState] = useState<undefined | IRawTimeRange>();
  const [promql, setPromql] = useState<string>(defaultPromQL);
  // 体检落地横幅：仅 __from=ds_verify 进入且首个面板展示；用户接管（改查询/点查询）或点 × 后收起
  const [probeBannerVisible, setProbeBannerVisible] = useState<boolean>(query.__from === 'ds_verify' && panelIdx === 0);
  const [aiOpen, setAiOpen] = useState(false);
  const aiPageFrom = useMemo(() => buildPageFrom({ param: { datasource_type: 'prometheus', datasource_id: datasourceValue } }), [datasourceValue]);
  // What the dock sends with each message: the data source plus what is in the
  // box and which window the panel is on, read at send time. The assistant
  // verifies against that window instead of "now", and a follow-up sees the
  // expression the user may have edited since.
  const readAiPageFrom = useCallback(() => {
    const snapshot = graphControl.current?.snapshot();
    const range = snapshot?.range?.start && snapshot.range.end ? timeRangeUnix(snapshot.range) : undefined;
    return buildPageFrom({
      param: {
        datasource_type: 'prometheus',
        datasource_id: datasourceValue,
        promql: snapshot?.query?.trim() || undefined,
        start: range ? String(range.start) : undefined,
        end: range ? String(range.end) : undefined,
      },
    });
  }, [datasourceValue]);
  const aiPromptList = useMemo(() => ['cpu', 'memory', 'disk'].map((metric) => ({ label: tAi(`dock.prompt_${metric}`), value: tAi(`dock.prompt_${metric}_query`) })), [tAi]);
  // This panel's own query box; panels on this page can each be on a different
  // data source, so the assistant is handed the box, not a page-wide lookup.
  const graphControl = useRef<PromGraphControl | null>(null);

  // The dock, and the page action behind it, exist only in the Flashcat
  // enterprise build: its assistant is fc-model, which understands page
  // actions. The open-source and Nightingale commercial builds talk to the
  // n9e assistant and keep the global chat button they always had.
  const aiActions = useQueryDockActions({
    // Only the panel whose dock is open may be written to by the assistant.
    enabled: IS_ENT && aiOpen,
    datasourceValue,
    getControl: () => graphControl.current,
    action: PROMQL_ACTION,
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
            {IS_ENT ? (
              <AiQueryDock
                open={aiOpen}
                pageFrom={readAiPageFrom}
                progress={aiActions.progress}
                prepareTurn={aiActions.prepareTurn}
                canUndo={aiActions.canUndo}
                onUndo={aiActions.undo}
                promptList={aiPromptList}
                onNewConversation={aiActions.reset}
                onClose={() => {
                  aiActions.cancel();
                  setAiOpen(false);
                }}
              />
            ) : undefined}
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
          IS_ENT ? (
            <AiQueryDockTrigger
              open={aiOpen}
              onClick={() => {
                // Opening the assistant is taking over, same as editing the
                // query by hand: the onboarding banner steps aside.
                setProbeBannerVisible(false);
                if (aiOpen) aiActions.cancel();
                setAiOpen((previous) => !previous);
              }}
            />
          ) : undefined
        }
        leadingExtraActive={IS_ENT && aiOpen}
        extra={
          <Space size={SIZE}>
            {IS_ENT ? undefined : (
              <AiButton
                queryPageFrom={aiPageFrom}
                queryAction={{
                  key: 'query_generator',
                  param: {
                    datasource_type: 'prometheus',
                    datasource_id: datasourceValue,
                  },
                }}
                promptList={getExplorerPrompts(i18n.language)}
                onExecuteQueryForQueryContent={(nextPromql) => {
                  setPromql(nextPromql);
                }}
              />
            )}
            <HistoricalRecords localKey={LOCAL_KEY} datasourceValue={datasourceValue} onChange={setPromql} />
          </Space>
        }
        showExportButton
      />
    </>
  );
}
