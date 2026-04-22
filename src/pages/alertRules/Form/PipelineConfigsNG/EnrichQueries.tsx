import React from 'react';
import { Form } from 'antd';
import _ from 'lodash';

import ESEnrichQueries from '@/plugins/elasticsearch/AlertRule/EnrichQueries';
import DorisEnrichQueries from '@/plugins/doris/AlertRule/EnrichQueries';

import SLSEnrichQueries from 'plus:/datasource/aliyunSLS/AlertRule/EnrichQueries';
import CLSEnrichQueries from 'plus:/datasource/tencentCLS/AlertRule/EnrichQueries';

const ENABLED_DATASOURCE_CATES = ['elasticsearch', 'aliyun-sls', 'tencent-cls', 'doris'];

export default function EnrichQueries() {
  const datasourceCate = Form.useWatch(['cate']);

  if (!_.includes(ENABLED_DATASOURCE_CATES, datasourceCate)) return null;

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
