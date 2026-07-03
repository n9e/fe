import type { Page } from '@playwright/test';

import { fillComboboxAfterText, fillInputGroup, fillInputGroupNumber, fillTextboxAfterText, selectAntOption, selectAntSelectOption } from '../../helpers';
import type { AiTap } from '../../types';
import type { AlertRuleConditionHandler, NormalizedQuery } from '../types';
import { fillTriggers, type AlertRuleTrigger } from '../helpers';

interface ElasticsearchGroupBy {
  cate?: string;
  field?: string;
  min_doc_count?: number;
  order?: string;
  order_by?: string;
  size?: number;
}

interface ElasticsearchQuery extends NormalizedQuery {
  date_field?: string;
  filter?: string;
  group_by?: ElasticsearchGroupBy[];
  index?: string;
  index_pattern?: number;
  index_type?: string;
  indexPatternName?: string;
  interval?: number;
  interval_unit?: 'second' | 'min' | 'hour';
  offset?: number;
  unit?: string;
  value?: {
    field?: string;
    func?: string;
  };
}

function getIntervalUnitLabel(unit: ElasticsearchQuery['interval_unit']) {
  if (unit === 'second') return '秒';
  if (unit === 'hour') return '小时';
  return '分钟';
}

async function fillQueryAdvancedSettings(page: Page, query: ElasticsearchQuery) {
  const unit = query.unit;
  const offset = query.offset;
  const needsUnit = Boolean(unit && unit !== 'none');
  const needsOffset = offset !== undefined && offset !== null;

  if (!needsUnit && !needsOffset) return;

  await page.getByText('辅助配置').filter({ visible: true }).click();

  if (unit && unit !== 'none') {
    const unitSelect = page.locator('.ant-input-group').filter({ hasText: '单位' }).getByRole('combobox');
    if (!(await unitSelect.isVisible({ timeout: 3000 }).catch(() => false))) {
      throw new Error(`Cannot set elasticsearch rule_config.queries[0].unit=${unit}: unit picker is not visible in this build`);
    }
    await unitSelect.click();
    await unitSelect.fill(unit);
    await page.keyboard.press('Enter');
  }

  if (offset !== undefined && offset !== null) {
    await fillInputGroupNumber(page, 'Offset', offset);
  }
}

async function addTermsGroupBy(page: Page, groupBy: ElasticsearchGroupBy, groupByIndex: number, aiTap: AiTap, fieldKeyIndexOffset = 0) {
  if (groupBy.cate !== 'terms') {
    throw new Error(`TODO: elasticsearch rule_config.queries[0].group_by[${groupByIndex}].cate=${groupBy.cate} is not supported yet`);
  }
  if (!groupBy.field) {
    throw new Error(`Missing elasticsearch rule_config.queries[0].group_by[${groupByIndex}].field`);
  }

  await aiTap('Group By 右侧的添加按钮');
  await fillInputGroup(page, 'Field key', groupBy.field, groupByIndex + fieldKeyIndexOffset);

  const needsAdvanced = groupBy.size !== undefined || groupBy.min_doc_count !== undefined || groupBy.order !== undefined || groupBy.order_by !== undefined;

  if (!needsAdvanced) return;

  await aiTap('Group By 分组行中的高级设置按钮');

  if (groupBy.size !== undefined) {
    await fillInputGroupNumber(page, '匹配个数', groupBy.size);
  }

  if (groupBy.min_doc_count !== undefined) {
    await fillInputGroupNumber(page, '文档最小值', groupBy.min_doc_count);
  }

  if (groupBy.order) {
    const orderLabel = groupBy.order === 'desc' ? 'Descend' : groupBy.order === 'asc' ? 'Ascend' : groupBy.order;
    await selectAntOption(aiTap, 'Order 下拉框', orderLabel);
  }

  if (groupBy.order_by) {
    const orderByLabel = groupBy.order_by === '_key' ? 'Term value' : groupBy.order_by === '_count' ? 'Count' : groupBy.order_by;
    await selectAntOption(aiTap, 'OrderBy 下拉框', orderByLabel);
  }
}

async function fillIndexSelector(page: Page, item: ElasticsearchQuery, queryIndex: number) {
  const indexType = item.index_type || 'index';

  if (indexType === 'index') {
    if (!item.index) {
      throw new Error('Missing elasticsearch rule_config.queries[0].index');
    }
    await fillComboboxAfterText(page, '索引', item.index);
    return;
  }

  if (indexType !== 'index_pattern') {
    throw new Error(`TODO: elasticsearch rule_config.queries[0].index_type=${item.index_type} is not supported yet`);
  }
  if (item.index_pattern === undefined) {
    throw new Error('Missing elasticsearch rule_config.queries[0].index_pattern');
  }
  if (!item.indexPatternName) {
    throw new Error(`Missing normalized elasticsearch rule_config.queries[0].index_pattern name for id ${item.index_pattern}`);
  }

  await selectAntSelectOption(page, page.getByTestId(`es-query-${queryIndex}-index-type-select`), '索引模式');
  await selectAntSelectOption(page, page.getByTestId(`es-query-${queryIndex}-index-pattern-select`), item.indexPatternName);
}

async function fillValue(page: Page, item: ElasticsearchQuery, aiTap: AiTap) {
  const func = item.value?.func || 'count';
  if (func !== 'count') {
    await selectAntOption(aiTap, '数值提取函数下拉框', func);
  }

  if (func === 'count' || func === 'rawData') return;

  if (!item.value?.field) {
    throw new Error(`Missing elasticsearch rule_config.queries[0].value.field for value.func=${func}`);
  }
  await fillInputGroup(page, 'Field key', item.value.field);
}

const query: AlertRuleConditionHandler = async ({ page, uiConfig, aiAssert, aiScroll, aiTap, aiWaitFor }) => {
  if (!aiAssert || !aiScroll || !aiTap || !aiWaitFor) {
    throw new Error('Missing Midscene aiAssert/aiScroll/aiTap/aiWaitFor fixtures for elasticsearch alert rule handler');
  }

  if (uiConfig.queries.length !== 1) {
    throw new Error(`TODO: elasticsearch rule_config.queries length ${uiConfig.queries.length} is not supported yet`);
  }

  const item = uiConfig.queries[0] as ElasticsearchQuery;
  if (item.ref !== 'A') {
    throw new Error(`TODO: elasticsearch rule_config.queries[0].ref=${item.ref} is not supported yet`);
  }
  if ((item.index_type || 'index') === 'index' && !item.date_field) {
    throw new Error('Missing elasticsearch rule_config.queries[0].date_field');
  }

  await aiTap('左侧配置步骤中的告警条件');
  await aiWaitFor('告警条件区域已显示，并且可以看到查询统计、索引、过滤条件、日期字段和时间间隔');
  await aiAssert('存在查询统计');

  await fillIndexSelector(page, item, 0);
  await fillTextboxAfterText(page, '过滤条件', item.filter || '');
  if ((item.index_type || 'index') === 'index') {
    await fillComboboxAfterText(page, '日期字段', item.date_field!);
  }

  if (item.interval !== undefined) {
    await fillInputGroupNumber(page, '时间间隔', item.interval);
    const intervalUnitLabel = getIntervalUnitLabel(item.interval_unit);
    if (intervalUnitLabel !== '分钟') {
      await selectAntOption(aiTap, '时间间隔单位下拉框', intervalUnitLabel);
    }
  }

  await aiAssert('存在数值提取');
  await fillValue(page, item, aiTap);

  const groupByFieldKeyIndexOffset = item.value?.func && item.value.func !== 'count' && item.value.func !== 'rawData' ? 1 : 0;

  for (const [index, groupBy] of (item.group_by || []).entries()) {
    await addTermsGroupBy(page, groupBy, index, aiTap, groupByFieldKeyIndexOffset);
  }

  await fillQueryAdvancedSettings(page, item);

  await fillTriggers(page, uiConfig, aiTap, {
    descriptions: {
      scrollDescription: '向下滚动到告警条件的阈值判断区域',
      waitForDescription: '可以看到告警条件区域中的简单模式、比较符下拉框和阈值数值输入框',
      comparisonFieldDescription: '简单模式中的比较符下拉框',
      valueFieldDescription: '简单模式中的阈值数值输入框',
    },
    aiAssert,
    aiScroll,
    aiWaitFor,
    postTriggerCheck: (trigger: AlertRuleTrigger) => {
      if (trigger.recover_config && trigger.recover_config.judge_type !== 0) {
        throw new Error(`TODO: elasticsearch rule_config.triggers.recover_config.judge_type=${trigger.recover_config.judge_type} is not supported yet`);
      }
    },
  });
};

export default query;
