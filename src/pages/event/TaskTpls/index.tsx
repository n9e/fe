import React from 'react';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Link } from 'react-router-dom';

export default function index({ eventDetail }) {
  const { t } = useTranslation('AlertCurEvents');
  if (_.isEmpty(eventDetail?.rule_config?.task_tpls)) return null;
  return (
    <div className='desc-row'>
      <div className='desc-label'>{t('detail.task_tpls.label')}：</div>
      <div className='desc-content'>
        {_.map(eventDetail?.rule_config?.task_tpls, (item) => {
          return (
            <Link key={item.tpl_id} href='_blank' to={`/job-tpls/${item.tpl_id}/detail`}>
              {item.tpl_name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
