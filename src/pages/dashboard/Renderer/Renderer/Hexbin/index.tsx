/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { useSize } from 'ahooks';

import { basePrefix } from '@/App';
import HoneycombChart from '@/components/HoneycombChart';
import type { HoneycombCell } from '@/components/HoneycombChart';
import { useReplaceTemplateVariables } from '@/pages/dashboard/Variables/utils/replaceTemplateVariables';

import type { IHexbinStyles, IPanel, ScopedVariables } from '../../../types';
import getCalculatedValuesBySeries from '../../utils/getCalculatedValuesBySeries';
import type { CalculatedSeries } from '../../utils/getCalculatedValuesBySeries';
import { getColorScaleLinearDomain } from './utils';
import { DashboardRuntimeProvider, useDashboardRuntimeStoreIfAvailable, useGlobalState } from '../../../globalState';
import useStableValue from '../../../hooks/useStableValue';

interface HoneyCombProps {
  values: IPanel;
  series: CalculatedSeries[];
  themeMode?: 'dark';
  isPreview?: boolean;
  dataRevision?: number;
}

/** 颜色解析失败（无命中阈值、色阶未映射）时的兜底填充色 */
const FALLBACK_CELL_COLOR = '#3399CC';

const getColumnsKeys = (data: Array<{ metric: Record<string, string | undefined> }>) => {
  const keys = new Set<string>();
  data.forEach((item) => {
    Object.keys(item.metric).forEach((key) => keys.add(key));
  });
  return Array.from(keys);
};

const HexbinContent: React.FunctionComponent<HoneyCombProps> = (props) => {
  const replaceTemplateVariables = useReplaceTemplateVariables();
  const { values, series, themeMode, isPreview } = props;
  const dataDependency = props.dataRevision ?? series;
  const { options } = values;
  // 面板配置来自 JSON；IHexbinStyles 是该图表配置的持久化结构。
  // values.custom 类型上必填，但脏数据可能缺失，兜底为空对象避免解构抛错。
  const custom = (values.custom ?? {}) as unknown as Partial<IHexbinStyles>;
  const stableOptions = useStableValue(options);
  const {
    calc = 'lastNotNull',
    reverseColorOrder = false,
    colorDomainAuto = true,
    colorDomain = [],
    textMode = 'valueAndName',
    detailUrl,
    fontBackground = false,
    valueField = 'Value',
  } = custom;
  const rawColorRange = custom.colorRange;
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const svgSize = useSize(chartContainerRef);
  const [, setStatFields] = useGlobalState('statFields');
  const calculatedValues = useMemo(
    () =>
      getCalculatedValuesBySeries(
        series,
        calc,
        {
          unit: stableOptions?.standardOptions?.unit,
          decimals: stableOptions?.standardOptions?.decimals,
          dateFormat: stableOptions?.standardOptions?.dateFormat,
          valueField,
        },
        stableOptions?.valueMappings,
        stableOptions?.thresholds,
      ),
    [calc, dataDependency, stableOptions, valueField],
  );

  useEffect(() => {
    if (isPreview) {
      setStatFields(getColumnsKeys(calculatedValues));
    }
  }, [calculatedValues, isPreview, setStatFields]);

  const normalizedColorRange = useMemo(() => (Array.isArray(rawColorRange) ? rawColorRange.filter((color): color is string => typeof color === 'string') : []), [rawColorRange]);
  const isThresholdColorRange = normalizedColorRange.length === 1 && normalizedColorRange[0] === 'thresholds';
  const colorScales = useMemo(
    () =>
      d3
        .scaleLinear<string>()
        .domain(getColorScaleLinearDomain(calculatedValues, colorDomainAuto, colorDomain))
        .range(reverseColorOrder ? [...normalizedColorRange].reverse() : normalizedColorRange),
    [calculatedValues, colorDomain, colorDomainAuto, normalizedColorRange, reverseColorOrder],
  );

  const data = useMemo<HoneycombCell[]>(
    () =>
      calculatedValues.map((item) => {
        const fieldValue = valueField === 'Value' ? item.text : item.metric[valueField];
        return {
          id: item.id,
          name: valueField === 'Value' ? item.name : valueField,
          value: fieldValue ?? '',
          stat: item.stat,
          metric: item.metric,
          color: isThresholdColorRange ? item.color || FALLBACK_CELL_COLOR : colorScales(Number(item.stat)) || FALLBACK_CELL_COLOR,
        };
      }),
    [calculatedValues, colorScales, isThresholdColorRange, valueField],
  );

  const handleCellClick = useCallback(
    (cell: HoneycombCell) => {
      if (!detailUrl) return;

      const scopedVars: ScopedVariables = {
        '__field.name': { value: cell.name },
        '__field.value': { value: cell.stat ?? '' },
      };
      Object.entries(cell.metric).forEach(([key, value]) => {
        scopedVars[`__field.labels.${key}`] = { value };
      });
      const detail = replaceTemplateVariables(detailUrl, { scopedVars });
      window.open(basePrefix + detail, '_blank');
    },
    [detailUrl, replaceTemplateVariables],
  );

  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }}>
      {svgSize?.width && svgSize?.height ? (
        <HoneycombChart
          data={data}
          width={svgSize.width}
          height={svgSize.height}
          textMode={textMode}
          fontBackground={fontBackground}
          themeMode={themeMode}
          onCellClick={detailUrl ? handleCellClick : undefined}
        />
      ) : null}
    </div>
  );
};

/**
 * Hexbin 面板。
 *
 * 指标视图等仪表盘外的调用方不会提供运行时容器，这里显式创建隔离实例，
 * 避免读取 statFields 时因缺少 Provider 直接抛错。
 */
const Hexbin: React.FunctionComponent<HoneyCombProps> = (props) => {
  const dashboardRuntimeStore = useDashboardRuntimeStoreIfAvailable();

  if (!dashboardRuntimeStore) {
    return (
      <DashboardRuntimeProvider>
        <HexbinContent {...props} />
      </DashboardRuntimeProvider>
    );
  }

  return <HexbinContent {...props} />;
};

export default Hexbin;
