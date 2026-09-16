// Copyright (c) 2014, Hugh Kennedy
// Based on code from https://github.com/hughsk/flat/blob/master/index.js
//
export default function flatten(target: object, opts?: { delimiter?: any; maxDepth?: any; safe?: any }): any {
  opts = opts || {};

  const delimiter = opts.delimiter || '.';
  // 未显式指定 maxDepth(含传 0 的 falsy 场景)时不限深;depth 随递归入参传递,回溯天然正确
  const maxDepth = opts.maxDepth || Infinity;
  const output: any = {};

  function step(object: any, prev: string | null, depth: number) {
    Object.keys(object).forEach((key) => {
      const value = object[key];
      const isarray = opts?.safe && Array.isArray(value);
      const type = Object.prototype.toString.call(value);
      const isobject = type === '[object Object]';

      const newKey = prev ? prev + delimiter + key : key;

      if (!isarray && isobject && Object.keys(value).length && depth < maxDepth) {
        return step(value, newKey, depth + 1);
      }

      if (isobject && Object.keys(value).length === 0) {
        output[newKey] = '{}';
        return;
      }
      output[newKey] = Array.isArray(value) ? JSON.stringify(value) : value;
    });
  }

  step(target, null, 1);

  return output;
}
