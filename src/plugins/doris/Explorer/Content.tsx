import React from 'react';
import Raw from './Raw';
import MetricTable from './Metric/Table';
import MetricTimeseries from './Metric/Timeseries';

interface Props {
  mode: string;
  submode: string;
  metricRef: any;
  setExecuteLoading: (loading: boolean) => void;
  refreshFlag?: string;
  setRefreshFlag: (flag: string) => void;
  options: any;
}

export default function Content(props: Props) {
  const { mode, submode, metricRef, setExecuteLoading, refreshFlag, setRefreshFlag, options } = props;

  if (mode === 'metric') {
    if (submode === 'table') {
      return <MetricTable ref={metricRef} setExecuteLoading={setExecuteLoading} />;
    }
    if (submode === 'timeSeries') {
      return <MetricTimeseries ref={metricRef} setExecuteLoading={setExecuteLoading} />;
    }
  }
  if (mode === 'raw') {
    return <Raw refreshFlag={refreshFlag} setRefreshFlag={setRefreshFlag} options={options} setExecuteLoading={setExecuteLoading} />;
  }
  return null;
}
