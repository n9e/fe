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

  return (
    <>
      {currentdatasourceValue === undefined && datasourceValue !== undefined && <Alert className='mb-2' type='warning' message={`Invalid datasource value ${datasourceValue}`} />}
      <div style={{ display: currentdatasourceValue === undefined ? 'none' : 'block' }}>
        {datasourceCate === DatasourceCateEnum.prometheus && <Prometheus />}
        {datasourceCate === DatasourceCateEnum.elasticsearch && <Elasticsearch />}
        {datasourceCate === DatasourceCateEnum.ck && <ClickHouse />}
        <VariableQuerybuilderPro {...subProps} datasourceValue={currentdatasourceValue!} />
      </div>
    </>
  );
}
