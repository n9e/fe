import React from 'react';
import Raw from './Raw';
import MetricTimeseries from './Metric/Timeseries';

interface Props {
  submode: string;
  setExecuteLoading: (loading: boolean) => void;
}

export default function Content(props: Props) {
  const { submode, setExecuteLoading } = props;

  if (submode === 'raw') {
    return <Raw setExecuteLoading={setExecuteLoading} />;
  }

  if (submode === 'timeSeries') {
    return <MetricTimeseries setExecuteLoading={setExecuteLoading} />;
  }

  return null;
}
