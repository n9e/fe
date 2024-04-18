import React, { useState, useEffect, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Skeleton, List, Divider } from 'antd';
import { useThrottleFn } from 'ahooks';
import _ from 'lodash';
import { getMetrics, Filter, Record } from '@/pages/metricsBuiltin/services';
import classNames from 'classnames';

interface Props {
  filter: Filter;
  activeMetric?: Record;
  setActiveMetric: (metric?: Record) => void;
  onSelect: (expression: string) => void;
}

export default function MetricsList(props: Props) {
  const { filter, activeMetric, setActiveMetric, onSelect } = props;
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<any[]>([]);
  const currentPage = useRef(1);
  const { run: loadMoreData } = useThrottleFn(
    (currentFilter, currentData) => {
      if (loading) {
        return;
      }
      setLoading(true);
      getMetrics({ ...currentFilter, p: currentPage.current, limit: 10 })
        .then((res) => {
          currentPage.current += 1;
          setData([...currentData, ...res.list]);
          setTotal(res.total);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    },
    {
      wait: 500,
    },
  );

  useEffect(() => {
    currentPage.current = 1;
    setData([]);
    loadMoreData(filter, []);
  }, [filter]);

  return (
    <div
      id='promql-dropdown-built-in-metrics-list-scrollable'
      style={{
        height: 288,
        overflow: 'auto',
      }}
      onMouseLeave={() => {
        setActiveMetric(undefined);
      }}
    >
      <InfiniteScroll
        dataLength={data.length}
        next={() => {
          loadMoreData(filter, data);
        }}
        hasMore={data.length < total}
        loader={<Skeleton paragraph={{ rows: 1 }} active />}
        endMessage={!_.isEmpty(data) ? <Divider plain>It is all, nothing more 🤐</Divider> : null}
        scrollableTarget='promql-dropdown-built-in-metrics-list-scrollable'
      >
        <List
          size='small'
          dataSource={data}
          renderItem={(item) => {
            return (
              <List.Item
                key={item.id}
                className={classNames({
                  active: activeMetric?.id === item.id,
                })}
                onMouseEnter={() => {
                  setActiveMetric(item);
                }}
                onClick={() => {
                  onSelect(item.expression);
                }}
              >
                {item.name}
              </List.Item>
            );
          }}
        />
      </InfiniteScroll>
    </div>
  );
}
