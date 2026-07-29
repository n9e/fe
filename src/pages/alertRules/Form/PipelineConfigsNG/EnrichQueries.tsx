import React from 'react';
import { Form } from 'antd';

import ESEnrichQueries from '@/plugins/elasticsearch/AlertRule/EnrichQueries';
import DorisEnrichQueries from '@/plugins/doris/AlertRule/EnrichQueries';
import { IS_PLUS } from '@/utils/constant';

// @ts-ignore
import SLSEnrichQueries from 'plus:/datasource/aliyunSLS/AlertRule/EnrichQueries';
// @ts-ignore
import CLSEnrichQueries from 'plus:/datasource/tencentCLS/AlertRule/EnrichQueries';

const ENABLED_DATASOURCE_CATES = ['elasticsearch', 'aliyun-sls', 'tencent-cls', 'doris'];

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
    </>
  );
}
