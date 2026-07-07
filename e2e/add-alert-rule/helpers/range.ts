import { expect, type Page } from '@playwright/test';

interface RelativeRange {
  start: string;
  end: string;
  display?: string;
}

const RANGE_LABEL_MAP: Array<{ start: string; end: string; label: string }> = [
  { start: 'now-5m', end: 'now', label: '最近 5 分钟' },
  { start: 'now-15m', end: 'now', label: '最近 15 分钟' },
  { start: 'now-30m', end: 'now', label: '最近 30 分钟' },
  { start: 'now-1h', end: 'now', label: '最近 1 小时' },
  { start: 'now-3h', end: 'now', label: '最近 3 小时' },
  { start: 'now-6h', end: 'now', label: '最近 6 小时' },
  { start: 'now-12h', end: 'now', label: '最近 12 小时' },
  { start: 'now-24h', end: 'now', label: '最近 24 小时' },
  { start: 'now-2d', end: 'now', label: '最近 2 天' },
  { start: 'now-7d', end: 'now', label: '最近 7 天' },
  { start: 'now-30d', end: 'now', label: '最近 30 天' },
  { start: 'now-90d', end: 'now', label: '最近 90 天' },
  { start: 'now/d', end: 'now/d', label: '今天' },
];

/**
 * 根据相对时间范围的 start/end 返回对应的 UI 展示标签。
 */
export function getRelativeRangeLabel(range: RelativeRange | undefined): string | undefined {
  if (!range) return undefined;
  const entry = RANGE_LABEL_MAP.find((r) => r.start === range.start && r.end === range.end);
  return entry?.label;
}

/**
 * 填充 "查询区间" 相对时间选择器。
 *
 * 点击 flashcat-timeRangePicker-target 按钮打开浮层，选择对应的标签文案后关闭浮层。
 * 如果按钮上已经显示目标标签，则跳过。
 */
export async function fillRelativeTimeRange(page: Page, range: RelativeRange | undefined, cateLabel = 'timeRange') {
  const label = getRelativeRangeLabel(range);
  if (!range || !label) {
    throw new Error(`TODO: ${cateLabel} rule_config.queries[0].range=${JSON.stringify(range)} is not supported by the E2E handler yet`);
  }

  const rangeGroup = page.locator('.ant-input-group').filter({ hasText: '查询区间' });
  const button = rangeGroup.locator('button.flashcat-timeRangePicker-target');
  await expect(button, `${cateLabel} query range picker`).toBeVisible();
  const currentText = (await button.innerText()).trim();
  if (currentText.includes(label)) return;

  await button.click();
  const popover = page.locator('.flashcat-timeRangePicker-container').last();
  await expect(popover, `${cateLabel} query range popover`).toBeVisible();
  await popover.getByText(label, { exact: true }).click();
  await expect(popover, `${cateLabel} query range popover should close`).toBeHidden();
}
