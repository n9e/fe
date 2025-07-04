import React, { useMemo, useState } from 'react';
import { Button, Popover, Input } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { NAME_SPACE } from '@/plugins/mysql/constants';

import './style.less';

const LIMIT = 100;

export const setLocalQueryHistory = (localKey: string, query: { [index: string]: string }) => {
  if (!query) return;
  const queryClone = _.cloneDeep(query);
  _.forEach(_.sortBy(_.keys(queryClone)), (key) => {
    queryClone[key] = _.trim(queryClone[key]);
  });
  const queryStr = JSON.stringify(queryClone);
  const queryHistoryStr = localStorage.getItem(localKey);
  let queryHistoryMap = new Map();
  if (queryHistoryStr) {
    try {
      const queryHistory = JSON.parse(queryHistoryStr);
      queryHistoryMap = new Map(queryHistory);
    } catch (e) {
      console.error(e);
    }
  }
  if (queryHistoryMap.has(queryStr)) {
    // 如果存在的话，就更新时间
    queryHistoryMap.set(queryStr, moment().unix());
  } else {
    // 如果 map 的长度小于等于 LIMIT，直接添加
    if (queryHistoryMap.size <= LIMIT) {
      queryHistoryMap.set(queryStr, moment().unix());
    }
    // 如果 map 的长度大于 LIMIT，找到最小的时间，删除最小的时间
    if (queryHistoryMap.size > LIMIT) {
      let minTime = Infinity;
      let minKey = '';
      for (const [key, value] of queryHistoryMap.entries()) {
        if (value < minTime) {
          minTime = value;
          minKey = key;
        }
      }
      if (minKey) {
        queryHistoryMap.delete(minKey);
        queryHistoryMap.set(queryStr, moment().unix());
      }
    }
  }
  const newQueryHistory: [string, number][] = [];
  for (const x of queryHistoryMap.entries()) {
    newQueryHistory.push(x);
  }
  localStorage.setItem(localKey, JSON.stringify(newQueryHistory));
};

export const getLocalQueryHistory = (localKey: string) => {
  const queryHistoryStr = localStorage.getItem(localKey);
  let queryHistoryMap = new Map();
  if (queryHistoryStr) {
    try {
      const queryHistory = JSON.parse(queryHistoryStr);
      queryHistoryMap = new Map(queryHistory);
    } catch (e) {
      console.error(e);
    }
  }
  const queryHistory: [{ [index: string]: string }, number][] = [];
  for (const x of queryHistoryMap.entries()) {
    try {
      // 确保每个查询字符串都是有效的 JSON 字符串
      const parsedQuery = JSON.parse(x[0]);
      if (typeof parsedQuery === 'object' && parsedQuery !== null) {
        queryHistory.push([parsedQuery, x[1]]);
      } else {
        console.warn('Invalid query format', x[0]);
      }
    } catch (e) {
      console.warn('getLocalQueryHistory error', e);
    }
  }
  return _.slice(_.reverse(_.sortBy(queryHistory, (item) => item[1])), 0, LIMIT);
};

interface Props {
  localKey: string;
  datasourceValue: number;
  renderItem: (item: { [index: string]: string }) => React.ReactNode;
}

export default function index({ localKey, datasourceValue, renderItem }: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(false);
  const historicalRecords = useMemo(() => getLocalQueryHistory(`${localKey}-${datasourceValue}`), [datasourceValue, visible]);

  return (
    <Popover
      visible={visible}
      onVisibleChange={(newVisible) => {
        setVisible(newVisible);
      }}
      content={
        <div className='min-w-[400px] max-w-[800px]'>
          <Input placeholder={t('query.historicalRecords.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className='mt-2 max-h-[300px] overflow-y-auto'>
            {_.map(historicalRecords, (item) => {
              if (!search || _.some(item[0], (value) => _.includes(_.toLower(value), _.toLower(search)))) {
                return renderItem(item[0]);
              }
              return null;
            })}
          </div>
        </div>
      }
      title={
        <div
          style={{
            height: 36,
            lineHeight: '36px',
          }}
        >
          {t('query.historicalRecords.button')}
        </div>
      }
      trigger='click'
      placement='bottomLeft'
    >
      <Button
        onClick={() => {
          setVisible(true);
        }}
      >
        {t('query.historicalRecords.button')}
      </Button>
    </Popover>
  );
}
