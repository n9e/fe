import React, { useState } from 'react';
import _ from 'lodash';
import IconFont from '@/components/IconFont';
import { Popover } from 'antd';
import moment from 'moment';
import { basePrefix } from '@/App';
import { ILogExtract, ILogURL } from '@/pages/log/IndexPatterns/types';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';

const handleNav = (link: string, rawValue: object, query: { start: number; end: number }, regExtractArr?: ILogExtract[]) => {
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
  const startMarginNew = param.get('${__start_time_margin__}');
  const endMarginNew = param.get('${__end_time_margin__}');
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
  regExtractArr?.forEach((i) => {
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

interface IProps {
  rawValue: object;
  range?: IRawTimeRange;
  text: React.ReactNode;
  paramsArr: ILogURL[];
  regExtractArr?: ILogExtract[];
}

export default function Links({ rawValue, range, text, paramsArr, regExtractArr }: IProps) {
  const isGold = localStorage.getItem('n9e-dark-mode') === '2';
  const parsedRange = range ? parseRange(range) : null;
  let start = parsedRange ? moment(parsedRange.start).unix() : 0;
  let end = parsedRange ? moment(parsedRange.end).unix() : 0;
  return (
    <Popover
      placement='right'
      overlayClassName='popover-json'
      content={paramsArr.map((item, i) => (
        <div key={i} style={{ lineHeight: '24px' }}>
          <a onClick={() => handleNav(item.urlTemplate, rawValue, { start, end }, regExtractArr)}>{item.name}</a>
        </div>
      ))}
    >
      <span
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
          lineHeight: '22px',
          alignItems: 'center',
        }}
        onClick={() => {
          if (paramsArr.length > 0) {
            handleNav(paramsArr[0].urlTemplate, rawValue, { start, end }, regExtractArr);
          }
        }}
      >
        {text};
        <span style={{ background: '#fff', marginLeft: 6, display: 'inline-flex', padding: 3, borderRadius: 2 }}>
          <IconFont type='icon-ic_arrow_right' style={{ color: 'var(--fc-fill-primary)', height: 12 }} />
        </span>
      </span>
    </Popover>
  );
}
