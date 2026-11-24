import { getHighlightFragmentRanges, type HighlightRange } from '@/pages/logExplorer/utils/highlight/highlight_html';

import parseJsonObject from './parseJsonObject';

type JsonNode = NonNullable<ReturnType<typeof parseJsonObject>>['topNode'];

function findProperty(node: JsonNode, key: string, text: string): JsonNode | undefined {
  if (node.name !== 'Object') return;
  let caseInsensitiveMatch: JsonNode | undefined;
  for (const property of node.getChildren('Property')) {
    const nameNode = property.getChild('PropertyName');
    if (!nameNode || !property.lastChild) continue;
    const name: string = JSON.parse(text.slice(nameNode.from, nameNode.to));
    if (name === key) return property.lastChild;
    if (name.toLowerCase() === key.toLowerCase()) caseInsensitiveMatch ??= property.lastChild;
  }
  return caseInsensitiveMatch;
}

function findNestedValue(node: JsonNode, path: string, text: string): JsonNode | undefined {
  // Doris checks the full key first because keys can contain dots.
  const direct = findProperty(node, path, text);
  if (direct) return direct;
  const dot = path.indexOf('.');
  if (dot < 0) return;
  const child = findProperty(node, path.slice(0, dot), text);
  return child && findNestedValue(child, path.slice(dot + 1), text);
}

function getValueRanges(node: JsonNode, text: string, fragments: string[]): HighlightRange[] {
  const encoded = text.slice(node.from, node.to);
  if (node.name === 'Number' || node.name === 'True' || node.name === 'False') {
    return getHighlightFragmentRanges(encoded, fragments).map(({ from, to }) => ({ from: node.from + from, to: node.from + to }));
  }
  if (node.name !== 'String') return [];

  const ranges = getHighlightFragmentRanges(JSON.parse(encoded), fragments);
  if (!ranges.length) return [];

  // Backend fragments refer to the decoded value. Map UTF-16 offsets back to the displayed JSON.
  const offsets = [node.from + 1];
  for (let i = node.from + 1; i < node.to - 1; ) {
    if (text[i] === '\\') {
      i += text[i + 1] === 'u' ? 6 : 2;
    } else {
      i += 1;
    }
    offsets.push(i);
  }
  return ranges.map(({ from, to }) => ({ from: offsets[from], to: offsets[to] }));
}

export default function resolveNestedHighlightRanges(fieldName: string, text: string, highlights: Record<string, string[]>): HighlightRange[] | undefined {
  const prefix = `${fieldName.toLowerCase()}.`;
  const descendants = Object.entries(highlights).filter(([field, fragments]) => field.toLowerCase().startsWith(prefix) && fragments.length > 0);
  if (!descendants.length) return;

  const root = parseJsonObject(text)?.topNode.getChild('Object');
  if (!root) return;

  return descendants.flatMap(([field, fragments]) => {
    const node = findNestedValue(root, field.slice(fieldName.length + 1), text);
    return node ? getValueRanges(node, text, fragments) : [];
  });
}
