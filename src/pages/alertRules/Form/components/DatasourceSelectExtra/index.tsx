import React from 'react';
import { Form } from 'antd';
import _ from 'lodash';

import { DatasourceCateEnum } from '@/utils/constant';
import * as Meta from '@/components/Meta';
import * as CKMeta from '@/plugins/clickHouse/components/Meta';
import * as MySQLMeta from '@/plugins/mysql/components/Meta';

// @ts-ignore
import DatasourceSelectExtra from 'plus:/components/DatasourceSelectExtra';

export default function index(props: { size?: 'small' | 'middle' | 'large' }) {
  const { size } = props;
  const datasourceCate = Form.useWatch('cate');
  const datasourceValue = Form.useWatch('datasource_value');

  if (datasourceCate === DatasourceCateEnum.ck && datasourceValue !== undefined) {
    return <CKMeta.MetaModal datasourceValue={datasourceValue} size={size} />;
  }
  if (datasourceCate === DatasourceCateEnum.mysql && datasourceValue !== undefined) {
    return <MySQLMeta.MetaModal datasourceValue={datasourceValue} size={size} />;
  }
  if (datasourceCate === DatasourceCateEnum.pgsql && datasourceValue !== undefined) {
    return <Meta.MetaModal datasourceCate={datasourceCate} datasourceValue={datasourceValue} size={size} />;
  }
  if (datasourceCate === DatasourceCateEnum.doris && datasourceValue !== undefined) {
    return <Meta.MetaModal datasourceCate={datasourceCate} datasourceValue={datasourceValue} size={size} />;
  }
  return <DatasourceSelectExtra datasourceCate={datasourceCate} datasourceValue={datasourceValue} size={size} />;
}
