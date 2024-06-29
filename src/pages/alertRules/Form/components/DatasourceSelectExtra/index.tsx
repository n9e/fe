import React from 'react';
import { Form } from 'antd';
import { DatasourceCateEnum } from '@/utils/constant';
// @ts-ignore
import * as meta from 'plus:/datasource/mysql/components/Meta';

export default function index() {
  const datasourceCate = Form.useWatch('cate');
  const datasourceValue = Form.useWatch('datasource_ids');

  if (datasourceCate === DatasourceCateEnum.mysql && datasourceValue !== undefined) {
    return <meta.MetaModal datasourceValue={datasourceValue} />;
  }
  return null;
}
