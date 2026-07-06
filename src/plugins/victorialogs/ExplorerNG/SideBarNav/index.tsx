import React, { useEffect, useMemo } from 'react';
import _ from 'lodash';
import { Form, Tooltip } from 'antd';
import { InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useRequest } from 'ahooks';

import { DatasourceCateEnum } from '@/utils/constant';
import { parseRange } from '@/components/TimeRangePicker';
import FieldsList, { Field } from '@/pages/logExplorer/components/FieldsList';
import { LOGS_OPTIONS_CACHE_KEY } from '../constants';
import { dsQuery, getStreamFields } from '../services';
import { deriveFieldStatsBase, injectTimeRangeFilter, renderFieldStatsQL, renderFieldTotalQL } from '../utils/logsQL';
import { getOptionsFromLocalstorage } from '../utils/optionsLocalstorage';

interface Props {
  datasourceValue: number;
  onFieldsChange: (fields: Field[]) => void;
}

function getNumberFromDataResp(resp: any[], key: string) {
  const first = _.first(resp);
  const value = _.get(first, 'values[0][1]');
  if (value !== undefined) return _.toNumber(value);
  const metricValue = _.get(first, ['metric', key]);
  return metricValue !== undefined ? _.toNumber(metricValue) : 0;
}

export default function SideBarNav(props: Props) {
  const { datasourceValue, onFieldsChange } = props;
  const form = Form.useFormInstance();
  const queryValues = Form.useWatch('query', form);
  const refreshKey = useMemo(() => `${datasourceValue || ''}`, [datasourceValue]);

  const { data, loading } = useRequest(
    () => {
      if (!datasourceValue) return Promise.resolve([]);
      const end = moment();
      const start = moment().subtract(24, 'hours');
      return getStreamFields({
        cate: DatasourceCateEnum.victorialogs,
        datasource_id: datasourceValue,
        query: '*',
        start: start.unix(),
        end: end.unix(),
      }).then((fields) => {
        return _.map(fields, (field) => ({
          field,
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
        onOperClick={() => {}}
        onValueFilter={undefined}
        fetchStats={async (record) => {
          const options = getOptionsFromLocalstorage(LOGS_OPTIONS_CACHE_KEY);
          const topNumber = options.topNumber ?? 5;
          const latestQueryValues = form.getFieldValue('query') || {};
          const derived = deriveFieldStatsBase(latestQueryValues.query, record.field);
          if (!derived.ok) {
            return {
              topNumber,
              topN: [],
            };
          }

          try {
            const range = parseRange(latestQueryValues.range);
            const start = moment(range.start).unix();
            const end = moment(range.end).unix();
            const derivedQueryWithTime = injectTimeRangeFilter(
              derived.derivedQuery,
              moment(range.start).utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
              moment(range.end).utc().format('YYYY-MM-DDTHH:mm:ss[Z]'),
            );
            const statsQL = renderFieldStatsQL(derivedQueryWithTime, record.field, topNumber);
            const totalQL = renderFieldTotalQL(derivedQueryWithTime);
            const [topResp, totalResp] = await Promise.all([
              dsQuery({
                cate: DatasourceCateEnum.victorialogs,
                datasource_id: datasourceValue,
                query: [
                  {
                    query: statsQL,
                    start,
                    end,
                    time: end,
                    ref: 'A',
                  },
                ],
              }),
              dsQuery({
                cate: DatasourceCateEnum.victorialogs,
                datasource_id: datasourceValue,
                query: [
                  {
                    query: totalQL,
                    start,
                    end,
                    time: end,
                    ref: 'B',
                  },
                ],
              }),
            ]);
            const total = getNumberFromDataResp(totalResp, 'total');
            return {
              topNumber,
              topN: _.map(topResp, (item) => {
                const count = _.toNumber(_.get(item, 'values[0][1]') || 0);
                const value = _.get(item, ['metric', record.field], '');
                return {
                  value,
                  count,
                  percent: total ? _.floor((count / total) * 100, 2) : 0,
                };
              }),
            };
          } catch (e) {
            return {
              topNumber,
              topN: [],
            };
          }
        }}
        renderStatsPopoverTitleExtra={({ index }) => {
          const derived = deriveFieldStatsBase(queryValues?.query, index.field);
          if (derived.ok && derived.derivedQuery !== _.trim(queryValues?.query || '*')) {
            return (
              <Tooltip title={derived.derivedQuery}>
                <InfoCircleOutlined />
              </Tooltip>
            );
          }
          if (!derived.ok) {
            return (
              <Tooltip title={derived.reason}>
                <WarningOutlined className='text-warning' />
              </Tooltip>
            );
          }
          return null;
        }}
      />
    </div>
  );
}
