import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import queryString from 'query-string';
import moment from 'moment';
import _ from 'lodash';
import { FormInstance } from 'antd/lib/form/Form';
import PromGraph from '@/components/PromGraphCpt';
import { IRawTimeRange, timeRangeUnix, isMathString } from '@/components/TimeRangePicker';

type IMode = 'table' | 'graph';
interface IProps {
  defaultPromQL: string;
  headerExtra: HTMLDivElement | null;
  datasourceValue: number;
  form: FormInstance;
}

export default function Prometheus(props: IProps) {
  const { headerExtra, datasourceValue, form } = props;
  const history = useHistory();
  const { search } = useLocation();
  const query = queryString.parse(search);
  const defaultPromQL = props.defaultPromQL || (_.isString(query.prom_ql) ? query.prom_ql : '');

  let defaultTime: undefined | IRawTimeRange;

  if (typeof query.start === 'string' && typeof query.end === 'string') {
    defaultTime = {
      start: isMathString(query.start) ? query.start : moment.unix(_.toNumber(query.start)),
      end: isMathString(query.end) ? query.end : moment.unix(_.toNumber(query.end)),
    };
  }

  return (
    <PromGraph
      type={query.mode as IMode}
      onTypeChange={(newType) => {
        history.replace({
          pathname: '/metric/explorer',
          search: queryString.stringify({ ...query, mode: newType }),
        });
      }}
      defaultTime={defaultTime}
      onTimeChange={(newRange) => {
        let { start, end } = newRange;
        if (moment.isMoment(start) && moment.isMoment(end)) {
          const parsedRange = timeRangeUnix(newRange);
          start = parsedRange.start as any;
          end = parsedRange.end as any;
        }
        history.replace({
          pathname: '/metric/explorer',
          search: queryString.stringify({ ...query, start, end }),
        });
      }}
      promQL={defaultPromQL as any}
      datasourceValue={datasourceValue}
      graphOperates={{ enabled: true }}
      globalOperates={{ enabled: true }}
      headerExtra={headerExtra}
      executeQuery={() => {
        form.validateFields();
      }}
    />
  );
}
