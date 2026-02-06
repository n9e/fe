import React from 'react';

import { DatasourceCateEnum } from '@/utils/constant';
import { DefaultFormValuesControl, RenderCommonSettings } from '@/pages/logExplorer/types';

import Elasticsearch from '@/plugins/elasticsearch/ExplorerNG';

interface Props {
  tabKey: string;
  datasourceCate: DatasourceCateEnum;
  defaultFormValuesControl?: DefaultFormValuesControl;
  renderCommonSettings: RenderCommonSettings;
}

export default function index(props: Props) {
  const { tabKey, datasourceCate, defaultFormValuesControl, renderCommonSettings } = props;

  if (datasourceCate === DatasourceCateEnum.elasticsearch) {
    return <Elasticsearch tabKey={tabKey} defaultFormValuesControl={defaultFormValuesControl} renderCommonSettings={renderCommonSettings} />;
  }

  return null;
}
