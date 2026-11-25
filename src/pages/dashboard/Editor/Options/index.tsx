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
import React from 'react';
import { useTranslation } from 'react-i18next';

import { isPanelVisualizationType } from '../../Renderer/registry/panelTypes';
import type { PanelVisualizationType } from '../../Renderer/registry/types';
import type { ITarget, IType } from '../../types';
import AiButton from './AiButton';
import BarChart from './BarChart';
import BarGauge from './BarGauge';
import Gauge from './Gauge';
import Heatmap from './Heatmap';
import Hexbin from './Hexbin';
import Iframe from './Iframe';
import Pie from './Pie';
import Stat from './Stat';
import Table from './Table';
import TableNG from './TableNG';
import Text from './Text';
import Timeseries from './Timeseries';

interface OptionsProps {
  type: IType;
  targets: ITarget[];
}

// 随编辑器一起加载，打开和切换图表配置时无需请求独立的选项面板入口。
const panelOptions: Record<PanelVisualizationType, React.ComponentType<Pick<OptionsProps, 'targets'>>> = {
  timeseries: Timeseries,
  barchart: BarChart,
  stat: Stat,
  tableNG: TableNG,
  table: Table,
  pie: Pie,
  hexbin: Hexbin,
  barGauge: BarGauge,
  text: Text,
  gauge: Gauge,
  heatmap: Heatmap,
  iframe: Iframe,
  aiButton: AiButton,
};

export default function Options({ type, targets }: OptionsProps) {
  const { t } = useTranslation('dashboard');

  if (!isPanelVisualizationType(type)) {
    return <div>{`${t('detail.invalidPanelType')} ${type}`}</div>;
  }

  const PanelOptions = panelOptions[type];
  return <PanelOptions targets={targets} />;
}
