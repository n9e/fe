import React from 'react';
import { Form } from 'antd';
import { DatasourceCateEnum } from '@/utils/constant';
import { replaceExpressionVars } from '@/pages/dashboard/VariableConfig/constant';
// @ts-ignore
import * as meta from 'plus:/datasource/mysql/components/Meta';

export default function index({ dashboardId, variableConfig }) {
  const datasourceCate = Form.useWatch('datasourceCate');
  const datasourceValue = Form.useWatch('datasourceValue');

  if (datasourceCate === DatasourceCateEnum.mysql && datasourceValue !== undefined) {
    const curDatasourceValue = variableConfig ? replaceExpressionVars(datasourceValue, variableConfig, variableConfig.length, dashboardId) : datasourceValue;
    return <meta.MetaModal datasourceValue={curDatasourceValue} />;
  }
  return null;
}
