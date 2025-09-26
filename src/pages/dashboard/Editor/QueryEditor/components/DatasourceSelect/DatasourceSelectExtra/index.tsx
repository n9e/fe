import React from 'react';
import { Form } from 'antd';

import { DatasourceCateEnum } from '@/utils/constant';
import * as CKMeta from '@/plugins/clickHouse/components/Meta';
import * as MySQLMeta from '@/plugins/mysql/components/Meta';

// @ts-ignore
import DatasourceSelectExtra from 'plus:/components/DatasourceSelectExtra';

export default function index({ datasourceValue }) {
  const datasourceCate = Form.useWatch('datasourceCate');

  if (datasourceCate === DatasourceCateEnum.ck && datasourceValue !== undefined) {
    return <CKMeta.MetaModal datasourceValue={datasourceValue} />;
  }
  if (datasourceCate === DatasourceCateEnum.mysql && datasourceValue !== undefined) {
    return <MySQLMeta.MetaModal datasourceValue={datasourceValue} />;
  }
  return <DatasourceSelectExtra datasourceCate={datasourceCate} datasourceValue={datasourceValue} />;

  return null;
}
