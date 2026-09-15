import i18next from 'i18next';

import { getAlertSeverityByIncidentName, getAlertSeverityName, normalizeAlertSeverityNames, setAlertSeverityNames } from './alertSeverity';

beforeAll(async () => {
  await i18next.init({
    lng: 'zh_CN',
    fallbackLng: false,
    resources: {
      zh_CN: { common: { severity: { 1: '一级告警（Critical）', 2: '二级告警（Warning）', 3: '三级告警（Info）' } } },
      en_US: { common: { severity: { 1: 'S1 (Critical)', 2: 'S2 (Warning)', 3: 'S3 (Info)' } } },
    },
  });
});

afterEach(() => setAlertSeverityNames({}));

describe('getAlertSeverityName', () => {
  it('uses the configured name for the current language', () => {
    setAlertSeverityNames({ zh_CN: { 1: '紧急告警' } });
    expect(getAlertSeverityName(1, 'zh_CN')).toBe('紧急告警');
    expect(i18next.t('common:severity.1', { lng: 'zh_CN' })).toBe('紧急告警');
  });

  it('does not read another language configuration', () => {
    setAlertSeverityNames({ zh_CN: { 1: '紧急告警' } });
    expect(getAlertSeverityName(1, 'en_US')).toBe('S1 (Critical)');
  });

  it('falls back when a configured value is blank', () => {
    setAlertSeverityNames({ zh_CN: { 2: '   ' } });
    expect(getAlertSeverityName(2, 'zh_CN')).toBe('二级告警（Warning）');
  });

  it('returns an empty string for an invalid severity', () => {
    expect(getAlertSeverityName(4, 'zh_CN')).toBe('');
  });

  it('normalizes only language maps with string severity names', () => {
    expect(normalizeAlertSeverityNames({ zh_CN: { 1: '紧急告警', 2: 2 }, en_US: [], invalid: 'name' })).toEqual({ zh_CN: { 1: '紧急告警' } });
  });

  it('maps incident severity names to alert severity numbers', () => {
    expect(getAlertSeverityByIncidentName('Critical')).toBe(1);
    expect(getAlertSeverityByIncidentName('Warning')).toBe(2);
    expect(getAlertSeverityByIncidentName('Info')).toBe(3);
    expect(getAlertSeverityByIncidentName('Unknown')).toBeUndefined();
  });
});
