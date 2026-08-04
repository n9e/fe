import { HOST_PACK_TAG } from '@/components/OnboardingProgress/detect';

import { appendPackTag, buildAlertRuleImportBody, buildBoardImportBody } from './transform';

describe('appendPackTag', () => {
  it('appends the marker to the shipped Categraf tag', () => {
    expect(appendPackTag('Categraf')).toBe(`Categraf ${HOST_PACK_TAG}`);
  });

  it('is idempotent so re-importing does not duplicate the marker', () => {
    expect(appendPackTag(`Categraf ${HOST_PACK_TAG}`)).toBe(`Categraf ${HOST_PACK_TAG}`);
  });

  it('handles empty, whitespace-only and missing tags', () => {
    expect(appendPackTag('')).toBe(HOST_PACK_TAG);
    expect(appendPackTag('   ')).toBe(HOST_PACK_TAG);
    expect(appendPackTag(undefined)).toBe(HOST_PACK_TAG);
  });

  it('collapses irregular whitespace instead of producing empty tags', () => {
    expect(appendPackTag('  Categraf   Linux ')).toBe(`Categraf Linux ${HOST_PACK_TAG}`);
  });
});

describe('buildBoardImportBody', () => {
  const content = JSON.stringify({
    uuid: 1737103014612000,
    name: '机器常用指标（使用 Categraf 作为采集器）',
    tags: 'Categraf',
    ident: '',
    configs: { panels: [{ id: 'a' }], version: '3.0.0' },
  });

  it('stringifies configs — the backend boardForm.Configs is a string', () => {
    const body = buildBoardImportBody(content);
    expect(typeof body.configs).toBe('string');
    expect(JSON.parse(body.configs)).toEqual({ panels: [{ id: 'a' }], version: '3.0.0' });
  });

  it('carries the name through and stamps the pack marker onto tags', () => {
    const body = buildBoardImportBody(content);
    expect(body.name).toBe('机器常用指标（使用 Categraf 作为采集器）');
    expect(body.tags).toBe(`Categraf ${HOST_PACK_TAG}`);
  });

  it('keeps ident empty as shipped so it cannot collide with a user board ident', () => {
    expect(buildBoardImportBody(content).ident).toBe('');
  });

  it('unwraps a single-element array payload', () => {
    expect(buildBoardImportBody(`[${content}]`).name).toBe('机器常用指标（使用 Categraf 作为采集器）');
  });
});

describe('buildAlertRuleImportBody', () => {
  // 内置文件里的规则实际都是 disabled: 1，基础包必须翻成启用，否则「启用主机告警」永远点不亮
  const hostRule = JSON.stringify({ name: 'Lost connection with monitoring target', cate: 'host', disabled: 1, id: 7, group_id: 3, create_by: 'root' });
  const promRule = JSON.stringify({ name: '大于200G的盘，空间不足了', cate: 'prometheus', disabled: 1, update_at: 123 });

  it('enables the rule even though the shipped template is disabled', () => {
    expect(buildAlertRuleImportBody(promRule, {}).disabled).toBe(0);
    expect(buildAlertRuleImportBody(hostRule, {}).disabled).toBe(0);
  });

  it('strips server-owned fields so the import creates a fresh rule', () => {
    const body = buildAlertRuleImportBody(hostRule, {});
    expect(body).not.toHaveProperty('id');
    expect(body).not.toHaveProperty('group_id');
    expect(body).not.toHaveProperty('create_by');
    expect(buildAlertRuleImportBody(promRule, {})).not.toHaveProperty('update_at');
  });

  it('forces the new notify model and writes the chosen notification rules inline', () => {
    const body = buildAlertRuleImportBody(promRule, { notifyRuleIds: [5, 6] });
    expect(body.notify_version).toBe(1);
    // 直接写进导入 body 即生效：后端 alertRuleAddByImport 不会清 NotifyRuleIds
    expect(body.notify_rule_ids).toEqual([5, 6]);
  });

  it('applies the selected datasource to metric rules', () => {
    const queries = [{ match_type: 0, op: 'in', values: [1] }];
    expect(buildAlertRuleImportBody(promRule, { datasourceQueries: queries }).datasource_queries).toEqual(queries);
  });

  it('leaves host rules without a datasource — they do not query one', () => {
    const queries = [{ match_type: 0, op: 'in', values: [1] }];
    const body = buildAlertRuleImportBody(hostRule, { datasourceQueries: queries });
    expect(body.cate).toBe('host');
    expect(body.datasource_queries).toEqual([]);
  });

  it('defaults notify_rule_ids and datasource_queries to empty arrays', () => {
    const body = buildAlertRuleImportBody(promRule, {});
    expect(body.notify_rule_ids).toEqual([]);
    expect(body.datasource_queries).toEqual([]);
  });
});
