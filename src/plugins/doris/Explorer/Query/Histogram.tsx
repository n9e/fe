import React, { useContext, useState, useEffect, useMemo, useRef } from 'react';
import { Form } from 'antd';
import moment from 'moment';
import { AlignedData, Options } from 'uplot';
import _ from 'lodash';
import { useSize } from 'ahooks';

import { CommonStateContext } from '@/App';
import { DatasourceCateEnum, PRIMARY_COLOR } from '@/utils/constant';
import { parseRange } from '@/components/TimeRangePicker';
import UPlotChart, { tooltipPlugin, paddingSide, axisBuilder, seriesBuider, cursorBuider, scalesBuilder, getStackedDataAndBands, uplotsMap } from '@/components/UPlotChart';
import getDataFrameAndBaseSeries, { BaseSeriesItem } from '@/pages/dashboard/Renderer/Renderer/TimeSeriesNG/utils/getDataFrameAndBaseSeries';

import { getDorisHistogram } from '../../services';

const id = 'doris-histogram';

function Main({ width, height, baseSeries, frames }: { width: number; height: number; baseSeries: BaseSeriesItem[]; frames: AlignedData }) {
  const { darkMode } = useContext(CommonStateContext);
  const form = Form.useFormInstance();

  // 保存 x 和 y 轴初始缩放范围
  const xScaleInitMinMaxRef = useRef<[number, number]>();

  const uOptions: Options = useMemo(() => {
    return {
      width,
      height,
      padding: [paddingSide, paddingSide, paddingSide, paddingSide],
      legend: { show: false },
      plugins: [
        tooltipPlugin({
          id,
          mode: 'single',
          sort: 'none',
        }),
      ],
      cursor: cursorBuider({}),
      scales: scalesBuilder({}),
      series: seriesBuider({
        baseSeries,
        colors: [PRIMARY_COLOR],
        pathsType: 'bars',
        fillOpacity: 1,
        points: { show: false },
      }),
      axes: [
        axisBuilder({
          isTime: true,
          theme: darkMode ? 'dark' : 'light',
        }),
        axisBuilder({
          scaleKey: 'y',
          theme: darkMode ? 'dark' : 'light',
        }),
      ],
      hooks: {
        setScale: [
          (u, scaleKey) => {
            if (scaleKey === 'x') {
              const min = u.scales.x.min;
              const max = u.scales.x.max;
              if (u.status === 0 && typeof min === 'number' && typeof max === 'number') {
                xScaleInitMinMaxRef.current = [min, max];
              } else if (u.status === 1) {
                if (!_.isEqual(xScaleInitMinMaxRef.current, [min, max])) {
                  if (min && max) {
                    const currentQueryValues = _.cloneDeep(form.getFieldValue('query'));
                    const range = currentQueryValues?.range;
                    if (range) {
                      _.set(currentQueryValues, 'range', { start: moment.unix(min), end: moment.unix(max) });
                      form.setFieldsValue({ query: currentQueryValues });
                    }
                  }
                }
              }
            }
          },
        ],
      },
    };
  }, [darkMode, width, height, JSON.stringify(baseSeries)]);

  return <UPlotChart id={id} options={uOptions} data={frames} />;
}

export default function Histogram() {
  const refreshFlag = Form.useWatch('refreshFlag');
  const datasourceValue = Form.useWatch('datasourceValue');
  const queryValues = Form.useWatch('query');
  const [series, setSeries] = React.useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSize = useSize(containerRef);

  const { frames, baseSeries } = useMemo(() => {
    return getDataFrameAndBaseSeries(series as any);
  }, [JSON.stringify(series)]);

  useEffect(() => {
    if (refreshFlag && datasourceValue && queryValues && queryValues.database && queryValues.table) {
      const parsedRange = parseRange(queryValues.range);
      const from = moment(parsedRange.start).unix();
      const to = moment(parsedRange.end).unix();
      getDorisHistogram({
        cate: DatasourceCateEnum.doris,
        datasource_id: datasourceValue,
        query: [
          {
            database: queryValues.database,
            table: queryValues.table,
            time_field: queryValues.date_field,
            from,
            to,
            query: queryValues.query,
          },
        ],
      }).then((res) => {
        setSeries(
          _.map(res, (item) => {
            return {
              id: _.uniqueId('series_'),
              refId: '',
              name: '',
              metric: {},
              data: item.values,
            };
          }),
        );
      });
    }
  }, [refreshFlag]);

  return (
    <div ref={containerRef} className='h-[100px]'>
      {containerSize?.width && containerSize?.height ? <Main width={containerSize.width} height={containerSize.height} baseSeries={baseSeries} frames={frames} /> : null}
    </div>
  );
}
