import React, { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import queryString from 'query-string';
import moment from 'moment';
import _ from 'lodash';
import { FormInstance } from 'antd/lib/form/Form';

import PromGraph from '@/components/PromGraphCpt';
import { IRawTimeRange, timeRangeUnix, isMathString } from '@/components/TimeRangePicker';
import { getHistoryEventsById } from '@/services/warning';

import { queryStringOptions } from '../constants';
import HistoricalRecords, { setLocalQueryHistory } from './HistoricalRecords';

const LOCAL_KEY = 'n9e-query-promql-history';

type IMode = 'table' | 'graph';
interface IProps {
  headerExtra: HTMLDivElement | null;
  datasourceValue: number;
  form: FormInstance;
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
  const history = useHistory();
  const { search } = useLocation();
  const query = queryString.parse(search, queryStringOptions);
  const defaultPromQL = promQL ? promQL : typeof query.prom_ql === 'string' ? query.prom_ql : '';
  const [defaultTimeState, setDefaultTimeState] = useState<undefined | IRawTimeRange>();
  const [promql, setPromql] = useState<string>(defaultPromQL);

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
        form.validateFields();
      }}
      showBuiltinMetrics={showBuiltinMetrics}
      graphStandardOptionsType={graphStandardOptionsType}
      graphStandardOptionsPlacement='bottomRight'
      defaultUnit={defaultUnit}
      showGlobalMetrics={showGlobalMetrics}
      showBuilder={showBuilder}
      onChange={(newPromQL) => {
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
      extra={<HistoricalRecords localKey={LOCAL_KEY} datasourceValue={datasourceValue} />}
      showExportButton
    />
  );
}
