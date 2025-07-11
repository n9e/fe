import React from 'react';
import _ from 'lodash';

/**
 * 根据分隔符分割文本
 * @param value 需要分割的文本
 * @param delimiters 分割符
 * @returns 分割后的数组结果
 * 例子:
 * delimiters = ["@","&","?","|","#","(",")","=","'","\\"",",",";",":","<",">","[","]","{","}","/"," ","\\n","\\t","\\r","\\\\"]
 * value = "a@b&c?d|e#f(g)h=i'j\"k,l;m:n<o>p[q]r{s}t/u v\nw\tx\ry\\z"
 * return = [{
 *  value: "a",
 *  type: "text"
 * }, {
 *  value: "@",
 *  type: "delimiter"
 * }]
 */
export function tokenizer(
  value: string,
  delimiters: string[],
): {
  value: string;
  type: 'text' | 'delimiter';
}[] {
  const result: {
    value: string;
    type: 'text' | 'delimiter';
  }[] = [];
  let temp = '';
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (_.includes(delimiters, char)) {
      if (temp) {
        result.push({
          value: temp,
          type: 'text',
        });
        temp = '';
      }
      result.push({
        value: char,
        type: 'delimiter',
      });
    } else {
      temp += char;
    }
  }
  if (temp) {
    result.push({
      value: temp,
      type: 'text',
    });
  }
  return result;
}

export function toString(val: any) {
  // ES 类型里 val 可能是被高亮处理的 React 元素
  if (React.isValidElement(val)) {
    return val;
  }
  if (typeof val === 'string') {
    return val;
  }
  try {
    return JSON.stringify(val);
  } catch (e) {
    return 'unknow';
  }
}
