import { expect, type Page, type Locator } from '@playwright/test';

export async function selectOptionClick(page: Page, selectElement: Locator, optionLabel: string) {
  // Always click selector container to avoid input being covered by selection item.
  const selectRoot = selectElement.locator('xpath=ancestor-or-self::*[contains(concat(" ", normalize-space(@class), " "), " ant-select ")][1]');
  const selector = selectRoot.locator('.ant-select-selector').first();

  if (await selector.count()) {
    await selector.click();
  } else {
    await selectElement.click();
  }

  const selectDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
  await expect(selectDropdown).toBeVisible();
  await selectDropdown.locator('.ant-select-item-option').filter({ hasText: optionLabel }).first().click();
}
