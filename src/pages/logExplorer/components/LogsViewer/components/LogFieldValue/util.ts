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
type TokenizeResult = {
  value: string;
  type: 'text' | 'delimiter';
  start: number;
  end: number;
}[];

// P0-5: 分词结果按 (value, delimiters) 记忆化。同一字段值在多次渲染间不需要重复分词。
const tokenizerCache = new Map<string, TokenizeResult>();
const TOKENIZER_CACHE_MAX = 2000;

export function tokenizer(value: string, delimiters: string[]): TokenizeResult {
  // 用 JSON.stringify(delimiters) 生成缓存键：delimiters.join('') 无分隔符，
  // 例如 [' ', ','] 与 [' ,'] 会生成相同前缀导致缓存键碰撞、返回错误分词。
  const cacheKey = `${JSON.stringify(delimiters)}\u0000${value}`;
  const cached = tokenizerCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  const result: TokenizeResult = [];
  let temp = '';
  let tokenStart = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (_.includes(delimiters, char)) {
      if (temp) {
        result.push({
          value: temp,
          type: 'text',
          start: tokenStart,
          end: i,
        });
        temp = '';
      }
      result.push({
        value: char,
        type: 'delimiter',
        start: i,
        end: i + 1,
      });
      tokenStart = i + 1;
    } else {
      if (!temp) {
        tokenStart = i;
      }
      temp += char;
    }
  }
  if (temp) {
    result.push({
      value: temp,
      type: 'text',
      start: tokenStart,
      end: value.length,
    });
  }
  if (tokenizerCache.size >= TOKENIZER_CACHE_MAX) {
    // 简单 FIFO 淘汰：删除最早插入的一条，防止长会话内存无限增长
    const firstKey = tokenizerCache.keys().next().value;
    if (firstKey !== undefined) {
      tokenizerCache.delete(firstKey);
    }
  }
  tokenizerCache.set(cacheKey, result);
  return result;
}

export function toString(val: string | number | boolean | object | null | undefined) {
  if (val === undefined) {
    return '';
  }
  if (typeof val === 'string') {
    return val;
  }
  try {
    const serialized = JSON.stringify(val);
    return typeof serialized === 'string' ? serialized : '';
  } catch (e) {
    return 'unknow';
  }
}
