import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Spin, Empty, Form } from 'antd';
import { useTranslation } from 'react-i18next';

import { parseRange } from '@/components/TimeRangePicker';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import { getSerieName } from '@/pages/dashboard/Renderer/datasource/utils';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';

import { getDsQuery } from '../../../services';
import replaceTemplateVariables from '../../utils/replaceTemplateVariables';

interface Props {
  setExecuteLoading: (loading: boolean) => void;
}

export default function TimeseriesCpt(props: Props) {
  const { t } = useTranslation();

  const { setExecuteLoading } = props;
  const form = Form.useFormInstance();
  const refreshFlag = Form.useWatch('refreshFlag');
  const [loading, setLoading] = useState(false);
  const [series, setSeries] = useState<any[]>([]);

  useEffect(() => {
    if (refreshFlag) {
      form.validateFields().then((values) => {
        const query = values.query;
        if (query.keys.valueKey) {
          query.keys.valueKey = _.join(query.keys.valueKey, ' ');
        }
        if (query.keys.labelKey) {
          query.keys.labelKey = _.join(query.keys.labelKey, ' ');
        }
        const requestParams = {
          cate: values.datasourceCate,
          datasource_id: values.datasourceValue,
          query: [
            {
              from: moment(parseRange(query.range).start).unix(),
              to: moment(parseRange(query.range).end).unix(),
              sql: replaceTemplateVariables(_.trim(query.query), query.range),
              keys: query.keys,
            },
          ],
        };
        setLoading(true);
        setExecuteLoading(true);
        getDsQuery(requestParams)
          .then((res) => {
            setSeries(
              _.map(res, (item) => {
                return {
                  name: getSerieName(item.metric),
                  metric: item.metric,
                  data: item.values,
                };
              }),
            );
          })
          .catch(() => {
            setSeries([]);
          })
          .finally(() => {
            setLoading(false);
            setExecuteLoading(false);
          });
      });
    }
  }, [refreshFlag]);

  return (
    <>
      {!_.isEmpty(series) ? (
        <div className='n9e-antd-table-height-full max-h-[300px]'>
          <Spin spinning={loading}>
            <Timeseries
              series={series}
              values={
                {
                  custom: {
                    drawStyle: 'lines',
                    lineInterpolation: 'smooth',
                  },
                  options: {
                    legend: {
                      displayMode: 'table',
                    },
                    tooltip: {
                      mode: 'all',
                    },
                  },
                } as any
              }
            />
          </Spin>
        </div>
      ) : loading ? (
        <div className='flex justify-center'>
          <Empty
            className='ant-empty-normal'
            image='/image/img_executing.svg'
            description={t(`${logExplorerNS}:loading`)}
            imageStyle={{
              height: 80,
            }}
          />
        </div>
      ) : (
        <div className='flex justify-center'>
          <Empty
            className='ant-empty-normal'
            image='/image/img_empty.svg'
            description={t(`${logExplorerNS}:no_data`)}
            imageStyle={{
              height: 80,
            }}
          />
        </div>
      )}
    </>
  );
}
