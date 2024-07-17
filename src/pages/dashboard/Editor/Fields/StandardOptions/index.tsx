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
import { Form, InputNumber, Row, Col, Tooltip, Input } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';
import { CustomUnitPicker } from '@/pages/dashboard/Components/UnitPicker';
import { Panel } from '../../Components/Collapse';

interface IProps {
  preNamePrefix?: (string | number)[];
  namePrefix?: (string | number)[];
  showMinMax?: boolean;
  showDisplayName?: boolean;
  defaultMin?: number;
  defaultMax?: number;
}

export default function index(props: IProps) {
  const { t } = useTranslation('dashboard');
  const { preNamePrefix = [], namePrefix = ['options', 'standardOptions'], showMinMax = true, showDisplayName, defaultMin, defaultMax } = props;

  return (
    <Panel header={t('panel.standardOptions.title')}>
      <>
        <Form.Item shouldUpdate noStyle>
          {({ getFieldValue }) => {
            const unit = getFieldValue([...namePrefix, 'util']) || '';
            return (
              <Row gutter={10}>
                <Col span={unit.indexOf('datetime') > -1 ? 12 : 24}>
                  <Form.Item
                    label={
                      <div>
                        {t('panel.standardOptions.unit')}{' '}
                        <Tooltip
                          overlayInnerStyle={{
                            width: 500,
                          }}
                          getTooltipContainer={() => document.body}
                          title={
                            <Trans ns='dashboard' i18nKey='panel.standardOptions.unit_tip'>
                              <div>默认会做 SI Prefixes 处理，如不想默认的处理可选择 none 关闭</div>
                              <div>Data(SI): 基数为 1000, 单位为 B、kB、MB、GB、TB、PB、EB、ZB、YB</div>
                              <div>Data(IEC): 基数为 1024, 单位为 B、KiB、MiB、GiB、TiB、PiB、EiB、ZiB、YiB</div>
                              <div>bits: b</div>
                              <div>bytes: B</div>
                            </Trans>
                          }
                        >
                          <InfoCircleOutlined />
                        </Tooltip>
                      </div>
                    }
                    name={[...namePrefix, 'util']}
                  >
                    <CustomUnitPicker
                      placeholder='SI prefixes'
                      allowClear
                      showSearch
                      hideSIOption
                      ajustUnitOptions={(units) => {
                        return _.map(units, (item) => {
                          if (item.label === 'Time') {
                            return {
                              ...item,
                              options: _.concat(item.options, [
                                {
                                  label: 'humanize(seconds)',
                                  value: 'humantimeSeconds',
                                },
                                {
                                  label: 'humanize(milliseconds)',
                                  value: 'humantimeMilliseconds',
                                },
                              ]),
                            };
                          }
                          return item;
                        });
                      }}
                    />
                  </Form.Item>
                </Col>
                {unit.indexOf('datetime') > -1 && (
                  <Col span={12}>
                    <Form.Item label={t('panel.standardOptions.datetime')} name={[...namePrefix, 'dateFormat']}>
                      <Input style={{ width: '100%' }} placeholder='YYYY-MM-DD HH:mm:ss' />
                    </Form.Item>
                  </Col>
                )}
              </Row>
            );
          }}
        </Form.Item>
        <Row gutter={10}>
          {showMinMax && (
            <Col span={8}>
              <Form.Item label={t('panel.standardOptions.min')} name={[...namePrefix, 'min']} initialValue={defaultMin}>
                <InputNumber placeholder='auto' style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          )}
          {showMinMax && (
            <Col span={8}>
              <Form.Item label={t('panel.standardOptions.max')} name={[...namePrefix, 'max']} initialValue={defaultMax}>
                <InputNumber placeholder='auto' style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          )}
          <Col span={showMinMax ? 8 : 24}>
            <Form.Item label={t('panel.standardOptions.decimals')} name={[...namePrefix, 'decimals']}>
              <InputNumber placeholder='auto' style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        {showDisplayName && (
          <Form.Item label={t('panel.standardOptions.displayName')} name={[...namePrefix, 'displayName']} tooltip={t('panel.standardOptions.displayName_tip')}>
            <Input />
          </Form.Item>
        )}
      </>
    </Panel>
  );
}
