/**
 * 日志字段值组件，包含字段值分割和点击添加到搜索框事件
 */
import React, { useContext } from 'react';
import _ from 'lodash';

import { LogsViewerStateContext } from '../../index';
import { OnValueFilterParams } from '../../types';
import { Field } from '../../../../types';
import { tokenizer } from './util';
import Token from './Token';

interface Props {
  parentKey?: string; // 嵌套json渲染时可以传入，目前仅用在下钻的字段名判断中。目前仅在 sls 中使用
  name: string;
  value: any;
  onTokenClick?: (parmas: OnValueFilterParams) => void;
  rawValue?: object;
  enableTooltip?: boolean;
  fieldValueClassName?: string;
}

export default function index(props: Props) {
  const { indexData: indexList } = useContext(LogsViewerStateContext);
  const { parentKey, name, value, onTokenClick, rawValue, enableTooltip, fieldValueClassName } = props;

  const indexData = _.find(indexList, (item) => {
    return item.field === (parentKey ? parentKey + '.' + name : name);
  });

  const { delimiters } = indexData || ({} as Field);

  if (_.isString(value) && delimiters && delimiters.length > 0) {
    const result = tokenizer(value, delimiters);
    if (result.length > 100) {
      // 分割结果过多时不进行分割展示，避免页面卡顿
      return (
        <Token
          segmented={false}
          name={name}
          parentKey={parentKey}
          value={value}
          fieldValue={value}
          onTokenClick={onTokenClick}
          rawValue={rawValue}
          enableTooltip={enableTooltip}
          fieldValueClassName={fieldValueClassName}
        />
      );
    }
    return (
      <span className={fieldValueClassName}>
        {_.map(result, (item, idx) => {
          if (item.type === 'text') {
            return (
              <Token
                key={idx}
                segmented={result.length > 1}
                parentKey={parentKey}
                name={name}
                value={item.value}
                fieldValue={value}
                onTokenClick={onTokenClick}
                rawValue={rawValue}
                enableTooltip={enableTooltip}
                fieldValueClassName={fieldValueClassName}
              />
            );
          } else if (item.type === 'delimiter') {
            return (
              <div key={idx} className='inline text-hint m-0 p-0'>
                {item.value}
              </div>
            );
          }
          return null;
        })}
      </span>
    );
  }
  return (
    <Token
      segmented={false}
      name={name}
      parentKey={parentKey}
      value={value}
      fieldValue={value}
      onTokenClick={onTokenClick}
      rawValue={rawValue}
      enableTooltip={enableTooltip}
      fieldValueClassName={fieldValueClassName}
    />
  );
}
