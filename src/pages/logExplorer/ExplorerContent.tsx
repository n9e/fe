import React from 'react';

import { DatasourceCateEnum } from '@/utils/constant';
import { DefaultFormValuesControl, RenderCommonSettings } from '@/pages/logExplorer/types';

import Elasticsearch from '@/plugins/elasticsearch/ExplorerNG';
// @ts-ignore
import { ExplorerNG as BLSExplorerNG } from 'plus:/datasource/bceBLS';
// @ts-ignore
import { ExplorerNG as TLSExplorerNG } from 'plus:/datasource/volcTLS';

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

  if (datasourceCate === DatasourceCateEnum.bceBLS) {
    return <BLSExplorerNG tabKey={tabKey} defaultFormValuesControl={defaultFormValuesControl} renderCommonSettings={renderCommonSettings} />;
  }

  if (datasourceCate === DatasourceCateEnum.volcTLS) {
    return <TLSExplorerNG tabKey={tabKey} defaultFormValuesControl={defaultFormValuesControl} renderCommonSettings={renderCommonSettings} />;
  }

  return null;
}
