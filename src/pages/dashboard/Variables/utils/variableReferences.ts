import type { IDashboardConfig } from '../../types';

export interface VariableReferenceChange {
  path: string;
  before: string;
  after: string;
}

/** Escapes a variable name before it is embedded in a syntax-aware replacement expression. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Rewrites the three dashboard variable syntaxes while leaving expression references such as $A untouched. */
function rewriteReferenceText(value: string, oldName: string, newName: string): string {
  const escapedOldName = escapeRegExp(oldName);
  return value
    .replace(new RegExp(`\\$\\{${escapedOldName}\\}`, 'g'), `\${${newName}}`)
    .replace(new RegExp(`\\[\\[${escapedOldName}\\]\\]`, 'g'), `[[${newName}]]`)
    .replace(new RegExp(`\\$${escapedOldName}(?![A-Za-z0-9_])`, 'g'), `$${newName}`);
}

/** Returns a copy of the config with references renamed and every modified field recorded for UI feedback. */
export function renameVariableReferences(configs: IDashboardConfig, oldName: string, newName: string): { configs: IDashboardConfig; changes: VariableReferenceChange[] } {
  const changes: VariableReferenceChange[] = [];

  /** Recursively visits config values and excludes expression refs, whose $A syntax is not a dashboard variable. */
  const visit = (value: unknown, path: string, key?: string): unknown => {
    if (typeof value === 'string') {
      if (key === 'expression') return value;
      const next = rewriteReferenceText(value, oldName, newName);
      if (next !== value) changes.push({ path, before: value, after: next });
      return next;
    }
    if (Array.isArray(value)) return value.map((item, index) => visit(item, `${path}[${index}]`));
    if (value && typeof value === 'object') {
      return Object.entries(value).reduce<Record<string, unknown>>((result, [childKey, childValue]) => {
        result[childKey] = visit(childValue, path ? `${path}.${childKey}` : childKey, childKey);
        return result;
      }, {});
    }
    return value;
  };

  return {
    configs: visit(configs, '') as IDashboardConfig,
    changes,
  };
}

/** Counts variable references without mutating the dashboard config. */
export function countVariableReferences(configs: IDashboardConfig, name: string): number {
  // Use an impossible replacement marker so counting follows exactly the same traversal as renaming.
  return renameVariableReferences(configs, name, '__dashboard_variable_reference__').changes.length;
}
