import React, { useState } from 'react';
import Search, { SearchTraceType } from './Search';
import Detail from './Detail';
import Result from './Result';
import _ from 'lodash';
import { Trace, SearchTraceIDType } from './type';
import { getTraceByID } from './services';
import { transformTraceData } from './utils';

interface IProps {
  init?: string;
  initPluginId?: number;
}

export default function TraceCpt(props: IProps) {
  const { init, initPluginId } = props;
  const [search, setSearch] = useState<SearchTraceType | SearchTraceIDType>();
  const [curTrace, setCurTrace] = useState<Trace | null>();
  const [resultLoading, setResultLoading] = useState(false);
  const hasTraceId = (search) => {
    return search.hasOwnProperty('traceID');
  };
  return (
    <div className='tracing'>
      <Search
        init={init}
        initPluginId={initPluginId}
        onSearch={async (v) => {
          if (hasTraceId(v)) {
            try {
              setResultLoading(true);
              setCurTrace(undefined);
              if (v['traceID']) {
                const item = await getTraceByID(v as SearchTraceIDType);
                setCurTrace(transformTraceData(item[0]));
              }
              setResultLoading(false);
            } catch (e) {
              setResultLoading(false);
            }
          } else {
            setSearch(v);
            setCurTrace(undefined);
          }
        }}
        resultLoading={resultLoading}
      />
      {!curTrace ? <Result search={search as SearchTraceType} onFetching={setResultLoading} loading={resultLoading} /> : <Detail trace={curTrace} />}
    </div>
  );
}
