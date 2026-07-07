import { expect, type Locator, type Page } from '@playwright/test';
import type { AiTap } from './types';

async function fillVisible(locator: Locator, value: string, description: string) {
  await expect(locator, `${description} should be visible`).toBeVisible();
  await locator.fill(value);
}

export function antFormItem(page: Page, label: string, index = 0) {
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

/** 向匹配 label 文本的 `.ant-input-group` 填入文本后按 Enter 确认（适用于 AutoComplete 类型的输入框）。 */
export async function fillAutoCompleteInputGroup(page: Page, label: string, value: string) {
  const inputGroup = page.locator('.ant-input-group').filter({ hasText: label });
  const input = inputGroup.locator('input').last();
  await fillVisible(input, value, `${label} input`);
  await page.keyboard.press('Enter');
}

/** 向 antd 表单项（`.ant-form-item`）中匹配 label 的文本输入框或文本域填入值。 */
export async function fillAntFormItemInput(page: Page, label: string, value: string, index = 0) {
  const input = antFormItem(page, label, index).locator('input:not([type="hidden"]), textarea').last();
  await fillVisible(input, value, `${label} form input`);
}

/** 向 antd 表单项中的数字输入框填入数值。 */
export async function fillAntFormItemSpinButton(page: Page, label: string, value: number | string, index = 0) {
  const input = antFormItem(page, label, index).getByRole('spinbutton').last();
  await fillVisible(input, String(value), `${label} form number input`);
}

/** 向 antd Select tags/multiple 表单项填入一个或多个值。 */
export async function fillAntFormItemTags(page: Page, label: string, values: string[], index = 0) {
  if (values.length === 0) return;
  const formItem = antFormItem(page, label, index);
  const combobox = formItem.getByRole('combobox').last();
  await expect(combobox, `${label} tags select`).toBeVisible();
  for (const value of values) {
    await combobox.click();
    await combobox.fill(value);
    await page.keyboard.press('Enter');
    await expect(formItem.locator('.ant-tag, .ant-select-selection-item').filter({ hasText: value }).first(), `${label} selected tag ${value}`).toBeVisible();
  }
}

/** 设置 antd 表单项内的 Switch。 */
export async function setAntFormItemSwitch(page: Page, label: string, checked: boolean, index = 0) {
  const switchControl = antFormItem(page, label, index).getByRole('switch').first();
  await expect(switchControl, `${label} switch`).toBeVisible();
  const current = await switchControl.isChecked();
  if (current !== checked) {
    await switchControl.click();
    await expect(switchControl, `${label} switch checked state`).toBeChecked({ checked });
  }
}

/** 用 Playwright 精确选择 antd Select / AutoComplete 表单项的选项。 */
export async function selectAntFormItemOption(page: Page, label: string, optionText: string, index = 0) {
  const combobox = antFormItem(page, label, index).getByRole('combobox').last();
  await combobox.click();
  await combobox.fill(optionText);
  const dropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
  await expect(dropdown, `dropdown for ${label}`).toBeVisible();
  const option = dropdown.getByText(optionText, { exact: true });
  if (await option.isVisible().catch(() => false)) {
    await option.click();
  } else {
    await page.keyboard.press('Enter');
  }
}

/** 设置 antd TimePicker 表单项或行内时间输入。 */
export async function fillTimePickerInput(input: Locator, value: string, description = 'time picker') {
  await expect(input, description).toBeVisible();
  await input.click();
  await input.fill(value);
  await input.press('Enter');
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

export async function selectAntSelectOption(page: Page, select: Locator, optionText: string) {
  const selectRoot = select.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
  const clickable = selectRoot.locator('.ant-select-selector').first();
  if (await clickable.isVisible().catch(() => false)) {
    await clickable.click();
  } else {
    await select.click();
  }
  const dropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
  await expect(dropdown, `dropdown for option ${optionText}`).toBeVisible();
  const option = dropdown.getByRole('option', { name: optionText }).first();
  if (await option.isVisible().catch(() => false)) {
    await option.click();
  } else {
    await dropdown.getByText(optionText, { exact: true }).first().click();
  }
  await expect(dropdown, `dropdown for option ${optionText} should close`).toBeHidden();
}

export async function selectAntSelectMultipleOption(page: Page, select: Locator, optionText: string) {
  const selectRoot = select.locator('xpath=ancestor-or-self::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
  await selectRoot.locator('.ant-select-selector').first().click();

  const dropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
  await expect(dropdown, `dropdown for option ${optionText}`).toBeVisible();

  const exactOptionText = new RegExp(`^${optionText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
  const option = dropdown.getByRole('option', { name: exactOptionText }).first();
  if (await option.isVisible().catch(() => false)) {
    await option.click();
  } else {
    await dropdown.locator('.ant-select-item-option-content').filter({ hasText: exactOptionText }).first().click();
  }

  if (await dropdown.isVisible().catch(() => false)) {
    await page.keyboard.press('Escape');
  }
  await expect(selectRoot.locator('.ant-select-selection-item').filter({ hasText: exactOptionText }).first(), `selected option ${optionText}`).toBeVisible();
}
