import React from 'react';
import { Form } from 'antd';
import { IS_PLUS } from '@/utils/constant';
import { DatasourceCateEnum } from '@/utils/constant';
import { replaceExpressionVars } from '@/pages/dashboard/VariableConfig/constant';
import * as CKMeta from '@/plugins/clickHouse/components/Meta';

// @ts-ignore
import DatasourceSelectExtra from 'plus:/components/DatasourceSelectExtra';

export default function index({ dashboardId, variableConfig }) {
  const datasourceCate = Form.useWatch('datasourceCate');
  const datasourceValue = Form.useWatch('datasourceValue');
  const curDatasourceValue = variableConfig ? replaceExpressionVars(datasourceValue, variableConfig, variableConfig.length, dashboardId) : datasourceValue;

  if (IS_PLUS) {
    return <DatasourceSelectExtra datasourceCate={datasourceCate} datasourceValue={curDatasourceValue} />;
  } else {
    if (datasourceCate === DatasourceCateEnum.ck && datasourceValue !== undefined) {
      return <CKMeta.MetaModal datasourceValue={datasourceValue} />;
    }
  }

  return null;
}
