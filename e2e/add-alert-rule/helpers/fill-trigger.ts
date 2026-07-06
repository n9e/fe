import { expect, type Page } from '@playwright/test';

import { fillLastSpinButton, fillSpinButtonByIndex, fillTextboxByIndex, selectAntOption } from '../../helpers';
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

/**
 * 填充 builder 模式下的一条 trigger（mode === 0）。
 * 使用 Midscene AI 完成：滚动到区域、AI 断言、选择比较符、填入阈值。
 */
export async function fillBuilderTrigger(
  trigger: AlertRuleTrigger,
  triggerIndex: number,
  page: Page,
  descriptions: BuilderTriggerDescriptions,
  aiAssert: AiAssert,
  aiScroll: AiScroll,
  aiTap: AiTap,
  aiWaitFor: AiWaitFor,
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

  await aiScroll({ direction: 'down' }, descriptions.scrollDescription);
  await aiWaitFor(descriptions.waitForDescription);
  await expect(page.getByRole('radio', { name: '简单模式' })).toBeChecked();

  if (expression.comparisonOperator) {
    await selectAntOption(aiTap, descriptions.comparisonFieldDescription, expression.comparisonOperator);
  }

  if (expression.value === undefined || expression.value === null) {
    throw new Error(`Missing rule_config.triggers[${triggerIndex}].expressions[0].value`);
  }
  await fillLastSpinButton(page, expression.value, descriptions.valueFieldDescription);

  if (trigger.severityName) {
    await aiAssert(`存在${trigger.severityName}`);
  }
}

/**
 * 填充 expression 模式下的一条 trigger（mode === 1）。
 * 使用 Playwright 原生定位器填写文本输入框。
 */
export async function fillExpressionTrigger(page: Page, triggerIndex: number, exp: string, queryCount: number) {
  await fillTextboxByIndex(page, queryCount + triggerIndex, exp, `trigger expression textbox for trigger index ${triggerIndex}`);
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

  const hasAI = Boolean(options?.aiAssert && options?.aiScroll && options?.aiWaitFor);
  const desc = options?.descriptions;
  const queryCount = options?.queryCount ?? uiConfig.queries.length;

  for (let index = 0; index < triggers.length; index++) {
    const trigger = triggers[index];
    if (index > 0) {
      await aiTap('添加阈值判断');
      await page.waitForTimeout(300);
    }

    if (trigger.mode === 1) {
      // expression 模式
      await aiTap('表达式模式');
      const exp = trigger.exp;
      if (!exp) {
        throw new Error(`Missing rule_config.triggers[${index}].exp for code trigger`);
      }
      await fillExpressionTrigger(page, index, exp, queryCount);
    } else if (hasAI && desc) {
      // builder 模式 + AI
      await fillBuilderTrigger(trigger, index, page, desc, options.aiAssert, options.aiScroll, aiTap, options.aiWaitFor);
    } else {
      // builder 模式 + 简单 Playwright 定位器
      const expression = trigger.expressions?.[0];
      if (!expression) {
        throw new Error(`Missing rule_config.triggers[${index}].expressions[0] for builder trigger`);
      }
      if (expression.value === undefined || expression.value === null) {
        throw new Error(`Missing rule_config.triggers[${index}].expressions[0].value for builder trigger`);
      }
      await fillSpinButtonByIndex(page, index, expression.value, `trigger value spinbutton for trigger index ${index}`);
    }

    if (trigger.severityName && !hasAI) {
      // AI 模式下 fillBuilderTrigger 内部已处理 severityName，这里避免重复
      await aiTap(trigger.severityName);
    }

    options?.postTriggerCheck?.(trigger, index);
  }
}
