import React from 'react';
import _ from 'lodash';
import IconFont from '@/components/IconFont';
import { Popover } from 'antd';
import moment from 'moment';
import { basePrefix } from '@/App';
import { ILogExtract, ILogURL, ILogMappingParams, LinkContext } from '@/pages/log/IndexPatterns/types';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
export function replaceVarAndGenerateLink(link: string, rawValue: object, regExtractArr?: ILogExtract[], mappingParamsArr?: ILogMappingParams[]): string {
  const param = new URLSearchParams(link);
  let reallink = link;
  const timeFormat = param.get('$__time_format__');
  const startMarginNew = param.get('${__start_time_margin__}');
  const endMarginNew = param.get('${__end_time_margin__}');

  reallink = reallink.replace('$local_protocol', location.protocol).replace('$local_domain', location.host).replace('$local_url', location.origin);

  if (startMarginNew) {
    reallink = reallink.replace('&$__start_time_margin__' + '=' + startMarginNew, '');
  }
  if (endMarginNew) {
    reallink = reallink.replace('&$__end_time_margin__' + '=' + endMarginNew, '');
  }
  if (timeFormat) {
    reallink = reallink.replace('&$__time_format__' + '=' + timeFormat, '');
  }
  if (mappingParamsArr && mappingParamsArr.length > 0 && reallink.includes('$__mapping_para__')) {
    try {
      let match = false;
      for (let i = 0; i < mappingParamsArr.length; i++) {
        if (match) continue;
        const { op, v, str, field } = mappingParamsArr[i];
        const fieldStr = _.get(rawValue, field.split('.'));
        if (op === '=~' && new RegExp(v).test(fieldStr)) {
          reallink = reallink.replace('$__mapping_para__', str);
          match = true;
        }
        if (op === '!~' && !new RegExp(v).test(fieldStr)) {
          reallink = reallink.replace('$__mapping_para__', str);
          match = true;
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
  const unReplaceKeyReg = /\$\{(.+?)\}/g;
  const valueWithExtract = _.cloneDeep(rawValue);
  regExtractArr?.forEach((i) => {
    const { field, newField, reg } = i;
    const fieldValueWholeWord = valueWithExtract[field];
    const fieldValue = _.get(rawValue, field.split('.'));
    const arr = new RegExp(reg).exec(fieldValueWholeWord || fieldValue);
    if (arr && arr.length > 1) {
      valueWithExtract[newField] = arr[1];
    }
  });
  reallink = reallink.replace(unReplaceKeyReg, function (a, b) {
    const wholeWord = valueWithExtract[b];
    return wholeWord || _.get(valueWithExtract, b.split('.'));
  });
  // Doris 内置保留变量，不需要替换
  const dorisBuiltInVar = [
    '__timeFilter', '__timeFrom', '__timeTo',
    '__unixEpochFilter', '__unixEpochFrom', '__unixEpochTo',
    '__unixEpochNanoFilter', '__unixEpochNanoFrom', '__unixEpochNanoTo',
    '__timeGroup', '__interval', '__interval_ms'
  ];
  const unReplaceKeyRegNew = /\$(.+?)(?=&|$)/gm;
  reallink = reallink.replace(unReplaceKeyRegNew, function (a, b) {
    // 如果是保留字，不替换，返回原始匹配
    if (dorisBuiltInVar.includes(b)) {
      return a;
    }
    const wholeWord = valueWithExtract[b];
    return wholeWord || _.get(valueWithExtract, b.split('.'));
  });
  return reallink;
}

export const handleNav = (link: string, rawValue: object, query: { start: number; end: number }, regExtractArr?: ILogExtract[], mappingParamsArr?: ILogMappingParams[]) => {
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
  if (mappingParamsArr && mappingParamsArr.length > 0 && reallink.includes('$__mapping_para__')) {
    try {
      let match = false;
      for (let i = 0; i < mappingParamsArr.length; i++) {
        if (match) continue;
        const { op, v, str, field } = mappingParamsArr[i];
        const fieldStrWholeWord = rawValue[field];
        const fieldStr = _.get(rawValue, field.split('.'));
        if (op === '=~' && new RegExp(v).test(fieldStrWholeWord || fieldStr)) {
          reallink = reallink.replace('$__mapping_para__', str);
          match = true;
        }
        if (op === '!~' && !new RegExp(v).test(fieldStrWholeWord || fieldStr)) {
          reallink = reallink.replace('$__mapping_para__', str);
          match = true;
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
  const unReplaceKeyReg = /\$\{(.+?)\}/g;
  const valueWithExtract = _.cloneDeep(rawValue);
  // 把extractArr中的field merge到了rawValue中
  regExtractArr?.forEach((i) => {
    const { field, newField, reg } = i;
    const fieldValueWholeWord = valueWithExtract[field];
    const fieldValue = _.get(rawValue, field.split('.'));
    const arr = new RegExp(reg).exec(fieldValueWholeWord || fieldValue);
    if (arr && arr.length > 1) {
      valueWithExtract[newField] = arr[1];
    }
  });
  // 第一次替换：${fieldName} 格式
  reallink = reallink.replace(unReplaceKeyReg, function (a, b) {
    const wholeWord = valueWithExtract[b];
    return wholeWord || _.get(valueWithExtract, b.split('.'));
  });
  // 第二次替换：$fieldName 格式，到 & 或结尾为止
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
  mappingParamsArr?: ILogMappingParams[];
  inTable?: boolean;
}

export default function Links({ rawValue, range, text, paramsArr, regExtractArr, mappingParamsArr, inTable }: IProps) {
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
          <a onClick={() => handleNav(item.urlTemplate, rawValue, { start, end }, regExtractArr, mappingParamsArr)}>{item.name}</a>
        </div>
      ))}
    >
      <Link
        onClick={() => {
          if (paramsArr.length > 0) {
            handleNav(paramsArr[0].urlTemplate, rawValue, { start, end }, regExtractArr, mappingParamsArr);
          }
        }}
        text={text}
        inTable={inTable}
      />
    </Popover>
  );
}

export function Link({
  onClick,
  text,
  onMouseEnter,
  onMouseLeave,
  linkContext,
  inTable = true,
}: {
  onClick?: () => void;
  text: React.ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  linkContext?: LinkContext;
  inTable?: boolean;
}) {
  const isGold = localStorage.getItem('n9e-dark-mode') === '2';
  const iconTips = !!linkContext;
  const { rawValue, name, fieldConfig, range, parentKey } = linkContext || {};
  const relatedLinks = iconTips && fieldConfig ? fieldConfig?.linkArr?.filter((item) => (parentKey ? item.field === parentKey : item.field === name)) : [];
  const parsedRange = range ? parseRange(range) : null;
  let start = parsedRange ? moment(parsedRange.start).unix() : 0;
  let end = parsedRange ? moment(parsedRange.end).unix() : 0;
  const style = inTable
    ? {
        color: isGold ? 'var(--fc-gold-text)' : 'var(--fc-fill-primary)',
        textDecoration: 'underline',
        textDecorationColor: 'rgb(var(--fc-fill-primary-rgb) / 0.5)',
        textUnderlineOffset: 2,
      }
    : {
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
      };
  const linkIcon = inTable ? (
    <IconFont type='icon-ic_launch' style={{ color: 'var(--fc-fill-primary)', marginLeft: 6 }} />
  ) : (
    <span style={{ background: '#fff', marginLeft: 6, display: 'inline-flex', padding: 3, borderRadius: 2 }}>
      <IconFont type='icon-ic_arrow_right' style={{ color: 'var(--fc-fill-primary)' }} />
    </span>
  );
  return (
    <span style={{ ...style }}>
      <span
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'underline', textDecorationColor: 'rgb(var(--fc-fill-primary-rgb) / 0.5)', textUnderlineOffset: 2 }}
      >
        {text}
        {!iconTips && linkIcon}
      </span>
      {iconTips && (
        <Popover
          placement='right'
          overlayClassName='popover-json'
          content={relatedLinks.map((item, i) => (
            <div key={i} style={{ lineHeight: '24px' }}>
              <a
                onClick={() => {
                  const valueObjected = Object.entries(rawValue || {}).reduce((acc, [key, value]) => {
                    if (typeof value === 'string') {
                      try {
                        acc[key] = JSON.parse(value);
                      } catch (e) {
                        acc[key] = value;
                      }
                    } else {
                      acc[key] = value;
                    }
                    return acc;
                  }, {});

                  handleNav(item.urlTemplate, valueObjected, { start, end }, fieldConfig?.regExtractArr, fieldConfig?.mappingParamsArr);
                }}
              >
                {item.name}
              </a>
            </div>
          ))}
        >
          {linkIcon}
        </Popover>
      )}
    </span>
  );
}
