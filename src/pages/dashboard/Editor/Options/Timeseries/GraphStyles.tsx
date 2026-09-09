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
import { Form, Radio, Slider, Space, Select, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Panel } from '../../Components/Collapse';

type BarAlignment = -1 | 0 | 1;

function BarAlignmentIcon({ alignment }: { alignment: BarAlignment }) {
  const content =
    alignment === -1 ? (
      <g transform='matrix(-1 0 0 1 15.5 0)'>
        <circle cx='2.67' cy='2.67' r='2.67' />
        <path d='M13.42 18.08V3.42H3.06v-1.5h11.86v16.16z' />
        <path d='M1.92 18.08V2.67h1.5v15.41z' />
      </g>
    ) : alignment === 0 ? (
      <g transform='translate(2.5)'>
        <circle cx='6.67' cy='2.67' r='2.67' />
        <path d='M11.5 18.16V3.5H0V2h13v16.16z' />
        <path d='M0 18.16V2.75h1.5v15.41z' />
      </g>
    ) : (
      <g transform='translate(.5)'>
        <circle cx='2.67' cy='2.67' r='2.67' />
        <path d='M13.42 18.08V3.42H3.06v-1.5h11.86v16.16z' />
        <path d='M1.92 18.08V2.67h1.5v15.41z' />
      </g>
    );

  return (
    <svg width='16' height='16' viewBox='0 0 16 19' fill='currentColor' aria-hidden='true' style={{ display: 'block', opacity: 0.72 }}>
      {content}
    </svg>
  );
}

export default function GraphStyles() {
  const { t } = useTranslation('dashboard');
  const namePrefix = ['custom'];
  const showPoints = Form.useWatch([...namePrefix, 'showPoints']);

  return (
    <Panel header={t('panel.custom.title')}>
      <>
        <Space>
          <Form.Item label={t('panel.custom.timeseries.drawStyle')} name={[...namePrefix, 'drawStyle']}>
            <Radio.Group buttonStyle='solid'>
              <Radio.Button value='lines'>Lines</Radio.Button>
              <Radio.Button value='bars'>Bars</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prevValues, curValues) => _.get(prevValues, [...namePrefix, 'drawStyle']) !== _.get(curValues, [...namePrefix, 'drawStyle'])}>
            {({ getFieldValue }) => {
              const drawStyle = getFieldValue([...namePrefix, 'drawStyle']);
              if (drawStyle === 'lines' || drawStyle === 'bars') {
                return (
                  <>
                    {drawStyle === 'lines' ? (
                      <Form.Item label={t('panel.custom.timeseries.lineInterpolation')} name={[...namePrefix, 'lineInterpolation']}>
                        <Radio.Group buttonStyle='solid'>
                          <Radio.Button value='linear'>Linear</Radio.Button>
                          <Radio.Button value='smooth'>Smooth</Radio.Button>
                        </Radio.Group>
                      </Form.Item>
                    ) : null}
                  </>
                );
              }
              return null;
            }}
          </Form.Item>
          <Form.Item label={t('panel.custom.timeseries.spanNulls')} name={[...namePrefix, 'spanNulls']} initialValue={false}>
            <Radio.Group buttonStyle='solid'>
              <Radio.Button value={true}>{t('panel.custom.timeseries.spanNulls_1')}</Radio.Button>
              <Radio.Button value={false}>{t('panel.custom.timeseries.spanNulls_0')}</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Space>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, curValues) => _.get(prevValues, [...namePrefix, 'drawStyle']) !== _.get(curValues, [...namePrefix, 'drawStyle'])}
        >
          {({ getFieldValue }) => {
            if (getFieldValue([...namePrefix, 'drawStyle']) !== 'bars') return null;
            const alignments: { value: BarAlignment; label: 'before' | 'center' | 'after' }[] = [
              { value: -1, label: 'before' },
              { value: 0, label: 'center' },
              { value: 1, label: 'after' },
            ];
            return (
              <>
                <Form.Item label={t('panel.custom.timeseries.barAlignment')} name={[...namePrefix, 'barAlignment']} initialValue={0}>
                  <Radio.Group buttonStyle='solid'>
                    {alignments.map(({ value, label }) => (
                      <Tooltip key={value} title={t(`panel.custom.timeseries.barAlignment_${label}`)}>
                        <Radio.Button value={value} aria-label={t(`panel.custom.timeseries.barAlignment_${label}`)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <BarAlignmentIcon alignment={value} />
                        </Radio.Button>
                      </Tooltip>
                    ))}
                  </Radio.Group>
                </Form.Item>
                <Form.Item
                  label={
                    <Space size={4}>
                      {t('panel.custom.timeseries.barWidthFactor')}
                      <Tooltip title={t('panel.custom.timeseries.barWidthFactor_tip')}>
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                  name={[...namePrefix, 'barWidthFactor']}
                  initialValue={0.6}
                >
                  <Slider min={0.1} max={1} step={0.1} marks={{ 0.1: '0.1', 1: '1' }} />
                </Form.Item>
              </>
            );
          }}
        </Form.Item>
        <Form.Item label={t('panel.custom.timeseries.lineWidth')} name={[...namePrefix, 'lineWidth']}>
          <Slider min={0} max={10} step={1} marks={{ 0: '0', 10: '10' }} />
        </Form.Item>
        <Form.Item label={t('panel.custom.timeseries.fillOpacity')} name={[...namePrefix, 'fillOpacity']}>
          <Slider min={0} max={1} step={0.01} marks={{ 0: '0', 1: '1' }} />
        </Form.Item>
        <Space>
          <Form.Item label={t('panel.custom.timeseries.gradientMode')} name={[...namePrefix, 'gradientMode']}>
            <Radio.Group buttonStyle='solid'>
              <Radio.Button value='opacity'>{t('panel.custom.timeseries.gradientMode_opacity')}</Radio.Button>
              <Radio.Button value='none'>{t('panel.custom.timeseries.gradientMode_none')}</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label={t('panel.custom.timeseries.stack')} name={[...namePrefix, 'stack']}>
            <Radio.Group buttonStyle='solid'>
              <Radio.Button value='normal'>{t('panel.custom.timeseries.stack_normal')}</Radio.Button>
              <Radio.Button value='off'>{t('panel.custom.timeseries.stack_off')}</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, curValues) => _.get(prevValues, [...namePrefix, 'scaleDistribution']) !== _.get(curValues, [...namePrefix, 'scaleDistribution'])}
          >
            {({ getFieldValue, setFields }) => {
              const scaleDistributionType = getFieldValue([...namePrefix, 'scaleDistribution', 'type']);
              return (
                <Space>
                  <Form.Item label='YAxis Scale' name={[...namePrefix, 'scaleDistribution', 'type']}>
                    <Radio.Group
                      buttonStyle='solid'
                      onChange={(e) => {
                        if (e.target.value === 'log') {
                          setFields([
                            {
                              name: [...namePrefix, 'scaleDistribution', 'log'],
                              value: 10,
                            },
                          ]);
                        }
                      }}
                    >
                      <Radio.Button value='linear'>Linear</Radio.Button>
                      <Radio.Button value='log'>Logarithmic</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                  {scaleDistributionType === 'log' && (
                    <Form.Item label=' ' name={[...namePrefix, 'scaleDistribution', 'log']}>
                      <Select style={{ width: 80 }}>
                        <Select.Option value={2}>2</Select.Option>
                        <Select.Option value={10}>10</Select.Option>
                      </Select>
                    </Form.Item>
                  )}
                </Space>
              );
            }}
          </Form.Item>
        </Space>
        <Form.Item label={t('panel.custom.timeseries.showPoints')} name={[...namePrefix, 'showPoints']}>
          <Radio.Group buttonStyle='solid'>
            <Radio.Button value='always'>{t('panel.custom.timeseries.showPoints_always')}</Radio.Button>
            <Radio.Button value='none'>{t('panel.custom.timeseries.showPoints_none')}</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item label={t('panel.custom.timeseries.pointSize')} name={[...namePrefix, 'pointSize']} hidden={showPoints === 'none'}>
          <Slider min={1} max={40} step={1} />
        </Form.Item>
      </>
    </Panel>
  );
}
