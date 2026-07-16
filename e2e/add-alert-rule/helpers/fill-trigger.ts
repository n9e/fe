import { expect, type Page } from '@playwright/test';

import { selectAntSelectOption } from '../../helpers';
import type { AiAssert, AiScroll, AiTap, AiWaitFor } from '../../types';
import type { NormalizedAlertRuleConfig } from '../types';

interface TriggerExpression {
  comparisonOperator?: string;
  logicalOperator?: string;
  ref?: string;
  value?: number | string;
}

export interface AlertRuleTrigger {
  exp?: string;
  expressions?: TriggerExpression[];
  mode: number;
  recover_config?: {
    judge_type?: number;
  };
  severityName?: string;
}

export interface BuilderTriggerDescriptions {
  scrollDescription: string;
  waitForDescription: string;
  comparisonFieldDescription: string;
  valueFieldDescription: string;
}

function triggerCard(page: Page, triggerIndex: number) {
  const ruleSection = page.locator('[data-section-key="rule"]');
  return ruleSection
    .locator(
      'xpath=.//*[contains(concat(" ", normalize-space(@class), " "), " ant-radio-group ") and .//*[normalize-space(.)="简单模式"] and .//*[normalize-space(.)="表达式模式"]]/ancestor::*[contains(concat(" ", normalize-space(@class), " "), " fc-border ") and contains(concat(" ", normalize-space(@class), " "), " rounded-lg ")][1]',
    )
    .nth(triggerIndex);
}

async function ensureTriggerCount(page: Page, count: number, aiTap: AiTap) {
  const ruleSection = page.locator('[data-section-key="rule"]');
  for (let index = 1; index < count; index += 1) {
    if ((await triggerCard(page, index).isVisible().catch(() => false))) continue;
    const addButton = ruleSection.getByRole('button', { name: /阈值判断|Threshold/ }).last();
    if (await addButton.isVisible().catch(() => false)) {
      await addButton.click();
    } else {
      await aiTap('添加阈值判断');
    }
    await expect(triggerCard(page, index), `trigger card ${index}`).toBeVisible();
  }
}

async function selectTriggerMode(page: Page, triggerIndex: number, modeName: string) {
  const card = triggerCard(page, triggerIndex);
  await expect(card, `trigger card ${triggerIndex}`).toBeVisible();
  const radio = card.getByRole('radio', { name: modeName });
  if (!(await radio.isChecked().catch(() => false))) {
    await card.getByText(modeName, { exact: true }).click();
    await expect(radio, `${modeName} radio checked for trigger ${triggerIndex}`).toBeChecked();
  }
}

/**
 * 填充 builder 模式下的一条 trigger（mode === 0）。
 * 使用 FormNG 新结构中的 trigger 卡片定位控件，避免依赖 AI 滚动找区域。
 */
export async function fillBuilderTrigger(
  trigger: AlertRuleTrigger,
  triggerIndex: number,
  page: Page,
  _descriptions?: BuilderTriggerDescriptions,
  _aiAssert?: AiAssert,
  _aiScroll?: AiScroll,
  _aiTap?: AiTap,
  _aiWaitFor?: AiWaitFor,
) {
  if (trigger.mode !== 0) {
    throw new Error(`TODO: rule_config.triggers[${triggerIndex}].mode=${trigger.mode} is not supported yet`);
  }

  const expressions = trigger.expressions || [];
  if (expressions.length !== 1) {
    throw new Error(`TODO: rule_config.triggers[${triggerIndex}].expressions length ${expressions.length} is not supported yet`);
  }

  const expression = expressions[0];
  if (expression.ref !== 'A') {
    throw new Error(`TODO: rule_config.triggers[${triggerIndex}].expressions[0].ref=${expression.ref} is not supported yet`);
  }

  await selectTriggerMode(page, triggerIndex, '简单模式');
  const card = triggerCard(page, triggerIndex);

  if (expression.comparisonOperator) {
    const comparisonSelect = card.getByRole('combobox').nth(1);
    const comparisonRoot = comparisonSelect.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
    if (!(await comparisonRoot.locator('.ant-select-selection-item').filter({ hasText: expression.comparisonOperator }).isVisible().catch(() => false))) {
      await selectAntSelectOption(page, comparisonSelect, expression.comparisonOperator);
    }
  }

  if (expression.value === undefined || expression.value === null) {
    throw new Error(`Missing rule_config.triggers[${triggerIndex}].expressions[0].value`);
  }
  await card.getByRole('spinbutton').first().fill(String(expression.value));

  if (trigger.severityName) {
    const severity = card.getByRole('radio', { name: trigger.severityName });
    if (!(await severity.isChecked().catch(() => false))) {
      await card.getByText(trigger.severityName, { exact: true }).click();
      await expect(severity, `trigger ${triggerIndex} severity ${trigger.severityName}`).toBeChecked();
    }
  }
}

/**
 * 填充 expression 模式下的一条 trigger（mode === 1）。
 * 使用 Playwright 原生定位器填写文本输入框。
 */
export async function fillExpressionTrigger(page: Page, triggerIndex: number, exp: string) {
  await selectTriggerMode(page, triggerIndex, '表达式模式');
  const card = triggerCard(page, triggerIndex);
  const editor = card.getByRole('textbox', { name: 'Editor content' }).first();
  await expect(editor, `trigger expression textbox for trigger index ${triggerIndex}`).toBeVisible();
  await editor.fill(exp);
}

/**
 * 填充所有 trigger。
 *
 * - mode === 0（builder 模式）：若提供了 ai 相关 fixture 则调用 fillBuilderTrigger，否则用 spinbutton 填写。
 * - mode === 1（expression 模式）：调用 fillExpressionTrigger。
 */
export async function fillTriggers(
  page: Page,
  uiConfig: NormalizedAlertRuleConfig,
  aiTap: AiTap,
  options?: {
    descriptions?: BuilderTriggerDescriptions;
    aiAssert?: AiAssert;
    aiScroll?: AiScroll;
    aiWaitFor?: AiWaitFor;
    queryCount?: number;
    /** 每个 trigger 填充后的额外校验，如 recover_config */
    postTriggerCheck?: (trigger: AlertRuleTrigger, triggerIndex: number) => void;
  },
) {
  const triggers = (uiConfig.triggers || []) as unknown as AlertRuleTrigger[];
  if (triggers.length === 0) {
    throw new Error(`Missing rule_config.triggers for ${uiConfig.cate} alert rule`);
  }

  await ensureTriggerCount(page, triggers.length, aiTap);

  for (let index = 0; index < triggers.length; index++) {
    const trigger = triggers[index];

    if (trigger.mode === 1) {
      const exp = trigger.exp;
      if (!exp) {
        throw new Error(`Missing rule_config.triggers[${index}].exp for code trigger`);
      }
      await fillExpressionTrigger(page, index, exp);
    } else {
      const expression = trigger.expressions?.[0];
      if (!expression) {
        throw new Error(`Missing rule_config.triggers[${index}].expressions[0] for builder trigger`);
      }
      if (expression.value === undefined || expression.value === null) {
        throw new Error(`Missing rule_config.triggers[${index}].expressions[0].value for builder trigger`);
      }
      await fillBuilderTrigger(trigger, index, page, options?.descriptions, options?.aiAssert, options?.aiScroll, aiTap, options?.aiWaitFor);
    }

    options?.postTriggerCheck?.(trigger, index);
  }
}
