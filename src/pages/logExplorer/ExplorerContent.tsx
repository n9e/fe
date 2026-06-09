import React from 'react';
import { Alert } from 'antd';
import { useTranslation } from 'react-i18next';

import { DatasourceCateEnum } from '@/utils/constant';
import { DefaultFormValuesControl, RenderCommonSettings } from '@/pages/logExplorer/types';
import { NAME_SPACE } from '@/pages/logExplorer/constants';

import Elasticsearch from '@/plugins/elasticsearch/ExplorerNG';

interface Props {
  tabKey: string;
  datasourceCate: DatasourceCateEnum;
  defaultFormValuesControl?: DefaultFormValuesControl;
  renderCommonSettings: RenderCommonSettings;
}

export default function index(props: Props) {
  const { tabKey, datasourceCate, defaultFormValuesControl, renderCommonSettings } = props;
  const { t } = useTranslation(NAME_SPACE);

  if (datasourceCate === DatasourceCateEnum.elasticsearch) {
    return <Elasticsearch tabKey={tabKey} defaultFormValuesControl={defaultFormValuesControl} renderCommonSettings={renderCommonSettings} />;
  }

  return <Alert showIcon className='m-4' type='error' message={t('unsupported_datasource_type', { type: datasourceCate })} />;
}
