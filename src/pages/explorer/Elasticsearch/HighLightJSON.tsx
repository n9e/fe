import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { ILogExtract, ILogURL } from '@/pages/log/IndexPatterns/types';
import Links from '@/pages/explorer/components/Links';
const Indent = 30;
const colonSpace = 10;

interface IProps {
  value: object;
  urlTemplates?: ILogURL[];
  extractArr?: ILogExtract[];
  query: any;
}
export default function highlightJson(props: IProps) {
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
      {renderObject(value, [], { urlTemplates, rawValue: value, query, extractArr })}
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

function renderValue(value, keyPath: string[], param: IParam) {
  const { urlTemplates, rawValue, query, extractArr } = param;
  const keyPathStr = keyPath.join('.');
  const links = urlTemplates?.filter((i) => i.field === keyPathStr) || [];

  const renderLink = (links, value) => <Links rawValue={rawValue} range={query} text={value} paramsArr={links} />;

  if (_.isNumber(value)) {
    return links.length > 0 ? renderLink(links, value) : <span style={{ color: '#164' }}>{value}</span>;
  } else if (_.isString(value)) {
    return links.length > 0 ? renderLink(links, value) : <span style={{ color: '#a11' }}>"{value}"</span>;
  } else if (_.isPlainObject(value)) {
    return (
      <>
        <span>{'{'}</span>
        {renderObject(value, keyPath, param)}
        <div>{'},'}</div>
      </>
    );
  } else if (_.isArray(value)) {
    return (
      <>
        <span>{'['}</span>
        {renderArray(value, keyPath, param)}
        <span>{'],'}</span>
      </>
    );
  }
}

function renderObject(value, keyPath: string[] = [], param: IParam) {
  const keys = Object.keys(value);
  return keys.map((k, i) => (
    <div style={{ marginLeft: Indent }}>
      {`"${k}"`}
      <span style={{ marginRight: colonSpace }}>:</span>
      {renderValue(value[k], [...keyPath, k], param)}
      {i < keys.length - 1 && !_.isPlainObject(value[k]) && ','}
    </div>
  ));
}

function renderArray(value, keyPath: string[] = [], param: IParam) {
  const keys = Object.keys(value);
  return keys.map((k, i) => (
    <div style={{ marginLeft: Indent }}>
      {renderValue(value[k], [...keyPath, k], param)}
      {i < keys.length - 1 && !_.isPlainObject(value[k]) && ','}
    </div>
  ));
}
