import { expect, type Locator, type Page } from '@playwright/test';
import type { AiTap } from './types';

async function fillVisible(locator: Locator, value: string, description: string) {
  await expect(locator, `${description} should be visible`).toBeVisible();
  await locator.fill(value);
}

function antFormItem(page: Page, label: string, index: number) {
  return page
    .locator('.ant-form-item')
    .filter({
      has: page.locator('label').filter({ hasText: label }),
    })
    .nth(index);
}

function xpathText(value: string) {
  if (!value.includes("'")) return `'${value}'`;
  if (!value.includes('"')) return `"${value}"`;
  return `concat(${value
    .split("'")
    .map((part) => `'${part}'`)
    .join(`, "'", `)})`;
}

/** 向匹配指定 label 文本的 `.ant-input-group` 输入框填入值。index 用于同页面多个同名组时区分。 */
export async function fillInputGroup(page: Page, label: string, value: string, index = 0) {
  const inputGroup = page.locator('.ant-input-group').filter({ hasText: label }).nth(index);
  const input = inputGroup.locator('input').last();
  await fillVisible(input, value, `${label} input`);
}

/** 向匹配指定 label 文本的 `.ant-input-group` 数字输入框（spinbutton）填入数值。 */
export async function fillInputGroupNumber(page: Page, label: string, value: number | string, index = 0) {
  const inputGroup = page.locator('.ant-input-group').filter({ hasText: label }).nth(index);
  const input = inputGroup.getByRole('spinbutton').last();
  await fillVisible(input, String(value), `${label} number input`);
}

/** 向 antd 表单项（`.ant-form-item`）中匹配 label 的文本输入框或文本域填入值。 */
export async function fillAntFormItemInput(page: Page, label: string, value: string, index = 0) {
  const input = antFormItem(page, label, index).locator('input:not([type="hidden"]), textarea').last();
  await fillVisible(input, value, `${label} form input`);
}

/** 定位紧跟指定文本节点之后的第 index 个 combobox，填入值后按 Enter 确认。 */
export async function fillComboboxAfterText(page: Page, label: string, value: string, index = 0) {
  const combobox = page.locator(`xpath=(//*[text()[normalize-space(.)=${xpathText(label)}]]/following::*[@role="combobox"])[${index + 1}]`);
  await fillVisible(combobox, value, `${label} combobox`);
  await page.keyboard.press('Enter');
}

/** 定位紧跟指定文本节点之后的第 index 个可见文本输入框（input 或 textarea），填入值。 */
export async function fillTextboxAfterText(page: Page, label: string, value: string, index = 0) {
  const textbox = page.locator(`xpath=(//*[text()[normalize-space(.)=${xpathText(label)}]]/following::*[(self::input and not(@type='hidden')) or self::textarea])[${index + 1}]`);
  await fillVisible(textbox, value, `${label} textbox`);
}

/** 按页面中 role=textbox 的顺序索引定位并填入值。index 越界时抛出可读错误。 */
export async function fillTextboxByIndex(page: Page, index: number, value: string, description = 'textbox') {
  const textboxes = page.getByRole('textbox');
  const count = await textboxes.count();
  if (count <= index) {
    throw new Error(`Cannot find ${description} at index ${index}. Found ${count} textbox(es).`);
  }
  await fillVisible(textboxes.nth(index), value, `${description} at index ${index}`);
}

/** 按页面中可见 input/textarea 的顺序索引定位并填入值（排除 hidden input）。 */
export async function fillTextInputByIndex(page: Page, index: number, value: string, description = 'text input') {
  const inputs = page.locator('input:not([type="hidden"]):visible, textarea:visible');
  const count = await inputs.count();
  if (count <= index) {
    throw new Error(`Cannot find ${description} at index ${index}. Found ${count} visible input(s).`);
  }
  await fillVisible(inputs.nth(index), value, `${description} at index ${index}`);
}

/** 按页面中可见 spinbutton 的顺序索引定位并填入数值。 */
export async function fillSpinButtonByIndex(page: Page, index: number, value: number | string, description = 'spinbutton') {
  const spinButtons = page.getByRole('spinbutton').filter({ visible: true });
  const count = await spinButtons.count();
  if (count <= index) {
    throw new Error(`Cannot find ${description} at index ${index}. Found ${count} visible spinbutton(s).`);
  }
  await fillVisible(spinButtons.nth(index), String(value), `${description} at index ${index}`);
}

/** 向页面中最后一个可见 spinbutton 填入数值。 */
export async function fillLastSpinButton(page: Page, value: number | string, description = 'spinbutton') {
  const spinButtons = page.getByRole('spinbutton').filter({ visible: true });
  const count = await spinButtons.count();
  if (count === 0) {
    throw new Error(`Cannot find ${description}. Found 0 visible spinbutton(s).`);
  }
  await fillVisible(spinButtons.last(), String(value), description);
}

/**
 * 通过 AI 点击展开 antd 下拉选择框，再 AI 点击目标选项。
 * @param fieldDescription - 用于 AI 定位下拉框的描述
 * @param optionText - 要选择的选项文本
 */
export async function selectAntOption(aiTap: AiTap, fieldDescription: string, optionText: string) {
  await aiTap(fieldDescription);
  await aiTap(`选项：${optionText}`, { deepLocate: true });
}
