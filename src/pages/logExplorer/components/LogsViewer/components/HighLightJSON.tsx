/**
 * 兼容下钻链接、格式的高亮展示 JSON 结构
 */

import React from 'react';
import _ from 'lodash';

import { ILogExtract, ILogURL } from '@/pages/log/IndexPatterns/types';

import Links from '../../Links';

const Indent = 30;
const colonSpace = 10;

interface IProps {
  value: object;
  urlTemplates?: ILogURL[];
  extractArr?: ILogExtract[];
  query: any;
}
export default function HighlightJson(props: IProps) {
  // 目前如下结构，都可以正常渲染
  // const value = {
  //   name: 'guguji5',
  //   hibit: ['tennis', '钢琴'],
  //   nest: { a: 'b', c: 123 },
  //   veryNest: [{ v: '112' }],
  // };

  const { value, urlTemplates, query, extractArr } = props;
  return (
    <div className='highlight-json'>
      <div>{'{'}</div>
      {renderObject(value as JsonObject, [], { urlTemplates, rawValue: value, query, extractArr })}
      <div>{'}'}</div>
    </div>
  );
}

interface IParam {
  urlTemplates?: ILogURL[];
  rawValue: object;
  query: any;
  extractArr?: ILogExtract[];
}

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;
interface JsonObject {
  [key: string]: JsonValue;
}
type JsonArray = JsonValue[];

function isJsonObject(value: JsonValue): value is JsonObject {
  return _.isPlainObject(value);
}

function isJsonArray(value: JsonValue): value is JsonArray {
  return _.isArray(value);
}

function renderValue(value: JsonValue, keyPath: string[], param: IParam) {
  const { urlTemplates, rawValue, query } = param;
  const keyPathStr = keyPath.join('.');
  const links = urlTemplates?.filter((i) => i.field === keyPathStr) || [];

  const renderLink = (linkParams: ILogURL[], text: string | number | boolean) => <Links rawValue={rawValue} range={query} text={text} paramsArr={linkParams} />;

  if (_.isNumber(value)) {
    return links.length > 0 ? (
      renderLink(links, value)
    ) : (
      <span
      // style={{ color: 'var(--fc-fill-success)' }}
      >
        {value}
      </span>
    );
  } else if (_.isString(value)) {
    return links.length > 0 ? renderLink(links, value) : <span style={{ color: 'var(--fc-fill-error)' }}>&quot;{value}&quot;</span>;
  } else if (_.isBoolean(value)) {
    return links.length > 0 ? renderLink(links, value) : <span style={{ color: 'var(--fc-purple-6-color)' }}>{String(value)}</span>;
  } else if (_.isNull(value)) {
    return <span style={{ color: 'var(--fc-text-4)' }}>null</span>;
  } else if (isJsonObject(value)) {
    return (
      <>
        <span>{'{'}</span>
        {renderObject(value, keyPath, param)}
        <div>{'},'}</div>
      </>
    );
  } else if (isJsonArray(value)) {
    return (
      <>
        <span>{'['}</span>
        {renderArray(value, keyPath, param)}
        <span>{'],'}</span>
      </>
    );
  }
}

function renderObject(value: JsonObject, keyPath: string[] = [], param: IParam) {
  const keys = Object.keys(value);
  return keys.map((k, i) => (
    <div key={k} style={{ marginLeft: Indent }}>
      {`"${k}"`}
      <span style={{ marginRight: colonSpace }}>:</span>
      {renderValue(value[k], [...keyPath, k], param)}
      {i < keys.length - 1 && !_.isPlainObject(value[k]) && ','}
    </div>
  ));
}

function renderArray(value: JsonArray, keyPath: string[] = [], param: IParam) {
  const keys = Object.keys(value);
  return keys.map((k, i) => (
    <div key={k} style={{ marginLeft: Indent }}>
      {renderValue(value[Number(k)], [...keyPath, k], param)}
      {i < keys.length - 1 && !_.isPlainObject(value[Number(k)]) && ','}
    </div>
  ));
}
