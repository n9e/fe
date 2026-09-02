import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import queryString from 'query-string';
import moment from 'moment';
import _ from 'lodash';
import { Space } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import { useTranslation } from 'react-i18next';

import { SIZE } from '@/utils/constant';
import PromGraph from '@/components/PromGraphCpt';
import { IRawTimeRange, timeRangeUnix, isMathString } from '@/components/TimeRangePicker';
import { getHistoryEventsById } from '@/services/warning';

import { AiButton } from '@/components/AiChatNG/FlashAiButton';
import { buildPageFrom, getExplorerPrompts } from '@/components/AiChatNG/recommend';
import { useAiChatContext } from '@/components/AiChatNG';

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
  const { i18n } = useTranslation();
  const history = useHistory();
  const { search } = useLocation();
  const query = queryString.parse(search, queryStringOptions);
  const defaultPromQL = promQL ? promQL : typeof query.prom_ql === 'string' ? query.prom_ql : '';
  const [defaultTimeState, setDefaultTimeState] = useState<undefined | IRawTimeRange>();
  const [promql, setPromql] = useState<string>(defaultPromQL);
  // 体检落地横幅：仅 __from=ds_verify 进入且首个面板展示；用户接管（改查询/点查询）或点 × 后收起
  const [probeBannerVisible, setProbeBannerVisible] = useState<boolean>(query.__from === 'ds_verify' && panelIdx === 0);
  const { queryPageFrom } = useAiChatContext();
  // Scopes the lookup below to this panel. Panels on this page can each be on a
  // different data source, and only some of them render a PromQL box at all, so
  // there is no position in a page-wide query that reliably means "this one".
  // `display: contents` keeps the wrapper out of the layout entirely.
  const panelRef = useRef<HTMLDivElement>(null);

  useMetricExplorerAIActions({
    // The chat is a single panel at the app root, so at most one explorer panel
    // is ever the one being talked about. Whichever panel's AI button opened it
    // put its own key on page_from; that is the one whose query box may be
    // written to.
    enabled: Boolean(panelKey) && (queryPageFrom?.param?.panelKey as string | undefined) === panelKey,
    datasourceValue,
    setPromql,
    setTimeRange: setDefaultTimeState,
    getQueryInput: () => panelRef.current?.querySelector('.prom-graph-expression-input-ng') ?? null,
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
    <div ref={panelRef} style={{ display: 'contents' }}>
      <PromGraph
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
          probeBannerVisible ? (
            <ProbeBanner
              datasourceId={datasourceValue}
              onClose={() => {
                setProbeBannerVisible(false);
              }}
            />
          ) : undefined
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
        extra={
          <Space size={SIZE}>
            <AiButton
              queryPageFrom={buildPageFrom({
                param: {
                  datasource_type: 'prometheus',
                  datasource_id: datasourceValue,
                  // Says which panel the conversation belongs to. Metric.tsx
                  // closes the chat when that panel is removed, and the panel
                  // registers its page action only while it is the owner.
                  panelKey,
                },
              })}
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
            <HistoricalRecords localKey={LOCAL_KEY} datasourceValue={datasourceValue} onChange={setPromql} />
          </Space>
        }
        showExportButton
      />
    </div>
  );
}
