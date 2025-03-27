import React, { useState, useEffect, useRef } from 'react';
import { Modal, Popover } from 'antd';
import { basePrefix } from '@/App';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
const Indent = 30;
const colonSpace = 10;

interface IProps {
  value: object;
  features: { field: string; name: string; urlTemplate: string }[];
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

  const { value, features, query } = props;
  return (
    <div className='highlight-json'>
      <div>{'{'}</div>
      {renderObject(value, [], { features, rawValue: value, query })}
      <div>{'}'}</div>
    </div>
  );
}

interface IParam {
  features: { field: string; name: string; urlTemplate: string }[];
  rawValue: object;
  query: any;
}

function renderValue(value, keyPath: string[], param: IParam) {
  const { t } = useTranslation();
  const { features, rawValue, query } = param;
  const keyPathStr = keyPath.join('.');
  const links = features.filter((i) => i.field === keyPathStr);
  const [hoveringIndex, setHoveringIndex] = useState(0);
  const [relations, setRelations] = useState<
    {
      name: string;
      link: string;
    }[]
  >([]);
  const handleNav = (link: string) => {
    const param = new URLSearchParams(link);
    const startMargin = param.get('${__start_time_margin__}');
    const endMargin = param.get('${__end_time_margin__}');
    const startMarginNum = startMargin && !isNaN(Number(startMargin)) ? Number(startMargin) : 0;
    const endMarginNum = endMargin && !isNaN(Number(endMargin)) ? Number(endMargin) : 0;
    let reallink = link
      .replace('${local_protocol}', location.protocol)
      .replace('${local_domain}', location.host)
      .replace('${local_url}', location.origin)
      .replace('${__start_time__}', typeof query.start === 'number' ? String(1000 * query.start + startMarginNum) : '')
      .replace('${__end_time__}', typeof query.end === 'number' ? String(1000 * query.end + endMarginNum) : '');

    if (startMargin) {
      reallink = reallink.replace('&${__start_time_margin__}' + '=' + startMargin, '');
    }
    if (endMargin) {
      reallink = reallink.replace('&${__end_time_margin__}' + '=' + endMargin, '');
    }
    const unReplaceKeyReg = /\$\{(.+?)\}/g;
    reallink = reallink.replace(unReplaceKeyReg, function (a, b) {
      const wholeWord = rawValue[b];
      return wholeWord || _.get(rawValue, b.split('.'));
    });
    window.open(basePrefix + reallink.replace(unReplaceKeyReg, ''), '_blank');
  };

  const renderLink = (links, value) => (
    <>
      {/* {links.length === 1 ? (
        <a
          onClick={() => {
            handleNav(links[0].relations[0].link);
          }}
        >
          {value}
        </a>
      ) : ( */}
      <Popover
        placement='right'
        overlayClassName='popover-json'
        onVisibleChange={(visible) => {
          if (!visible) {
            setHoveringIndex(0);
          }
        }}
        content={relations.map((item, i) => (
          <div key={i} style={{ lineHeight: '24px' }}>
            <a onClick={() => handleNav(item.link)}>{item.name}</a>
          </div>
        ))}
      >
        <a
          style={{ textDecoration: 'underline', fontWeight: 'bold' }}
          onMouseEnter={() => {
            setRelations(links.map((i) => ({ name: i.name, link: i.urlTemplate })));
          }}
          onClick={() => {
            if (relations.length > 0) {
              handleNav(relations[0].link);
            }
          }}
        >
          {value}
        </a>
      </Popover>
      {/* )} */}
    </>
  );

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
