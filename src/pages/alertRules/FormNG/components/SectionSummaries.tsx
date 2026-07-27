import React from 'react';
import { Form } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { allCates, getCateDisplayLabel } from '@/components/AdvancedWrap/utils';

/**
 * SectionCard 折叠状态下标题右侧的一行配置摘要。
 * 只做轻量的字段级归纳，不请求接口；详细内容仍由侧栏 RuleSummary 承担。
 */

export function BasicSectionSummary() {
  const { t } = useTranslation('alertRules');
  const name = Form.useWatch('name');
  const appendTags = Form.useWatch('append_tags');

  const parts = [name || t('form_ng.section_summary.unnamed')];
  if (Array.isArray(appendTags) && appendTags.length > 0) {
    parts.push(t('form_ng.section_summary.tags_count', { count: appendTags.length }));
  }
  return <>{parts.join(' · ')}</>;
}

export function DatasourceSectionSummary() {
  const { t, i18n } = useTranslation('alertRules');
  const cate = Form.useWatch('cate');
  const datasourceQueries = Form.useWatch('datasource_queries');

  if (!cate) return null;
  const cateLabel = cate === 'host' ? 'Host' : getCateDisplayLabel(_.find(allCates, { value: cate }), i18n.language) || cate;
  const parts = [cateLabel];
  if (cate !== 'host') {
    const values = _.flatMap(Array.isArray(datasourceQueries) ? datasourceQueries : [], (query) => (Array.isArray(query?.values) ? query.values : []));
    if (_.includes(values, 0)) {
      parts.push(t('form_ng.section_summary.datasource_all'));
    } else {
      const idCount = _.uniq(_.filter(values, (value) => typeof value === 'number')).length;
      if (idCount > 0) parts.push(t('form_ng.section_summary.datasource_count', { count: idCount }));
    }
  }
  return <>{parts.join(' · ')}</>;
}

export function RuleSectionSummary() {
  const { t } = useTranslation('alertRules');
  const queries = Form.useWatch(['rule_config', 'queries']);
  const triggers = Form.useWatch(['rule_config', 'triggers']);

  const severities = _.sortBy(
    _.uniq(
      _.compact(
        _.concat(
          _.map(Array.isArray(triggers) ? triggers : [], 'severity'),
          // prometheus 旧版规则的 severity 挂在 query 上
          _.map(Array.isArray(queries) ? queries : [], 'severity'),
        ),
      ),
    ),
  );
  const parts: string[] = [];
  if (severities.length > 0) parts.push(_.map(severities, (severity) => `S${severity}`).join('/'));
  if (Array.isArray(queries) && queries.length > 0) parts.push(t('form_ng.section_summary.queries_count', { count: queries.length }));
  if (Array.isArray(triggers) && triggers.length > 0) parts.push(t('form_ng.section_summary.triggers_count', { count: triggers.length }));
  if (parts.length === 0) return <>{t('form_ng.section_summary.rule_empty')}</>;
  return <>{parts.join(' · ')}</>;
}
