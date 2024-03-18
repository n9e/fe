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
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Select, Input, Tooltip, Button } from 'antd';
import { SearchOutlined, ClearOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { getLabelValues } from '@/services/metricViews';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { IMatch } from '../types';
import { getFiltersStr, getDynamicLabelsStr } from './utils';
import Collapse from './components/Collapse';

interface IProps {
  datasourceValue: number;
  range: IRawTimeRange;
  value: IMatch;
  onChange: (value: IMatch) => void;
}

export default function LabelsValues(props: IProps) {
  const { t } = useTranslation('objectExplorer');
  const { datasourceValue, value, range, onChange } = props;
  const { id, refreshFlag, filters, dynamicLabels, dimensionLabels } = value;
  const [labelValues, setLabelValues] = useState<{ [key: string]: string[] }>({});
  const [dimensionLabelsValues, setDimensionLabelsValues] = useState<{ [key: string]: string[] }>({});
  const [dimensionLabelsSearch, setDimensionLabelsSearch] = useState({});
  const filtersStr = getFiltersStr(filters);
  const dynamicLabelsStr = getDynamicLabelsStr(dynamicLabels);
  const [expaned, setExpaned] = useState({
    filters: false,
    dynamicLabels: true,
  });

  useEffect(() => {
    const dynamicLabelsRequests = _.map(dynamicLabels, (item) => {
      return getLabelValues(datasourceValue, item.label, range, filtersStr ? `{${filtersStr}}` : '');
    });
    Promise.all(dynamicLabelsRequests).then((res) => {
      const _labelValues = {};
      _.forEach(res, (item, idx) => {
        _labelValues[dynamicLabels[idx].label] = item;
      });
      setLabelValues(_labelValues);
    });
  }, [filtersStr, datasourceValue, _.join(_.map(dynamicLabels, 'label'))]);

  useEffect(() => {
    const matchStr = _.join(_.compact(_.concat(filtersStr, dynamicLabelsStr)), ',');
    const dimensionLabelsRequests = _.map(dimensionLabels, (item) => {
      return getLabelValues(datasourceValue, item.label, range, matchStr ? `{${matchStr}}` : '');
    });
    Promise.all(dimensionLabelsRequests).then((res) => {
      const _labelValues = {};
      _.forEach(res, (item, idx) => {
        _labelValues[dimensionLabels[idx].label] = item;
      });
      setDimensionLabelsValues(_labelValues);
      if (_.every(dimensionLabels, (item) => _.isEmpty(item.value))) {
        onChange({
          ...value,
          dimensionLabels: _.map(dimensionLabels, (item, idx) => {
            if (idx === 0) {
              return {
                label: item.label,
                value: _.slice(_labelValues[item.label], 0, 10),
              };
            }
            return item;
          }),
        });
      }
    });
  }, [filtersStr, dynamicLabelsStr, id, refreshFlag, datasourceValue]);

  return (
    <Collapse collapseLocalStorageKey='quick_view_filter_collapse' widthLocalStorageKey='quick_view_filter_width' defaultWidth={240} tooltip={t('list.filters_title')}>
      <div className='n9e-metric-views-labels-values'>
        {!_.isEmpty(filtersStr) && (
          <div className='n9e-metric-views-labels-values-item'>
            <div
              className='page-title'
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setExpaned({
                  ...expaned,
                  filters: !expaned.filters,
                });
              }}
            >
              {t('list.filters')} {expaned.filters ? <UpOutlined /> : <DownOutlined />}
            </div>
            {expaned.filters && <div className='n9e-metric-views-filters'>{filtersStr ? filtersStr : '暂无数据'}</div>}
          </div>
        )}
        {!_.isEmpty(dynamicLabels) && (
          <div className='n9e-metric-views-labels-values-item'>
            <div
              className='page-title'
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setExpaned({
                  ...expaned,
                  dynamicLabels: !expaned.dynamicLabels,
                });
              }}
            >
              {t('list.dynamicLabels')} {expaned.dynamicLabels ? <UpOutlined /> : <DownOutlined />}
            </div>
            {expaned.dynamicLabels && (
              <div className='n9e-metric-views-dynamicLabels'>
                {_.isEmpty(dynamicLabels) ? (
                  <div style={{ marginBottom: 10 }}>No Data</div>
                ) : (
                  _.map(dynamicLabels, (item) => {
                    return (
                      <div key={item.label} className='n9e-metric-views-dynamicLabels-item'>
                        <div className='n9e-metric-views-dynamicLabels-item-label'>{item.label}:</div>
                        <Select
                          allowClear
                          showSearch
                          style={{ width: '100%' }}
                          value={item.value}
                          onChange={(val) => {
                            const _dynamicLabels = _.map(dynamicLabels, (obj) => {
                              if (item.label === obj.label) {
                                return {
                                  ...obj,
                                  value: val,
                                };
                              }
                              return obj;
                            });
                            onChange({
                              ...value,
                              dynamicLabels: _dynamicLabels,
                              dimensionLabels: _.map(dimensionLabels, (item, idx) => {
                                if (idx === 0) {
                                  return {
                                    label: item.label,
                                    value: [],
                                  };
                                }
                                return item;
                              }),
                            });
                          }}
                        >
                          {_.map(labelValues[item.label], (value) => {
                            return (
                              <Select.Option key={value} value={value}>
                                {value}
                              </Select.Option>
                            );
                          })}
                        </Select>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
        {_.map(dimensionLabels, (dimensionLabel) => {
          const dimensionLabelValues = dimensionLabelsValues[dimensionLabel.label];
          return (
            <div key={dimensionLabel.label} className='n9e-metric-views-labels-values-item'>
              <div className='page-title'>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: 220,
                  }}
                >
                  <Tooltip title={dimensionLabel.label} placement='left'>
                    <div
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 'calc(100% - 30px)',
                      }}
                    >
                      {dimensionLabel.label}
                    </div>
                  </Tooltip>
                  <a
                    style={{ fontSize: 12, fontWeight: 'normal' }}
                    onClick={() => {
                      onChange({
                        ...value,
                        dimensionLabels: _.map(dimensionLabels, (item) => {
                          if (item.label === dimensionLabel.label) {
                            return {
                              ...item,
                              value: dimensionLabelsSearch[item.label]
                                ? _.filter(dimensionLabelValues, (o) => {
                                    return _.includes(o, dimensionLabelsSearch[item.label]);
                                  })
                                : dimensionLabelValues,
                            };
                          }
                          return item;
                        }),
                      });
                    }}
                  >
                    {t('list.allSelect')}
                  </a>
                </div>
              </div>
              <div className='n9e-metric-views-dimensionLabel'>
                <Input.Group compact>
                  <Input
                    style={{ width: 'calc(100% - 32px)' }}
                    prefix={<SearchOutlined />}
                    value={dimensionLabelsSearch[dimensionLabel.label]}
                    onChange={(e) => {
                      setDimensionLabelsSearch({
                        ...dimensionLabelsSearch,
                        [dimensionLabel.label]: e.target.value,
                      });
                    }}
                  />
                  <Tooltip title={t('list.clear')} placement='right' getTooltipContainer={() => document.body}>
                    <Button
                      icon={<ClearOutlined />}
                      onClick={() => {
                        onChange({
                          ...value,
                          dimensionLabels: _.map(dimensionLabels, (item) => {
                            if (item.label === dimensionLabel.label) {
                              return {
                                ...item,
                                value: [],
                              };
                            }
                            return item;
                          }),
                        });
                      }}
                    />
                  </Tooltip>
                </Input.Group>

                <div className='n9e-metric-views-dimensionLabel-content'>
                  {_.isEmpty(dimensionLabelValues) ? (
                    'No Data'
                  ) : (
                    <div>
                      {_.map(
                        _.filter(dimensionLabelValues, (item) => {
                          let result = true;
                          if (dimensionLabelsSearch[dimensionLabel.label]) {
                            try {
                              const reg = new RegExp(dimensionLabelsSearch[dimensionLabel.label], 'gi');
                              result = reg.test(item);
                            } catch (e) {
                              console.log(e);
                            }
                          }
                          return result;
                        }),
                        (item: string) => {
                          return (
                            <div
                              key={item}
                              className={classNames({
                                'n9e-metric-views-dimensionLabel-content-item': true,
                                active: _.includes(dimensionLabel.value, item),
                              })}
                              onClick={() => {
                                const dimensionLabelValue = _.includes(dimensionLabel.value, item) ? _.without(dimensionLabel.value, item) : _.concat(dimensionLabel.value, item);
                                const newDimensionLabels = _.map(dimensionLabels, (item) => {
                                  if (item.label === dimensionLabel.label) {
                                    return {
                                      ...item,
                                      value: _.compact(dimensionLabelValue),
                                    };
                                  }
                                  return item;
                                });
                                onChange({
                                  ...value,
                                  dimensionLabels: newDimensionLabels,
                                });
                              }}
                            >
                              {item}
                            </div>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Collapse>
  );
}
