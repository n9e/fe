import React from 'react';
import { Form } from 'antd';

import ESEnrichQueries from '@/plugins/elasticsearch/AlertRule/EnrichQueries';
import DorisEnrichQueries from '@/plugins/doris/AlertRule/EnrichQueries';
import { IS_PLUS } from '@/utils/constant';

// @ts-ignore
import SLSEnrichQueries from 'plus:/datasource/aliyunSLS/AlertRule/EnrichQueries';
// @ts-ignore
import CLSEnrichQueries from 'plus:/datasource/tencentCLS/AlertRule/EnrichQueries';
// @ts-ignore
import SQLEnrichQueries from 'plus:/parcels/AlertRule/SQLEnrichQueries';

// oracle / sqlserver / redshift / mysql / pgsql 的查询体都只有一条 SQL，共用一个组件
const SQL_DATASOURCE_CATES = ['oracle', 'sqlserver', 'redshift', 'mysql', 'pgsql'];
const ENABLED_DATASOURCE_CATES = ['elasticsearch', 'aliyun-sls', 'tencent-cls', 'doris', ...SQL_DATASOURCE_CATES];

export default function EnrichQueries() {
  const datasourceCate = Form.useWatch(['cate']);

  if (!IS_PLUS || !ENABLED_DATASOURCE_CATES.includes(datasourceCate)) return null;

  return (
    <>
      <div
        className='my-4'
        style={{
          borderBottom: '1px solid var(--fc-border-color)',
        }}
      />
      {datasourceCate === 'elasticsearch' && <ESEnrichQueries />}
      {datasourceCate === 'aliyun-sls' && <SLSEnrichQueries />}
      {datasourceCate === 'tencent-cls' && <CLSEnrichQueries />}
      {datasourceCate === 'doris' && <DorisEnrichQueries />}
      {SQL_DATASOURCE_CATES.includes(datasourceCate) && <SQLEnrichQueries cate={datasourceCate} />}
    </>
  );
}
