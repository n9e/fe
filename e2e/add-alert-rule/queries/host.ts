import { expect, type Page } from '@playwright/test';

import { selectAntSelectOption } from '../../helpers';
import type { AlertRuleConditionHandler, NormalizedAlertRuleConfig } from '../types';
import { openFormNgSection } from '../helpers';

const HOST_TRIGGER_LABELS: Record<string, string> = {
  target_miss: '机器失联',
  pct_target_miss: '机器集群失联',
  offset: '机器时间偏移',
};

function triggerTypeSelect(ruleSection: ReturnType<Page['locator']>, index: number) {
  return ruleSection.locator(`#rule_config_triggers_${index}_type`);
}

function triggerDurationInput(ruleSection: ReturnType<Page['locator']>, index: number) {
  return ruleSection.locator(`#rule_config_triggers_${index}_duration`);
}

function triggerPercentInput(ruleSection: ReturnType<Page['locator']>, index: number) {
  return ruleSection.locator(`#rule_config_triggers_${index}_percent`);
}

async function assertHostConditions(ruleSection: ReturnType<Page['locator']>, uiConfig: NormalizedAlertRuleConfig) {
  const querySelect = ruleSection.locator('#rule_config_queries_0_key');
  const querySelectRoot = querySelect.locator('xpath=ancestor-or-self::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
  await expect(querySelectRoot.locator('.ant-select-selection-item'), 'host query is all hosts').toHaveText('全部机器');

  const severityGroups = ruleSection.locator('.ant-radio-group');
  await expect(severityGroups, 'host trigger severity groups').toHaveCount(uiConfig.triggers.length);

  for (const [index, trigger] of uiConfig.triggers.entries()) {
    const triggerType = String(trigger.type);
    const triggerTypeName = HOST_TRIGGER_LABELS[triggerType];
    if (!triggerTypeName) {
      throw new Error(`TODO: unsupported host rule_config.triggers[${index}].type=${triggerType}`);
    }

    const typeSelectRoot = triggerTypeSelect(ruleSection, index).locator('xpath=ancestor-or-self::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
    await expect(typeSelectRoot.locator('.ant-select-selection-item'), `host trigger ${index} type`).toHaveText(triggerTypeName);
    await expect(triggerDurationInput(ruleSection, index), `host trigger ${index} duration`).toHaveValue(String(trigger.duration));

    if (triggerType === 'pct_target_miss') {
      await expect(triggerPercentInput(ruleSection, index), `host trigger ${index} percent`).toHaveValue(String(trigger.percent));
    } else {
      await expect(triggerPercentInput(ruleSection, index), `host trigger ${index} should not render percent`).toHaveCount(0);
    }

    const severity = String(trigger.severity);
    const severityRadio = severityGroups.nth(index).locator(`input[type="radio"][value="${severity}"]`);
    await expect(severityRadio, `host trigger ${index} severity ${severity}`).toBeChecked();
  }
}

export async function assertHostRuleConditions(page: Page, uiConfig: NormalizedAlertRuleConfig) {
  const ruleSection = await openFormNgSection(page, 'rule', '告警条件');
  await assertHostConditions(ruleSection, uiConfig);
}

const hostQuery: AlertRuleConditionHandler = async ({ page, uiConfig }) => {
  const queries = uiConfig.queries;
  const triggers = uiConfig.triggers;

  if (queries.length !== 1 || queries[0].key !== 'all_hosts') {
    throw new Error('TODO: host E2E currently supports one all_hosts query');
  }
  if (triggers.length === 0) {
    throw new Error('Missing rule_config.triggers for host alert rule');
  }

  const ruleSection = await openFormNgSection(page, 'rule', '告警条件');
  const triggerRemoveButtons = ruleSection.locator('.alert-rule-trigger-remove');
  const triggerTitle = ruleSection.locator('.ant-card-head-title').filter({ hasText: '告警条件' }).last();
  const addTriggerButton = triggerTitle.getByLabel('plus-circle');

  while ((await triggerRemoveButtons.count()) < triggers.length) {
    await expect(addTriggerButton, 'host trigger add button').toBeVisible();
    await addTriggerButton.click();
  }
  while ((await triggerRemoveButtons.count()) > triggers.length) {
    await triggerRemoveButtons.last().click();
  }

  for (const [index, trigger] of triggers.entries()) {
    const triggerType = String(trigger.type);
    const triggerTypeName = HOST_TRIGGER_LABELS[triggerType];
    if (!triggerTypeName) {
      throw new Error(`TODO: unsupported host rule_config.triggers[${index}].type=${triggerType}`);
    }

    const typeSelect = triggerTypeSelect(ruleSection, index);
    const typeSelectRoot = typeSelect.locator('xpath=ancestor-or-self::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
    const selectedType = await typeSelectRoot.locator('.ant-select-selection-item').textContent();
    if (selectedType?.trim() !== triggerTypeName) {
      await selectAntSelectOption(page, typeSelect, triggerTypeName);
    }

    const durationInput = triggerDurationInput(ruleSection, index);
    await expect(durationInput, `host trigger ${index} duration input`).toBeVisible();
    await durationInput.fill(String(trigger.duration));

    if (triggerType === 'pct_target_miss') {
      const percentInput = triggerPercentInput(ruleSection, index);
      await expect(percentInput, `host trigger ${index} percent input`).toBeVisible();
      await percentInput.fill(String(trigger.percent));
    }

    const severityGroups = ruleSection.locator('.ant-radio-group');
    const severityRadio = severityGroups.nth(index).locator(`input[type="radio"][value="${String(trigger.severity)}"]`);
    if (!(await severityRadio.isChecked())) {
      await severityRadio.locator('xpath=ancestor::label[contains(concat(" ", normalize-space(@class), " "), " ant-radio-wrapper ")]').click();
    }
    await expect(severityRadio, `host trigger ${index} severity`).toBeChecked();
  }

  await assertHostConditions(ruleSection, uiConfig);
};

export default hostQuery;
