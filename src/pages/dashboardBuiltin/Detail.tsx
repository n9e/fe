import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import queryString from 'query-string';
import PageLayout from '@/components/pageLayout';
import Detail from '@/pages/dashboard/Detail/Detail';
import { getDashboardCates } from './services';

export default function index() {
  const { t } = useTranslation('dashboardBuiltin');
  const { search } = useLocation<any>();
  const query = queryString.parse(search);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialValues, setInitialValues] = useState<any>(null);

  useEffect(() => {
    getDashboardCates()
      .then((res) => {
        const cateObj = _.find(res, (item) => item.name === query['__built-in-cate']);
        if (cateObj) {
          const ruleObj = _.find(cateObj.boards, (item) => item.name === query['__built-in-name']);
          if (ruleObj) {
            setInitialValues(ruleObj);
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return null;
  if (initialValues) {
    return <Detail isPreview isBuiltin gobackPath='/dashboards-built-in' builtinParams={initialValues} />;
  }
  return (
    <PageLayout title={t('title')} showBack backPath='/dashboards-built-in'>
      <div>{t('detail_no_result')}</div>
    </PageLayout>
  );
}
