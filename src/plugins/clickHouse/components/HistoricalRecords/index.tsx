import React, { useMemo, useState } from 'react';
import { Button, Popover, Input } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { NAME_SPACE } from '../../constants';
import './style.less';

const LIMIT = 100;

export const setLocalQueryHistory = (localKey: string, query: string) => {
  if (!query) return;
  query = _.trim(query);
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
  if (queryHistoryMap.has(query)) {
    // 如果存在的话，就更新时间
    queryHistoryMap.set(query, moment().unix());
  } else {
    // 如果 map 的长度小于等于 LIMIT，直接添加
    if (queryHistoryMap.size <= LIMIT) {
      queryHistoryMap.set(query, moment().unix());
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
        queryHistoryMap.set(query, moment().unix());
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
  const queryHistory: [string, number][] = [];
  for (const x of queryHistoryMap.entries()) {
    queryHistory.push(x);
  }
  return _.slice(_.reverse(_.sortBy(queryHistory, (item) => item[1])), 0, LIMIT);
};

interface Props {
  localKey: string;
  datasourceValue: number;
  onSelect: (query: string) => void;
}

export default function index({ localKey, datasourceValue, onSelect }: Props) {
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
        <div className='n9e-historical-records-popover-content'>
          <Input placeholder={t('query.historicalRecords.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className='n9e-historical-records-popover-content-records-content'>
            {_.map(historicalRecords, (item) => {
              if (!search || item[0].includes(search)) {
                return (
                  <div
                    className='n9e-historical-records-popover-content-records-item'
                    key={item[0]}
                    onClick={() => {
                      onSelect(item[0]);
                      setVisible(false);
                    }}
                  >
                    {item[0]}
                  </div>
                );
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
