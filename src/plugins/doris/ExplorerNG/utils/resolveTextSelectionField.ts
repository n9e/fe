import type { TextSelectionField } from '@/pages/logExplorer/components/LogsViewer/types';
import type { Field } from '@/pages/logExplorer/types';

import parseJsonObject from './parseJsonObject';

export default function resolveTextSelectionField({
  fieldName,
  value,
  from,
  to,
  indexData,
}: {
  fieldName: string;
  value: string;
  from: number;
  to: number;
  indexData: Field[];
}): TextSelectionField | undefined {
  if (from < 0 || from >= to) return;
  const tree = parseJsonObject(value);
  if (!tree) return;

  try {
    const node = tree.resolveInner(from, 1);
    const isString = node.name === 'String';
    if (!isString && node.name !== 'Number' && node.name !== 'True' && node.name !== 'False') return;
    const quoteWidth = isString ? 1 : 0;
    if (from < node.from + quoteWidth || to > node.to - quoteWidth) return;

    const keys: string[] = [];
    for (let parent = node.parent; parent; parent = parent.parent) {
      if (parent.name === 'Array') return;
      if (parent.name === 'Property') {
        const key = parent.getChild('PropertyName');
        if (!key) return;
        keys.unshift(JSON.parse(value.slice(key.from, key.to)));
      }
    }

    if (keys.length === 0) return;

    const path = [fieldName, ...keys].join('.').toLowerCase();
    const match = indexData.find((field) => field.field.toLowerCase() === path);
    if (!match) return;

    const fragment = value.slice(from, to);
    return { fieldName: match.field, value: isString ? JSON.parse(`"${fragment}"`) : fragment };
  } catch {
    return undefined;
  }
}
