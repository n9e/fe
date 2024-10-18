import React from 'react';
import { Form } from 'antd';
import { DatasourceCateEnum } from '@/utils/constant';
import { replaceExpressionVars } from '@/pages/dashboard/VariableConfig/constant';
// @ts-ignore
import * as MySQLMeta from 'plus:/datasource/mysql/components/Meta';
// @ts-ignore
import * as CKMeta from 'plus:/datasource/clickHouse/components/Meta';
// @ts-ignore
import * as OracleMeta from 'plus:/datasource/oracle/components/Meta';
// @ts-ignore
import * as Meta from 'plus:/components/Meta';

export default function index({ dashboardId, variableConfig }) {
  const datasourceCate = Form.useWatch('datasourceCate');
  const datasourceValue = Form.useWatch('datasourceValue');

  if (datasourceCate === DatasourceCateEnum.mysql && datasourceValue !== undefined) {
    const curDatasourceValue = variableConfig ? replaceExpressionVars(datasourceValue, variableConfig, variableConfig.length, dashboardId) : datasourceValue;
    return <MySQLMeta.MetaModal datasourceValue={curDatasourceValue} />;
  }
  if (datasourceCate === DatasourceCateEnum.ck && datasourceValue !== undefined) {
    const curDatasourceValue = variableConfig ? replaceExpressionVars(datasourceValue, variableConfig, variableConfig.length, dashboardId) : datasourceValue;
    return <CKMeta.MetaModal datasourceValue={curDatasourceValue} />;
  }
  if (datasourceCate === DatasourceCateEnum.influxDB && datasourceValue !== undefined) {
    const curDatasourceValue = variableConfig ? replaceExpressionVars(datasourceValue, variableConfig, variableConfig.length, dashboardId) : datasourceValue;
    return <Meta.MetaModal datasourceCate={DatasourceCateEnum.influxDB} datasourceValue={curDatasourceValue} />;
  }
  if (datasourceCate === DatasourceCateEnum.oracle && datasourceValue !== undefined) {
    const curDatasourceValue = variableConfig ? replaceExpressionVars(datasourceValue, variableConfig, variableConfig.length, dashboardId) : datasourceValue;
    return <OracleMeta.MetaModal datasourceCate={DatasourceCateEnum.oracle} datasourceValue={curDatasourceValue} />;
  }
  if (datasourceCate === DatasourceCateEnum.pgsql && datasourceValue !== undefined) {
    const curDatasourceValue = variableConfig ? replaceExpressionVars(datasourceValue, variableConfig, variableConfig.length, dashboardId) : datasourceValue;
    return <Meta.MetaModal datasourceCate={DatasourceCateEnum.pgsql} datasourceValue={curDatasourceValue} />;
  }
  return null;
}
