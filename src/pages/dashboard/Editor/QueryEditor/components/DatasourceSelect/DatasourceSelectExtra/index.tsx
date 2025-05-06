import React, { useContext } from 'react';
import { Form } from 'antd';
import { CommonStateContext } from '@/App';
import { IS_PLUS } from '@/utils/constant';
import { DatasourceCateEnum } from '@/utils/constant';
import { replaceExpressionVars } from '@/pages/dashboard/VariableConfig/constant';
import * as CKMeta from '@/plugins/clickHouse/components/Meta';

// @ts-ignore
import DatasourceSelectExtra from 'plus:/components/DatasourceSelectExtra';

export default function index({ dashboardId, variableConfig }) {
  const { datasourceList } = useContext(CommonStateContext);
  const datasourceCate = Form.useWatch('datasourceCate');
  const datasourceValue = Form.useWatch('datasourceValue');
  const curDatasourceValue = variableConfig
    ? replaceExpressionVars({
        text: datasourceValue,
        variables: variableConfig,
        limit: variableConfig.length,
        dashboardId,
        datasourceList,
      })
    : datasourceValue;

  if (datasourceCate === DatasourceCateEnum.ck && curDatasourceValue !== undefined) {
    return <CKMeta.MetaModal datasourceValue={curDatasourceValue} />;
  } else if (IS_PLUS) {
    return <DatasourceSelectExtra datasourceCate={datasourceCate} datasourceValue={curDatasourceValue} />;
  }

  return null;
}
