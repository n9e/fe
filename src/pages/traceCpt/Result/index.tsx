import React, { useEffect, useState } from 'react';
import { Select, Spin } from 'antd';
import { useTranslation, Trans } from 'react-i18next';
import { getTraceSearch } from '../services';
import { SearchTraceType, Trace, TraceSortItem } from '../type';
import Detail from '../Detail';
import LabelField from '../components/LabelField';
import ResultItem from './ResultItem';
import { sortTraces, transformTraceData } from '../utils';
import ScatterBulleChart from '../components/ScatterBubbleChart/ScatterBubbleChart';
import '../index.less';

interface IProps {
  search?: SearchTraceType;
  onFetching: (v: boolean) => void;
  loading: boolean;
}

function SelectSort(props: { onChange: (v: keyof typeof TraceSortItem) => void }) {
  const { t } = useTranslation('trace');
  const [value, setValue] = useState('MOST_RECENT');

  const handleChange = (v) => {
    setValue(v);
    props.onChange(v);
  };

  return (
    <LabelField label='Sort'>
      <Select style={{ width: 130 }} value={value} onChange={handleChange}>
        {(Object.keys(TraceSortItem) as Array<keyof typeof TraceSortItem>).map((key) => (
          <Select.Option value={key} key={key}>
            {t(`sort.${key}`)}
          </Select.Option>
        ))}
      </Select>
    </LabelField>
  );
}

export default function TraceResult(props: IProps) {
  const { search, onFetching, loading } = props;
  const [curTrace, setCurTrace] = useState<Trace>();
  const [traces, setTraces] = useState<Trace[]>([]);
  const [maxTraceDuration, setMaxTraceDuration] = useState(0);
  const [sort, setSort] = useState<keyof typeof TraceSortItem>();

  useEffect(() => {
    if (!search) return;
    onFetching(true);
    getTraceSearch(search)
      .then((res) => {
        try {
          setTraces(sortTraces(res.map(transformTraceData), sort || 'MOST_RECENT'));
        } catch (e) {
          console.log(e);
        }
        // setMaxTraceDuration(calcMaxDuration(res));
        setCurTrace(undefined);
        onFetching(false);
      })
      .catch((e) => {
        onFetching(false);
      });
  }, [search]);

  const handleSort = (v: keyof typeof TraceSortItem) => {
    setSort(v);
    setTraces(sortTraces(traces, v));
  };

  return curTrace ? (
    <Detail trace={curTrace} onBack={() => setCurTrace(undefined)} />
  ) : (
    <Spin spinning={loading}>
      {traces.length > 0 && (
        <div className='tracing-search-chart'>
          <ScatterBulleChart data={traces} elClick={setCurTrace} />
        </div>
      )}
      <div className='tracing-search-result'>
        <div className='tracing-search-result--headerOverview'>
          <h2>
            {traces.length} Trace{traces.length > 1 && 's'}
          </h2>
          <SelectSort onChange={handleSort} />
        </div>
        {traces.map((trace) => (
          <ResultItem trace={trace} key={trace.traceID} maxTraceDuration={maxTraceDuration} onClick={setCurTrace} />
        ))}
      </div>
    </Spin>
  );
}
