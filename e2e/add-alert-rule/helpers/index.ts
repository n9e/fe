import { expect, type Page } from '@playwright/test';

export * from './fill-trigger';

export async function selectFirstDatasourceFilterValue(page: Page, datasourceName: string) {
  // Current FormNG order: business group, append tags, datasource match type,
  // datasource operator, datasource values, cron pattern.
  const datasourceValueCombobox = page.getByRole('combobox').nth(4);
  await datasourceValueCombobox.click();
  await datasourceValueCombobox.fill(datasourceName);
  await page.keyboard.press('Enter');
  await expect(page.getByText(datasourceName).first()).toBeVisible();
}
