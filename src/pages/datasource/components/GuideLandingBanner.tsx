import React, { useContext, useMemo, useState } from 'react';
import _ from 'lodash';
import { Alert } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';

import { GUIDE_LANDING_FROM } from '../nextActions';
import '../locale';

/**
 * 数据源引导的落地承接横幅。
 *
 * 「去创建仪表盘 / 去创建告警规则」只能跳到列表页 —— 真正的创建入口要先选业务组，
 * 引导侧给不出这个上下文。跳过去之后弹窗消失、落在一个陌生列表前，就是「突兀」的来源。
 * 这条横幅负责把话接上：告诉用户从哪来、下一步点哪儿、创建时数据源该选谁。
 *
 * 由仪表盘列表页与告警规则列表页各自渲染；无 __from=ds_guide 时什么都不画。
 */

interface Props {
  target: 'dashboard' | 'alert';
}

export default function GuideLandingBanner(props: Props) {
  const { t } = useTranslation('datasourceManage');
  const { target } = props;
  const location = useLocation();
  const { datasourceList } = useContext(CommonStateContext);
  const [closed, setClosed] = useState(false);

  const datasourceName = useMemo(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('__from') !== GUIDE_LANDING_FROM) return undefined;
    const id = _.toNumber(params.get('data_source_id'));
    // 名字取不到（列表还没加载/数据源已被删）也照常提示，只是不点名
    return _.get(_.find(datasourceList, { id }), 'name') ?? '';
  }, [location.search, datasourceList]);

  if (datasourceName === undefined || closed) return null;

  return (
    <Alert
      className='mb-2'
      type='info'
      showIcon
      closable
      onClose={() => {
        setClosed(true);
      }}
      message={datasourceName ? t('guide_landing.title', { name: datasourceName }) : t('guide_landing.title_unnamed')}
      description={
        <span>
          {t(target === 'dashboard' ? 'guide_landing.dashboard_desc' : 'guide_landing.alert_desc')}{' '}
          <Link to='/datasources'>{t('guide_landing.back')}</Link>
        </span>
      }
    />
  );
}
