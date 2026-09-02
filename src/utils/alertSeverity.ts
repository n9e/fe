import i18next from 'i18next';

export type AlertSeverity = 1 | 2 | 3;
export type AlertSeverityNames = Partial<Record<string, Partial<Record<AlertSeverity, string>>>>;

const severities: AlertSeverity[] = [1, 2, 3];
const defaults: Partial<Record<string, Partial<Record<AlertSeverity, string>>>> = {};

export function getDefaultAlertSeverityName(severity: number | undefined, language = i18next.language): string {
  if (!severities.includes(severity as AlertSeverity)) return '';
  return getDefaultName(language, severity as AlertSeverity);
}

function getDefaultName(language: string, severity: AlertSeverity): string {
  defaults[language] ||= {};
  if (!defaults[language]?.[severity]) {
    defaults[language]![severity] = (i18next.getResource(language, 'common', `severity.${severity}`) || i18next.t(`common:severity.${severity}`, { lng: language })) as string;
  }
  return defaults[language]![severity]!;
}

function getConfiguredName(names: AlertSeverityNames | undefined, language: string, severity: AlertSeverity): string | undefined {
  const value = names?.[language]?.[severity];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function normalizeAlertSeverityNames(value: unknown): AlertSeverityNames {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) return {};

  const normalized: AlertSeverityNames = {};
  Object.entries(value as Record<string, unknown>).forEach(([language, languageNames]) => {
    if (languageNames == null || typeof languageNames !== 'object' || Array.isArray(languageNames)) return;
    const levels: Partial<Record<AlertSeverity, string>> = {};
    severities.forEach((severity) => {
      const name = (languageNames as Record<string, unknown>)[severity];
      if (typeof name === 'string') levels[severity] = name;
    });
    normalized[language] = levels;
  });
  return normalized;
}

export function getAlertSeverityName(severity: number | undefined, language = i18next.language, names?: AlertSeverityNames): string {
  if (!severities.includes(severity as AlertSeverity)) return '';
  const normalizedSeverity = severity as AlertSeverity;
  return getConfiguredName(names || configuredNames, language, normalizedSeverity) || getDefaultAlertSeverityName(normalizedSeverity, language);
}

let configuredNames: AlertSeverityNames = {};

/**
 * 将站点配置同步到 i18next，使现有 common:severity.* 调用也自动获得自定义名称。
 * 保留原始翻译作为空值回退，且不跨语言读取配置。
 */
export function setAlertSeverityNames(names: AlertSeverityNames | undefined) {
  configuredNames = normalizeAlertSeverityNames(names);
  const languages = new Set([...Object.keys(i18next.store.data), ...Object.keys(configuredNames)]);
  languages.forEach((language) => {
    severities.forEach((severity) => {
      i18next.addResource(language, 'common', `severity.${severity}`, getConfiguredName(configuredNames, language, severity) || getDefaultName(language, severity));
    });
  });
}

export function getAlertSeverityByIncidentName(value: string | undefined): AlertSeverity | undefined {
  return value === 'Critical' ? 1 : value === 'Warning' ? 2 : value === 'Info' ? 3 : undefined;
}
