import React from 'react';
import { Form } from 'antd';
import _ from 'lodash';
import { IS_PLUS } from '@/utils/constant';

// @ts-ignore
import DatasourceSelectExtra from 'plus:/components/DatasourceSelectExtra';

export default function index() {
  const datasourceCate = Form.useWatch('cate');
  const datasourceValue = Form.useWatch('datasource_ids');
  const curDatasourceValue = _.isArray(datasourceValue) ? _.head(datasourceValue) : datasourceValue;

  if (IS_PLUS) {
    return <DatasourceSelectExtra datasourceCate={datasourceCate} datasourceValue={curDatasourceValue} />;
  }

  return null;
}
