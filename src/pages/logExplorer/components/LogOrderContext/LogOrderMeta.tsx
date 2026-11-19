import React from 'react';
import { Space } from 'antd';
import _ from 'lodash';

import { SIZE } from '@/utils/constant';

import { LOG_SEQ_FIELD, LOG_STREAM_ID_FIELD, isLogOrderField } from './utils';

/** 日志行、表格列和详情抽屉的字段表都不列原文顺序字段，改由 LogOrderMeta 展示；SQL 模式的结果不经过这里 */
export function omitLogOrderKeys(keys: string[]) {
  return _.filter(keys, (key) => !isLogOrderField(key));
}

export function withoutLogOrderFields(log: Record<string, any>) {
  return omitLogOrderKeys(_.keys(log));
}

/** 原文顺序字段按 SLS 元信息（__xx__）的卡片样式展示；没有这两个字段的日志不渲染 */
export default function LogOrderMeta({ log }: { log: Record<string, any> }) {
  const fields = _.filter([LOG_STREAM_ID_FIELD, LOG_SEQ_FIELD], (field) => log[field] != null && log[field] !== '');
  if (fields.length === 0) return null;
  return (
    <Space wrap size={SIZE}>
      {_.map(fields, (field) => (
        <div key={field} className='fc-border rounded-md p-2 bg-fc-150'>
          <div className='mb-1 text-soft'>{field}</div>
          <div className='font-bold text-base h-[22px]'>{String(log[field])}</div>
        </div>
      ))}
    </Space>
  );
}
