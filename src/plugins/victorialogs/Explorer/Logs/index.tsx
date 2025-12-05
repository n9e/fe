import React, { useState, useEffect, useRef } from 'react';
import { Space, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { SIZE } from '@/utils/constant';
import { parseRange, IRawTimeRange } from '@/components/TimeRangePicker';

import { NAME_SPACE } from '../../constants';
import { getLogsQuery } from '../../services';
import { getFiledsByLogs } from '../../utils';

import Group from './Group';
import Table from './Table';
import JSON from './JSON';

export type Data = {
  logs: { [index: string]: string }[];
  version: string;
  loading: boolean;
  complete: boolean;
  total: number;
  fields: string[];
};

interface Props {
  refreshFlag?: string;
  datasourceValue: number;
  query: string;
  limit: number;
  range: IRawTimeRange;
}

export default function index(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { refreshFlag, datasourceValue, query, limit, range } = props;
  const totalGroupsElementRef = useRef<HTMLDivElement>(null);
  const tabBarExtraContentElementRef = useRef<HTMLDivElement>(null);
  const [activeType, setActiveType] = useState('group');
  const [viewSettings, setViewSettings] = useState({
    expand: true,
  });
  const [data, setData] = useState<Data>({
    logs: [],
    version: '',
    loading: false,
    complete: false,
    total: 0,
    fields: [],
  });

  useEffect(() => {
    if (datasourceValue && query && range) {
      setData((prev) => ({ ...prev, loading: true }));
      const parsedRange = parseRange(range);
      const start = parsedRange.start!;
      const end = parsedRange.end!;

      getLogsQuery(datasourceValue, {
        query,
        limit,
        start: start.toISOString(),
        end: end.toISOString(),
      })
        .then((res) => {
          setData({
            logs: res,
            version: _.uniqueId('dataVersion_'),
            loading: false,
            complete: true,
            total: res.length,
            fields: getFiledsByLogs(res),
          });
        })
        .catch(() => {
          setData({ logs: [], version: '', loading: false, complete: true, total: 0, fields: [] });
        });
    }
  }, [refreshFlag]);

  return (
    <Tabs
      activeKey={activeType}
      onChange={(key) => {
        setActiveType(key);
      }}
      destroyInactiveTabPane
      tabBarExtraContent={
        <Space size={SIZE * 2}>
          <Space>
            <span
              style={{
                color: 'var(--fc-text-3)',
              }}
            >
              {t('explorer.total_logs_returned')}:
            </span>
            <strong>{data.total}</strong>
          </Space>
          <div ref={tabBarExtraContentElementRef} />
        </Space>
      }
    >
      <Tabs.TabPane tab={t('explorer.view.group')} key='group'>
        {tabBarExtraContentElementRef.current && <Group tabBarExtraContentElement={tabBarExtraContentElementRef.current} data={data} />}
      </Tabs.TabPane>
      <Tabs.TabPane tab={t('explorer.view.table')} key='table'>
        {tabBarExtraContentElementRef.current && <Table tabBarExtraContentElement={tabBarExtraContentElementRef.current} data={data} />}
      </Tabs.TabPane>
      <Tabs.TabPane tab={t('explorer.view.json')} key='json'>
        {tabBarExtraContentElementRef.current && <JSON tabBarExtraContentElement={tabBarExtraContentElementRef.current} data={data} />}
      </Tabs.TabPane>
    </Tabs>
  );
}
