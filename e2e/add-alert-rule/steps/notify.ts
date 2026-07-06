import { expect, type Page } from '@playwright/test';

import { fillAntFormItemSpinButton, selectAntFormItemOption } from '../../helpers';
import type { AiTap } from '../../types';
import type { NormalizedAlertRuleConfig } from '../types';

/**
 * 填写通知配置步骤：通知规则、恢复通知、留观时长、重复通知间隔、最大发送次数。
 *
 * 仅在 uiConfig.notifyIsDefault 为 false 时执行。
 */
export async function fillNotifyStep(page: Page, uiConfig: NormalizedAlertRuleConfig, aiTap: AiTap) {
  if (uiConfig.notifyIsDefault) {
    return;
  }

  // 导航到通知配置卡片
  await aiTap('左侧配置步骤中的通知配置');
  // 等待通知配置卡片显示
  await page.waitForTimeout(500);

  // 选择通知规则
  if (uiConfig.notifyRuleNames.length > 0) {
    for (const ruleName of uiConfig.notifyRuleNames) {
      await selectAntFormItemOption(page, '通知规则', ruleName);
    }
  }

  // 启用恢复通知 — Switch 的 Form.Item 没有 label 属性，使用外层容器定位
  const notifyRecoveredSwitch = page.locator('.mb-4').filter({ hasText: '启用恢复通知' }).getByRole('switch');
  await expect(notifyRecoveredSwitch, '启用恢复通知 switch').toBeVisible();
  if ((await notifyRecoveredSwitch.isChecked()) !== uiConfig.notifyRecovered) {
    await notifyRecoveredSwitch.click();
  }

  // 留观时长 — 界面标签为中文 "留观时长（秒）"
  await fillAntFormItemSpinButton(page, '留观时长（秒）', uiConfig.recoverDuration);

  // 重复通知间隔 — 界面标签为 "重复通知间隔（分钟）"
  await fillAntFormItemSpinButton(page, '重复通知间隔（分钟）', uiConfig.notifyRepeatStep);

  // 最大发送次数
  await fillAntFormItemSpinButton(page, '最大发送次数', uiConfig.notifyMaxNumber);
}
