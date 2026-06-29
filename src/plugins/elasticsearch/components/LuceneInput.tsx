import React from 'react';
import { Input } from 'antd';
import type { InputProps } from 'antd';
import _ from 'lodash';

/**
 * Lucene 模式专用的 Input 组件。
 * 输入时自动将 ` and ` / ` or ` / ` not ` / ` not:` 转为大写，
 * 同时保护引号内的内容不被转换。
 */
export default function LuceneInput(props: InputProps) {
  const { onChange, ...rest } = props;

  const handleChange: InputProps['onChange'] = (e) => {
    let newValue = e.target.value;
    newValue = _.replace(newValue, /(['"])(.*?)\1| AND /gi, (match, quote) => (quote ? match : ' AND '));
    newValue = _.replace(newValue, /(['"])(.*?)\1| OR /gi, (match, quote) => (quote ? match : ' OR '));
    newValue = _.replace(newValue, /(['"])(.*?)\1| NOT /gi, (match, quote) => (quote ? match : ' NOT '));
    newValue = _.replace(newValue, /(['"])(.*?)\1| NOT:/gi, (match, quote) => (quote ? match : ' NOT:'));

    onChange?.({
      ...e,
      target: {
        ...e.target,
        value: newValue,
      },
    });
  };

  return <Input {...rest} onChange={handleChange} />;
}
