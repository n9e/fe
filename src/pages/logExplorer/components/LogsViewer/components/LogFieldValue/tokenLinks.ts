import get from 'lodash/get';
import type { FieldConfigVersion2 } from '@/pages/log/IndexPatterns/types';

/** Restrict extracted-field drilldowns to their value, not every word of the source field. */
export function getTokenLinks(field: string, value: unknown, segmented: boolean, rawValue?: Record<string, unknown>, config?: FieldConfigVersion2) {
  return config?.linkArr?.filter((link) => {
    if (link.field !== field) return false;
    // Tables and unsegmented fields retain their existing whole-field links.
    if (!segmented) return true;
    const variables = Array.from(link.urlTemplate.matchAll(/\$(?:\{([^}]+)\}|([\w.]+))/g), (match) => match[1] || match[2]);
    const extracts = config.regExtractArr?.filter((rule) => rule.field === field && variables.includes(rule.newField)) || [];
    if (!extracts.length) return true;
    return extracts.some((rule) => {
      const source = rawValue?.[rule.field] ?? get(rawValue, rule.field.split('.'));
      if (typeof source !== 'string') return false;
      try {
        const extracted = new RegExp(rule.reg).exec(source)?.[1];
        return !!extracted && extracted === String(value);
      } catch {
        // An invalid extraction must not turn every token into a broken link.
        return false;
      }
    });
  });
}
