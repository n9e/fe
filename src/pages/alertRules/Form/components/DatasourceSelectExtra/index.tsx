import React from 'react';
import { Form } from 'antd';
import _ from 'lodash';

import { DatasourceCateEnum } from '@/utils/constant';
import * as Meta from '@/components/Meta';
import * as CKMeta from '@/plugins/clickHouse/components/Meta';
import * as MySQLMeta from '@/plugins/mysql/components/Meta';

// @ts-ignore
import DatasourceSelectExtra from 'plus:/components/DatasourceSelectExtra';

export default function index() {
  const datasourceCate = Form.useWatch('cate');
  const datasourceValue = Form.useWatch('datasource_value');

  if (datasourceCate === DatasourceCateEnum.ck && datasourceValue !== undefined) {
    return <CKMeta.MetaModal datasourceValue={datasourceValue} />;
  }
  if (datasourceCate === DatasourceCateEnum.mysql && datasourceValue !== undefined) {
    return <MySQLMeta.MetaModal datasourceValue={datasourceValue} />;
  }
  if (datasourceCate === DatasourceCateEnum.pgsql && datasourceValue !== undefined) {
    return <Meta.MetaModal datasourceCate={datasourceCate} datasourceValue={datasourceValue} />;
  }
  if (datasourceCate === DatasourceCateEnum.doris && datasourceValue !== undefined) {
    return <Meta.MetaModal datasourceCate={datasourceCate} datasourceValue={datasourceValue} />;
  }
  return <DatasourceSelectExtra datasourceCate={datasourceCate} datasourceValue={datasourceValue} />;
}
