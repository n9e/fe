import React from 'react';
import { Form } from 'antd';

import { DatasourceCateEnum } from '@/utils/constant';
import * as CKMeta from '@/plugins/clickHouse/components/Meta';
import * as MySQLMeta from '@/plugins/mysql/components/Meta';

// @ts-ignore
import DatasourceSelectExtra from 'plus:/components/DatasourceSelectExtra';

export default function index({ datasourceValue }: { datasourceValue?: number | string }) {
  const datasourceCate = Form.useWatch('datasourceCate');

  if (datasourceCate === DatasourceCateEnum.ck && datasourceValue !== undefined) {
    return <CKMeta.MetaModal datasourceValue={datasourceValue as number} />;
  }
  if (datasourceCate === DatasourceCateEnum.mysql && datasourceValue !== undefined) {
    return <MySQLMeta.MetaModal datasourceValue={datasourceValue as number} />;
  }
  return <DatasourceSelectExtra datasourceCate={datasourceCate} datasourceValue={datasourceValue as number} />;

  return null;
}
