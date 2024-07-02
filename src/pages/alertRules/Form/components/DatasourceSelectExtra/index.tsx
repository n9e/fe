import React from 'react';
import { Form } from 'antd';
import _ from 'lodash';
import { DatasourceCateEnum } from '@/utils/constant';
// @ts-ignore
import * as meta from 'plus:/datasource/mysql/components/Meta';

export default function index() {
  const datasourceCate = Form.useWatch('cate');
  const datasourceValue = Form.useWatch('datasource_ids');

  if (datasourceCate === DatasourceCateEnum.mysql && datasourceValue !== undefined) {
    const realDatasourceValue = _.isArray(datasourceValue) ? _.head(datasourceValue) : datasourceValue;
    return <meta.MetaModal datasourceValue={realDatasourceValue} />;
  }
  return null;
}
