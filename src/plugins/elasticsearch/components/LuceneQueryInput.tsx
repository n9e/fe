import React, { useState, useEffect } from 'react';
import { Input } from 'antd';
import classNames from 'classnames';
import _ from 'lodash';

interface Props {
  value?: string;
  onChange?: (value?: string) => void;
  onEnterPress?: (value?: string) => void;
}

/**
 * Lucene 模式专用的多行文本输入组件。
 * - 编辑时实时将 ` and ` / ` or ` / ` not ` / ` not:` 转为大写（UI 即时反馈）
 * - 仅在失焦或回车时才将最终值同步到外部（同 QueryInput 的行为）
 */
export default function LuceneQueryInput(props: Props) {
  const { value, onChange, onEnterPress } = props;
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const normalizeLuceneKeywords = (val: string): string => {
    let newValue = val;
    newValue = _.replace(newValue, /(['"])(.*?)\1| AND /gi, (match, quote) => (quote ? match : ' AND '));
    newValue = _.replace(newValue, /(['"])(.*?)\1| OR /gi, (match, quote) => (quote ? match : ' OR '));
    newValue = _.replace(newValue, /(['"])(.*?)\1| NOT /gi, (match, quote) => (quote ? match : ' NOT '));
    newValue = _.replace(newValue, /(['"])(.*?)\1| NOT:/gi, (match, quote) => (quote ? match : ' NOT:'));
    return newValue;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const raw = e.target.value;
    const normalized = normalizeLuceneKeywords(raw);
    // 实时更新内部 draft，让 UI 立即显示转换后的值
    setDraft(normalized);
  };

  const syncToExternal = () => {
    if (draft !== value) {
      onChange?.(draft);
    }
  };

  const handleBlur = () => {
    syncToExternal();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      syncToExternal();
      onEnterPress?.(draft);
    }
  };

  return (
    <Input.TextArea
      className={classNames('doris-log-explorer-query-input')}
      autoSize={{ minRows: 1, maxRows: 10 }}
      value={draft}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
}
