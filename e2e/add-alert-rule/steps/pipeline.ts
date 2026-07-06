import { expect, type Page } from '@playwright/test';

import { selectAntSelectOption } from '../../helpers';
import type { AiTap, AiWaitFor } from '../../types';
import type { NormalizedAlertRuleConfig, NormalizedRelabelConfig } from '../types';

async function selectPipeline(page: Page, pipelineName: string) {
  await page.getByRole('button', { name: /选择已有处理器/ }).click();
  const menu = page.locator('.ant-dropdown:not(.ant-dropdown-hidden)').last();
  await expect(menu, `pipeline dropdown for ${pipelineName}`).toBeVisible();
  await menu.getByText(pipelineName, { exact: true }).click();
  await expect(page.getByText(pipelineName).first(), `selected pipeline ${pipelineName}`).toBeVisible();
}

async function fillRelabelConfig(page: Page, relabel: NormalizedRelabelConfig, index: number) {
  const list = page.locator('.n9e-alert-relabel-list');
  await expect(list, 'Relabel list').toBeVisible();
  await list.getByRole('button').last().click();

  const item = page.locator('.n9e-alert-relabel-item').nth(index);
  await expect(item, `Relabel item ${index}`).toBeVisible();

  if (!(await item.locator('.ant-select-selection-item').filter({ hasText: relabel.action }).isVisible().catch(() => false))) {
    await selectAntSelectOption(page, item.getByRole('combobox', { name: /^action$/ }), relabel.action);
  }
  await item.getByRole('textbox', { name: /target_label/ }).fill(relabel.targetLabel);
  await item.getByRole('textbox', { name: /replacement/ }).fill(relabel.replacement);
  await item.getByRole('textbox', { name: /separator/ }).fill(relabel.separator);
  await item.getByRole('textbox', { name: /regex/ }).fill(relabel.regex);

  const sourceLabels = item.getByRole('combobox', { name: /source_labels/ });
  for (const label of relabel.sourceLabels) {
    await sourceLabels.click();
    await sourceLabels.fill(label);
    await page.keyboard.press('Enter');
    await expect(item.getByText(label).first(), `source label ${label}`).toBeVisible();
  }
}

async function addAnnotation(page: Page, key: string, value: string, index: number) {
  const addIcon = page.locator('xpath=(//*[normalize-space(.)="附加信息"])[last()]/following::*[contains(@class,"control-icon-normal")][1]');
  await addIcon.click();
  const combobox = page.locator(`xpath=((//*[normalize-space(.)="附加信息"])[last()]/following::*[@role="combobox"])[${index + 1}]`);
  await expect(combobox, `annotation key ${index}`).toBeVisible();
  await combobox.fill(key);
  await page.keyboard.press('Enter');

  const textarea = page.locator(`xpath=((//*[normalize-space(.)="附加信息"])[last()]/following::textarea)[${index + 1}]`);
  await expect(textarea, `annotation value ${index}`).toBeVisible();
  await textarea.fill(value);
}

/**
 * 填写事件处理卡片步骤：选择事件处理器、填写 Relabel 配置、填写附加信息（annotations）。
 *
 * 仅在 uiConfig.pipelineNames 或 eventRelabelConfigs 或 annotations 有内容时执行。
 */
export async function fillPipelineStep(page: Page, uiConfig: NormalizedAlertRuleConfig, aiTap: AiTap, aiWaitFor: AiWaitFor) {
  const hasPipeline = uiConfig.pipelineNames.length > 0;
  const hasRelabel = uiConfig.eventRelabelConfigs.length > 0;
  const hasAnnotations = Object.keys(uiConfig.annotations).length > 0;

  if (!hasPipeline && !hasRelabel && !hasAnnotations) {
    // 无事件处理配置，跳过此步骤
    return;
  }

  // 导航到事件处理卡片
  await aiTap('左侧配置步骤中的事件处理');
  await aiWaitFor('事件处理卡片已显示，包含处理器选择、Relabel 配置、附加信息等区域');

  // 选择事件处理器
  if (hasPipeline) {
    for (const pipelineName of uiConfig.pipelineNames) {
      await selectPipeline(page, pipelineName);
    }
  }

  if (hasRelabel) {
    if (!(await page.locator('.n9e-alert-relabel-list').isVisible().catch(() => false))) {
      const relabelTitle = page.getByText(/事件 Relabel|Relabel/).last();
      await expect(relabelTitle, 'Relabel section title').toBeVisible({ timeout: 5000 });
      await relabelTitle.click();
    }
    for (const [index, relabel] of uiConfig.eventRelabelConfigs.entries()) {
      await fillRelabelConfig(page, relabel, index);
    }
  }

  // 填写附加信息 (annotations)
  if (hasAnnotations) {
    for (const [index, annotation] of uiConfig.annotationEntries.entries()) {
      if (!annotation.value) continue;
      await addAnnotation(page, annotation.key, annotation.value, index);
    }
  }
}
