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
import { Checkbox, Space, Divider, Select } from 'antd';
import UnitPicker from '@/pages/dashboard/Components/UnitPicker';

interface IProps {
  type?: 'vertical' | 'horizontal';
  showLegend?: boolean;
  highLevelConfig: any;
  setHighLevelConfig: (val: any) => void;
}

export default function GraphStandardOptions(props: IProps) {
  const { t } = useTranslation('promGraphCpt');
  const { type, showLegend = true, highLevelConfig, setHighLevelConfig } = props;

  const tooltipMode = highLevelConfig.shared ? 'all' : 'single';

  const handleTooltipModeChange = (mode: string) => {
    setHighLevelConfig({ ...highLevelConfig, shared: mode === 'all' });
  };

  const handleSortDirectionChange = (val: string) => {
    setHighLevelConfig({ ...highLevelConfig, sharedSortDirection: val });
  };

  const handleLegendChange = (e) => {
    setHighLevelConfig({ ...highLevelConfig, legend: e.target.checked });
  };

  const handleUnitChange = (val) => {
    setHighLevelConfig({ ...highLevelConfig, unit: val });
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#657386',
    whiteSpace: 'nowrap',
  };

  if (type === 'horizontal') {
    return (
      <>
        <span
          style={{
            // 2024-05-08 解决 antd v4 无边框的的 select 组件左右有无法去除的 padding 问题
            position: 'relative',
            right: -4,
          }}
        >
          {t('value_format')}
          <UnitPicker size='small' optionLabelProp='cleanLabelLink' dropdownMatchSelectWidth={false} value={highLevelConfig.unit} onChange={handleUnitChange} />
        </span>
        <Space>
          {showLegend && (
            <Space>
              <Divider type='vertical' />
              <Checkbox checked={highLevelConfig.legend} onChange={handleLegendChange} className='n9e-checkbox-padding-right-0'>
                {t('show_legend')}
              </Checkbox>
            </Space>
          )}
          <Divider type='vertical' />
          <Select
            size='small'
            value={tooltipMode}
            onChange={handleTooltipModeChange}
            style={{ minWidth: 70 }}
            options={[
              { label: t('tooltip_mode_single'), value: 'single' },
              { label: t('tooltip_mode_all'), value: 'all' },
            ]}
          />
          {tooltipMode === 'all' && (
            <Select
              size='small'
              value={highLevelConfig.sharedSortDirection}
              onChange={handleSortDirectionChange}
              style={{ minWidth: 80 }}
              options={[
                { label: t('tooltip_sort_desc'), value: 'desc' },
                { label: t('tooltip_sort_asc'), value: 'asc' },
              ]}
            />
          )}
        </Space>
      </>
    );
  }

  return (
    <div style={{ minWidth: 300, display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '8px 10px', alignItems: 'center' }}>
      <span style={labelStyle}>{t('tooltip_mode')}</span>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Select
          size='small'
          value={tooltipMode}
          onChange={handleTooltipModeChange}
          style={{ width: 'max-content' }}
          options={[
            { label: t('tooltip_mode_single'), value: 'single' },
            { label: t('tooltip_mode_all'), value: 'all' },
          ]}
          dropdownMatchSelectWidth={false}
        />
        {tooltipMode === 'all' && (
          <Select
            size='small'
            value={highLevelConfig.sharedSortDirection}
            onChange={handleSortDirectionChange}
            style={{ width: 'max-content' }}
            options={[
              { label: t('tooltip_sort_desc'), value: 'desc' },
              { label: t('tooltip_sort_asc'), value: 'asc' },
            ]}
            dropdownMatchSelectWidth={false}
          />
        )}
      </div>
      <span style={labelStyle}>{t('show_legend')}</span>
      <Checkbox checked={highLevelConfig.legend} onChange={handleLegendChange} style={{ width: 'max-content' }} />
      <span style={labelStyle}>{t('value_format')}</span>
      <UnitPicker
        size='small'
        optionLabelProp='cleanLabelLink'
        dropdownMatchSelectWidth={false}
        value={highLevelConfig.unit}
        onChange={handleUnitChange}
        style={{ width: 'max-content' }}
      />
    </div>
  );
}
