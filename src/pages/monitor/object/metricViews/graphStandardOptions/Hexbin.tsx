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
import _ from 'lodash';
import { Dropdown, Switch, Row, Col, InputNumber } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import UnitPicker from '@/pages/dashboard/Components/UnitPicker';
import ColorRangeMenu from '../../../../dashboard/Components/ColorRangeMenu';
import { colors } from '../../../../dashboard/Components/ColorRangeMenu/config';

interface IProps {
  highLevelConfig: any;
  setHighLevelConfig: (val: any) => void;
}

export default function GraphStandardOptions(props: IProps) {
  const { highLevelConfig, setHighLevelConfig } = props;

  return (
    <div>
      <div style={{ marginBottom: 5 }}>
        Height:{' '}
        <InputNumber
          size='small'
          value={highLevelConfig.chartheight}
          onBlur={(e) => {
            setHighLevelConfig({ ...highLevelConfig, chartheight: _.toNumber(e.target.value) });
          }}
        />
      </div>
      <div style={{ marginBottom: 5 }}>
        Color:{' '}
        <Dropdown
          overlay={
            <ColorRangeMenu
              onClick={(e) => {
                setHighLevelConfig({ ...highLevelConfig, colorRange: _.split(e.key, ',') });
              }}
              selectedKeys={[_.join(highLevelConfig.colorRange, ',')]}
            />
          }
        >
          <a className='ant-dropdown-link' onClick={(e) => e.preventDefault()}>
            {_.get(
              _.find(colors, (item) => {
                return _.isEqual(item.value, highLevelConfig.colorRange);
              }),
              'label',
            )}{' '}
            <DownOutlined />
          </a>
        </Dropdown>
      </div>
      <div style={{ marginBottom: 5 }}>
        Reverse color order:{' '}
        <Switch
          size='small'
          checked={highLevelConfig.reverseColorOrder}
          onChange={(checked) => {
            setHighLevelConfig({ ...highLevelConfig, reverseColorOrder: checked });
          }}
        />
      </div>
      <div style={{ marginBottom: 5 }}>
        Auto min/max color values:{' '}
        <Switch
          size='small'
          checked={highLevelConfig.colorDomainAuto}
          onChange={(checked) => {
            setHighLevelConfig({ ...highLevelConfig, colorDomainAuto: checked, colorDomain: [0, 100] });
          }}
        />
      </div>
      {!highLevelConfig.colorDomainAuto && (
        <div style={{ marginBottom: 5 }}>
          <Row gutter={8}>
            <Col span={12}>
              <InputNumber
                size='small'
                addonBefore='min'
                style={{ width: 110 }}
                value={highLevelConfig.colorDomain[0]}
                onChange={(val) => {
                  setHighLevelConfig({ ...highLevelConfig, colorDomain: [val, highLevelConfig.colorDomain[1]] });
                }}
              />
            </Col>
            <Col span={12}>
              <InputNumber
                size='small'
                addonBefore='max'
                style={{ width: 110 }}
                value={highLevelConfig.colorDomain[1]}
                onChange={(val) => {
                  setHighLevelConfig({ ...highLevelConfig, colorDomain: [highLevelConfig.colorDomain[0], val] });
                }}
              />
            </Col>
          </Row>
        </div>
      )}
      <div>
        Value format with:{' '}
        <UnitPicker
          size='small'
          optionLabelProp='cleanLabelLink'
          bordered={false}
          dropdownMatchSelectWidth={false}
          value={highLevelConfig.unit}
          onChange={(val) => {
            setHighLevelConfig({ ...highLevelConfig, unit: val });
          }}
        />
      </div>
    </div>
  );
}
