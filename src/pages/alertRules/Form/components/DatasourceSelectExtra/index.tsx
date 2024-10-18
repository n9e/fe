import React from 'react';
import { Form } from 'antd';
import _ from 'lodash';
import { DatasourceCateEnum } from '@/utils/constant';
// @ts-ignore
import * as MySQLMeta from 'plus:/datasource/mysql/components/Meta';
// @ts-ignore
import * as CKMeta from 'plus:/datasource/clickHouse/components/Meta';
// @ts-ignore
import * as OracleMeta from 'plus:/datasource/oracle/components/Meta';
// @ts-ignore
import * as Meta from 'plus:/components/Meta';

export default function index() {
  const datasourceCate = Form.useWatch('cate');
  const datasourceValue = Form.useWatch('datasource_ids');

  if (datasourceCate === DatasourceCateEnum.mysql && datasourceValue !== undefined) {
    const realDatasourceValue = _.isArray(datasourceValue) ? _.head(datasourceValue) : datasourceValue;
    return <MySQLMeta.MetaModal datasourceValue={realDatasourceValue} />;
  }
  if (datasourceCate === DatasourceCateEnum.ck && datasourceValue !== undefined) {
    const realDatasourceValue = _.isArray(datasourceValue) ? _.head(datasourceValue) : datasourceValue;
    return <CKMeta.MetaModal datasourceValue={realDatasourceValue} />;
  }
  if (datasourceCate === DatasourceCateEnum.influxDB && datasourceValue !== undefined) {
    const realDatasourceValue = _.isArray(datasourceValue) ? _.head(datasourceValue) : datasourceValue;
    return <Meta.MetaModal datasourceCate={DatasourceCateEnum.influxDB} datasourceValue={realDatasourceValue} />;
  }
  if (datasourceCate === DatasourceCateEnum.oracle && datasourceValue !== undefined) {
    const realDatasourceValue = _.isArray(datasourceValue) ? _.head(datasourceValue) : datasourceValue;
    return <OracleMeta.MetaModal datasourceCate={DatasourceCateEnum.oracle} datasourceValue={realDatasourceValue} />;
  }
  if (datasourceCate === DatasourceCateEnum.pgsql && datasourceValue !== undefined) {
    const realDatasourceValue = _.isArray(datasourceValue) ? _.head(datasourceValue) : datasourceValue;
    return <Meta.MetaModal datasourceCate={DatasourceCateEnum.pgsql} datasourceValue={realDatasourceValue} />;
  }
  return null;
}
