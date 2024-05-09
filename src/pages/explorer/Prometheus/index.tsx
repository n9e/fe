import React, { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import queryString from 'query-string';
import moment from 'moment';
import _ from 'lodash';
import { FormInstance } from 'antd/lib/form/Form';
import PromGraph from '@/components/PromGraphCpt';
import { IRawTimeRange, timeRangeUnix, isMathString } from '@/components/TimeRangePicker';
import { queryStringOptions } from '../constants';

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
  onChange?: (promQL: string) => void;
  promQLInputTooltip?: string;
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
  } = props;
  const history = useHistory();
  const { search } = useLocation();
  const query = queryString.parse(search, queryStringOptions);
  const defaultPromQL = promQL ? promQL : _.isString(query.prom_ql) ? query.prom_ql : '';
  const [defaultTime, setDefaultTime] = useState<undefined | IRawTimeRange>();

  useEffect(() => {
    if (typeof query.start === 'string' && typeof query.end === 'string') {
      setDefaultTime({
        start: isMathString(query.start) ? query.start : moment.unix(_.toNumber(query.start)),
        end: isMathString(query.end) ? query.end : moment.unix(_.toNumber(query.end)),
      });
    }
  }, []);

  return (
    <PromGraph
      type={query.mode as IMode}
      defaultTime={defaultTime}
      onTimeChange={(newRange) => {
        let { start, end } = newRange;
        if (moment.isMoment(start) && moment.isMoment(end)) {
          const parsedRange = timeRangeUnix(newRange);
          start = parsedRange.start as any;
          end = parsedRange.end as any;
        }
        if (panelIdx === 0 && allowReplaceHistory) {
          history.replace({
            pathname: '/metric/explorer',
            search: queryString.stringify({ ...query, start, end }),
          });
        }
      }}
      promQL={defaultPromQL as any}
      datasourceValue={datasourceValue}
      graphOperates={{ enabled: true }}
      globalOperates={{ enabled: true }}
      headerExtra={headerExtra}
      executeQuery={() => {
        form.validateFields();
      }}
      showBuiltinMetrics={showBuiltinMetrics}
      graphStandardOptionsType='horizontal'
      defaultUnit={defaultUnit}
      showGlobalMetrics={showGlobalMetrics}
      showBuilder={showBuilder}
      onChange={onChange}
      promQLInputTooltip={promQLInputTooltip}
    />
  );
}
