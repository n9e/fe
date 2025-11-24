import React, { useContext } from 'react';
import { Alert, Form } from 'antd';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import { DatasourceCateEnum } from '@/utils/constant';
import { VariableQuerybuilder as ClickHouse } from '@/plugins/clickHouse';
import { VariableQuerybuilder as Prometheus } from '@/plugins/prometheus';
import { VariableQuerybuilder as Elasticsearch } from '@/plugins/elasticsearch';

import { replaceDatasourceVariables } from '../utils/replaceTemplateVariables';

// @ts-ignore
import VariableQuerybuilderPro from 'plus:/parcels/Dashboard/VariableQuerybuilder';

export default function Querybuilder() {
  const { datasourceList } = useContext(CommonStateContext);
  const datasourceCate = Form.useWatch(['datasource', 'cate']);
  const datasourceValue = Form.useWatch(['datasource', 'value']);
  const currentdatasourceValue = replaceDatasourceVariables(datasourceValue, {
    datasourceList,
  });
  const subProps = {
    datasourceCate,
  };

  if (currentdatasourceValue === undefined) {
    if (datasourceValue === undefined) return null;
    return <Alert className='mb-2' type='warning' message={`Invalid datasource value ${datasourceValue}`} />;
  }

  if (datasourceCate === DatasourceCateEnum.prometheus) {
    return <Prometheus />;
  }
  if (datasourceCate === DatasourceCateEnum.elasticsearch) {
    return <Elasticsearch />;
  }
  if (datasourceCate === DatasourceCateEnum.ck) {
    return <ClickHouse />;
  }
  return <VariableQuerybuilderPro {...subProps} datasourceValue={currentdatasourceValue} />;
}
