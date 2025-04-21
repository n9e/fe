import React, { useState, useEffect, useRef } from 'react';
import { Modal, Popover } from 'antd';
import { basePrefix } from '@/App';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import IconFont from '@/components/IconFont';
import moment from 'moment';
import { IndexPatternExtract } from '@/pages/log/IndexPatterns/types';
const Indent = 30;
const colonSpace = 10;

interface IProps {
  value: object;
  features: { field?: string; name: string; urlTemplate: string }[];
  extractArr: IndexPatternExtract[];
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

  const { value, features, query, extractArr } = props;
  return (
    <div className='highlight-json'>
      <div>{'{'}</div>
      {renderObject(value, [], { features, rawValue: value, query, extractArr })}
      <div>{'}'}</div>
    </div>
  );
}

interface IParam {
  features: { field?: string; name: string; urlTemplate: string }[];
  rawValue: object;
  query: any;
  extractArr: IndexPatternExtract[];
}

function renderValue(value, keyPath: string[], param: IParam) {
  const { t } = useTranslation();
  const isGold = localStorage.getItem('n9e-dark-mode') === '2';
  const { features, rawValue, query, extractArr } = param;
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
    // 为了兼容旧逻辑，所以${} 中的也需要替换
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
    // 旧逻辑Endding，开启新逻辑，替换不带括号的 $local_protocol
    // 我把上边的一坨代码复制下来，然后改成不带括号的了
    const timeFormat = param.get('$__time_format__');
    const startMarginNew = param.get('$__start_time_margin__');
    const endMarginNew = param.get('$__end_time_margin__');
    const startMarginNumNew = startMarginNew && !isNaN(Number(startMarginNew)) ? Number(startMarginNew) : 0;
    const endMarginNumNew = endMarginNew && !isNaN(Number(endMarginNew)) ? Number(endMarginNew) : 0;
    let fromValue: string | number = '';
    if (typeof query.start === 'number') {
      if (timeFormat) {
        if (timeFormat === 'unix') {
          fromValue = moment(1000 * query.start + startMarginNumNew).unix();
        } else {
          fromValue = moment(1000 * query.start + startMarginNumNew).format(timeFormat);
        }
      } else {
        fromValue = String(1000 * query.start + startMarginNumNew);
      }
    }
    let toValue: string | number = '';
    if (typeof query.start === 'number') {
      if (timeFormat) {
        if (timeFormat === 'unix') {
          toValue = moment(1000 * query.end + endMarginNumNew).unix();
        } else {
          toValue = moment(1000 * query.end + endMarginNumNew).format(timeFormat);
        }
      } else {
        toValue = String(1000 * query.end + endMarginNumNew);
      }
    }
    reallink = reallink
      .replace('$local_protocol', location.protocol)
      .replace('$local_domain', location.host)
      .replace('$local_url', location.origin)
      .replace('$__from', fromValue + '')
      .replace('$__to', toValue + '');

    if (startMarginNew) {
      reallink = reallink.replace('&$__start_time_margin__' + '=' + startMarginNew, '');
    }
    if (endMarginNew) {
      reallink = reallink.replace('&$__end_time_margin__' + '=' + endMarginNew, '');
    }
    if (timeFormat) {
      reallink = reallink.replace('&$__time_format__' + '=' + timeFormat, '');
    }
    const unReplaceKeyReg = /\$\{(.+?)\}/g;
    const valueWithExtract = _.cloneDeep(rawValue);
    extractArr.forEach((i) => {
      const { field, newField, reg } = i;
      const fieldValue = _.get(rawValue, field.split('.'));
      const arr = new RegExp(reg).exec(fieldValue);
      if (arr && arr.length > 1) {
        valueWithExtract[newField] = arr[1];
      }
    });
    reallink = reallink.replace(unReplaceKeyReg, function (a, b) {
      const wholeWord = valueWithExtract[b];
      return wholeWord || _.get(valueWithExtract, b.split('.'));
    });
    const unReplaceKeyRegNew = /\$(.+?)(?=&|$)/gm;
    reallink = reallink.replace(unReplaceKeyRegNew, function (a, b) {
      const wholeWord = valueWithExtract[b];
      return wholeWord || _.get(valueWithExtract, b.split('.'));
    });
    window.open(basePrefix + reallink.replace(unReplaceKeyRegNew, ''), '_blank');
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
          style={{
            display: 'inline-flex',
            textDecoration: 'underline',
            fontWeight: 'bold',
            borderRadius: 4,
            padding: '2px 2px 2px 6px',
            background: 'var(--fc-fill-primary)',
            color: isGold ? 'var(--fc-gold-text)' : '#fff',
            marginBottom: 2,
            cursor: 'pointer',
            height: 22,
            alignItems: 'center',
          }}
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
          <span style={{ background: '#fff', marginLeft: 6, display: 'inline-flex', padding: 3, borderRadius: 2 }}>
            <IconFont type='icon-ic_arrow_right' style={{ color: 'var(--fc-fill-primary)', height: 12 }} />
          </span>
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
