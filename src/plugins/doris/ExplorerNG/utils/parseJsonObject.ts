import { jsonLanguage } from '@codemirror/lang-json';

export default function parseJsonObject(text: string) {
  if (!text.trimStart().startsWith('{') || !text.trimEnd().endsWith('}')) return;

  try {
    // The editor parser can recover from malformed input, so validate strict JSON first.
    JSON.parse(text);
  } catch {
    return undefined;
  }

  return jsonLanguage.parser.parse(text);
}
