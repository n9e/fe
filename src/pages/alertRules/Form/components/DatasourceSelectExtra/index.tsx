import React from 'react';
import { Form } from 'antd';
import _ from 'lodash';
import { IS_PLUS } from '@/utils/constant';
import { DatasourceCateEnum } from '@/utils/constant';

import * as CKMeta from '@/plugins/clickHouse/components/Meta';

// @ts-ignore
import DatasourceSelectExtra from 'plus:/components/DatasourceSelectExtra';

export default function index() {
  const datasourceCate = Form.useWatch('cate');
  const datasourceValue = Form.useWatch('datasource_value');

  if (IS_PLUS) {
    return <DatasourceSelectExtra datasourceCate={datasourceCate} datasourceValue={datasourceValue} />;
  } else {
    if (datasourceCate === DatasourceCateEnum.ck && datasourceValue !== undefined) {
      return <CKMeta.MetaModal datasourceValue={datasourceValue} />;
    }
  }

  return null;
}
