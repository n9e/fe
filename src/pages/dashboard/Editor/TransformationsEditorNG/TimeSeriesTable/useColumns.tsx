import React from 'react';
import { Form } from 'antd';
import _ from 'lodash';

import { useGlobalState } from '@/pages/dashboard/globalState';
import normalizeData from '@/pages/dashboard/Renderer/Renderer/TableNG/utils/normalizeData';

export default function useColumns({ fieldName }: { fieldName: number }) {
  const [series] = useGlobalState('series');
  const transformations = Form.useWatch('transformationsNG');
  const beforeTransformation: any[] = _.slice(transformations, 0, fieldName);

  if (series) {
    const data = normalizeData(series, beforeTransformation);
    return _.union(_.flattenDeep(_.map(data, 'columns')));
  }

  return [];
}
