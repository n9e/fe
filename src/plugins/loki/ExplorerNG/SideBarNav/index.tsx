import React, { useEffect, useMemo } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { useRequest } from 'ahooks';

import { DatasourceCateEnum } from '@/utils/constant';
import FieldsList, { Field } from '@/pages/logExplorer/components/FieldsList';

import { getLabelNames } from '../services';

interface Props {
  datasourceValue: number;
  onFieldsChange: (fields: Field[]) => void;
}

export default function SideBarNav(props: Props) {
  const { datasourceValue, onFieldsChange } = props;
  const refreshKey = useMemo(() => `${datasourceValue || ''}`, [datasourceValue]);

  const { data, loading } = useRequest(
    () => {
      if (!datasourceValue) return Promise.resolve([]);
      const end = moment();
      const start = moment().subtract(24, 'hours');
      return getLabelNames({
        cate: DatasourceCateEnum.loki,
        datasource_id: datasourceValue,
        query: '{}',
        start: start.valueOf(),
        end: end.valueOf(),
        limit: 1000,
      }).then((fields) => {
        return _.map(fields, (field) => ({
          field: field.field,
          indexable: true,
          type: 'string',
        }));
      });
    },
    {
      refreshDeps: [refreshKey],
    },
  );

  useEffect(() => {
    onFieldsChange(data || []);
  }, [JSON.stringify(data || [])]);

  return (
    <div className='h-full flex flex-col flex-shrink-0'>
      <FieldsList
        loading={loading}
        organizeFieldNames={[]}
        fields={data || []}
        enableStats={false}
        onOperClick={() => {}}
        onValueFilter={undefined}
        fetchStats={undefined}
      />
    </div>
  );
}
