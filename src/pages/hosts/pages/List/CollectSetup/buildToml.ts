import _ from 'lodash';

import { CollectComponent, CollectField } from './catalog';

/** 结构化表单的取值：顶层采集间隔 + 多实例，实例内以 field.key 为键 */
export interface CollectFormValues {
  interval?: number;
  instances: Array<Record<string, unknown>>;
}

/**
 * toml 基本字符串转义。生成的文件会被 root 运行的 categraf 解析，
 * 这里宁可保守：除引号反斜杠外，控制字符一并转义，密码里粘进换行也不会撑破一行。
 */
function tomlString(value: string): string {
  const escaped = value.replace(/[\\"\u0000-\u001f]/g, (ch) => {
    if (ch === '\\') return '\\\\';
    if (ch === '"') return '\\"';
    if (ch === '\n') return '\\n';
    if (ch === '\t') return '\\t';
    if (ch === '\r') return '\\r';
    return `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`;
  });
  return `"${escaped}"`;
}

function renderValue(field: CollectField, value: unknown): string | undefined {
  if (field.type === 'stringArray') {
    const arr = _.filter(_.map(Array.isArray(value) ? value : [], _.trim), (v) => v !== '');
    if (arr.length === 0) return undefined;
    return `[${arr.map(tomlString).join(', ')}]`;
  }
  if (field.type === 'boolean') {
    if (typeof value !== 'boolean') return undefined;
    // false 一般等同于插件默认值，只有字段声明过 default 时才显式写出
    if (!value && field.default === undefined) return undefined;
    return String(value);
  }
  if (field.type === 'number') {
    const num = typeof value === 'number' ? value : Number(_.trim(String(value ?? '')));
    if (String(value ?? '').trim() === '' || !Number.isFinite(num)) return undefined;
    return String(num);
  }
  const str = _.trim(String(value ?? ''));
  if (str === '') return undefined;
  return tomlString(str);
}

/**
 * 表单值 → 插件 toml。纯函数且幂等：不修改入参，相同输入产出相同文本。
 * `labels.<key>` 形式的字段会被合并成实例末尾的一张 labels 内联表。
 */
export function buildToml(component: CollectComponent, values: CollectFormValues): string {
  const lines: string[] = [`# managed by nightingale collect wizard (input.${component.name})`];
  if (typeof values.interval === 'number' && Number.isFinite(values.interval) && values.interval > 0) {
    lines.push(`interval = ${values.interval}`);
  }

  _.forEach(values.instances, (instance) => {
    if (!_.isPlainObject(instance)) return;
    lines.push('', '[[instances]]');

    const labelPairs: string[] = [];
    _.forEach(component.fields, (field) => {
      const rendered = renderValue(field, instance[field.key]);
      if (rendered === undefined) return;
      if (field.key.startsWith('labels.')) {
        labelPairs.push(`${field.key.slice('labels.'.length)}=${rendered}`);
      } else {
        lines.push(`${field.key} = ${rendered}`);
      }
    });

    _.forEach(component.instanceStatics, (value, key) => {
      lines.push(`${key} = ${typeof value === 'string' ? tomlString(value) : String(value)}`);
    });

    if (labelPairs.length > 0) {
      lines.push(`labels = { ${labelPairs.join(', ')} }`);
    }
  });

  return `${lines.join('\n')}\n`;
}
