import React, { useMemo, useRef, useContext, useState, useEffect } from 'react';
import { AlignedData, Options, Range } from 'uplot';
import _ from 'lodash';
import moment from 'moment';
import { useSize } from 'ahooks';
import { Button, Popover, Space, Spin, Switch } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined, SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import UPlotChart, { tooltipPlugin, paddingSide, axisBuilder, seriesBuider, cursorBuider, scalesBuilder, getStackedDataAndBands } from '@/components/UPlotChart';
import { parseRange, IRawTimeRange } from '@/components/TimeRangePicker';
import { BaseSeriesItem } from '@/pages/dashboard/Renderer/Renderer/TimeSeriesNG';
import { hexPalette } from '@/pages/dashboard/config';

import { NAME_SPACE } from '../constants';
import { getHistogram } from '../services';
import { getStepByRange, getDataFrameAndBaseSeries } from '../utils';

type Data = {
  frames: AlignedData;
  baseSeries: BaseSeriesItem[];
  loading: boolean;
  complete: boolean;
  total: number;
};

type GraphSettings = {
  stacked: boolean;
  fill: boolean;
};

interface Props {
  width: number;
  height: number;
  data: Data;
  range: IRawTimeRange;
  graphSettings: GraphSettings;
  onRangeChange: (newRange: IRawTimeRange) => void;
  refreshFlag?: string;
}

function Graph(props: Props) {
  const { darkMode } = useContext(CommonStateContext);
  const { width, height, data, range, graphSettings, onRangeChange, refreshFlag } = props;
  const { frames, baseSeries } = data;
  const id = useMemo(() => _.uniqueId(`${NAME_SPACE}_explort_id_`), []);
  const xMinMax = useMemo(() => {
    let xMinMax: Range.MinMax | undefined = undefined;
    if (range) {
      const parsedRange = parseRange(range);
      const start = moment(parsedRange.start).unix();
      const end = moment(parsedRange.end).unix();
      xMinMax = [start, end];
    }
    return xMinMax;
  }, [refreshFlag]);
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
          mode: 'all',
          sort: 'none',
        }),
      ],
      cursor: cursorBuider({}),
      scales: scalesBuilder({
        xMinMax,
      }),
      series: seriesBuider({
        baseSeries,
        pathsType: 'bars',
        fillOpacity: graphSettings.fill ? 0.4 : 0,
        points: { show: true },
        colors: hexPalette,
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
                  if (range && onRangeChange) {
                    onRangeChange({
                      start: moment.unix(min),
                      end: moment.unix(max),
                    });
                  }
                }
              }
            }
          }
        },
      ],
    };
  }, [width, height, darkMode, JSON.stringify(xMinMax), JSON.stringify(baseSeries), JSON.stringify(graphSettings)]);

  let currentFrames = frames;
  if (frames.length > 0 && graphSettings.stacked) {
    const stackedDataAndBands = getStackedDataAndBands(frames);
    const stackedData = stackedDataAndBands.data;
    uOptions.bands = stackedDataAndBands.bands;
    uOptions.series = _.map(uOptions.series, (s, i) => {
      if (i === 0) return s;
      return {
        ...s,
        n9e_internal: {
          // @ts-ignore
          ...s.n9e_internal,
          values: frames[i], // 只用于堆叠图下保存原始数据
        },
      };
    });
    currentFrames = _.concat([frames[0]], stackedData) as any;
  }

  return <UPlotChart id={id} options={uOptions} data={currentFrames} />;
}

export default function GraphContainer(props: {
  refreshFlag?: string;
  datasourceValue: number;
  query: string;
  range: IRawTimeRange;
  onRangeChange: (newRange: IRawTimeRange) => void;
}) {
  const { t } = useTranslation(NAME_SPACE);
  const { refreshFlag, datasourceValue, query, range, onRangeChange } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSize = useSize(containerRef);
  const [graphVisible, setGraphVisible] = useState(true);
  const [graphSettings, setGraphSettings] = useState({
    stacked: false,
    fill: true,
  });
  const [data, setData] = useState<Data>({
    frames: [],
    baseSeries: [],
    loading: false,
    complete: false,
    total: 0,
  });

  useEffect(() => {
    if (graphVisible && datasourceValue && query && range) {
      setData({
        ...data,
        loading: true,
      });
      const parsedRange = parseRange(range);
      const start = parsedRange.start!;
      const end = parsedRange.end!;
      const step = getStepByRange(start, end);
      getHistogram(datasourceValue, {
        query,
        step,
        start: start.toISOString(),
        end: end.toISOString(),
        fields_limit: 5,
        field: '_stream',
      })
        .then((res) => {
          const { frames, baseSeries, total } = getDataFrameAndBaseSeries(res.hits);
          setData({
            frames,
            baseSeries,
            loading: false,
            complete: true,
            total,
          });
        })
        .catch(() => {
          setData({
            ...data,
            loading: false,
            complete: true,
          });
        });
    }
  }, [refreshFlag]);

  return (
    <div className='fc-border p-2'>
      <div className='flex justify-between items-center'>
        <Space>
          <span>
            {t('explorer.hits')}: {data.total}
          </span>
          <Spin size='small' spinning={data.loading} />
        </Space>
        <Space>
          <Button
            size='small'
            type='text'
            icon={graphVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            onClick={() => {
              setGraphVisible(!graphVisible);
            }}
          />
          <Popover
            title={t('explorer.graph_settings.title')}
            content={
              <Space direction='vertical'>
                <Space>
                  <Switch
                    size='small'
                    checked={graphSettings.stacked}
                    onChange={(val) => {
                      setGraphSettings({ ...graphSettings, stacked: val });
                    }}
                  />
                  {t('explorer.graph_settings.stacked')}
                </Space>
                <Space>
                  <Switch
                    size='small'
                    checked={graphSettings.fill}
                    onChange={(val) => {
                      setGraphSettings({ ...graphSettings, fill: val });
                    }}
                  />
                  {t('explorer.graph_settings.fill')}
                </Space>
              </Space>
            }
            trigger='click'
            placement='bottomRight'
          >
            <Button size='small' type='text' icon={<SettingOutlined />} />
          </Popover>
        </Space>
      </div>
      <div
        style={{
          width: '100%',
          height: 120,
          display: graphVisible ? 'block' : 'none',
        }}
        ref={containerRef}
      >
        {containerSize?.width && containerSize?.height && (
          <Graph
            width={containerSize.width}
            height={containerSize.height}
            data={data}
            range={range}
            graphSettings={graphSettings}
            onRangeChange={onRangeChange}
            refreshFlag={refreshFlag}
          />
        )}
      </div>
    </div>
  );
}
