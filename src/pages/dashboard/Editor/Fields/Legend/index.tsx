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
import { Form, Radio, Row, Col, Select, Input, InputNumber } from 'antd';
import _ from 'lodash';
import { Trans, useTranslation } from 'react-i18next';
import { Panel } from '../../Components/Collapse';

export default function index() {
  const { t } = useTranslation('dashboard');
  const namePrefix = ['options', 'legend'];
  const tableColumn = ['max', 'min', 'avg', 'sum', 'last'];

  return (
    <Panel header='Legend'>
      <Row gutter={10}>
        <Col span={9}>
          <Form.Item label={t('panel.options.legend.displayMode.label')} name={[...namePrefix, 'displayMode']}>
            <Radio.Group buttonStyle='solid'>
              <Radio.Button value='table'>{t('panel.options.legend.displayMode.table')}</Radio.Button>
              <Radio.Button value='list'>{t('panel.options.legend.displayMode.list')}</Radio.Button>
              <Radio.Button value='hidden'>{t('panel.options.legend.displayMode.hidden')}</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Form.Item noStyle shouldUpdate={(prevValues, curValues) => _.get(prevValues, [...namePrefix, 'displayMode']) !== _.get(curValues, [...namePrefix, 'displayMode'])}>
          {({ getFieldValue }) => {
            const displayMode = getFieldValue([...namePrefix, 'displayMode']);
            return (
              <>
                <Col span={8}>
                  <Form.Item
                    label={t('panel.options.legend.heightInPercentage')}
                    name={[...namePrefix, 'heightInPercentage']}
                    tooltip={t('panel.options.legend.heightInPercentage_tip')}
                    initialValue={30}
                  >
                    <InputNumber min={20} max={80} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col
                  span={7}
                  style={{
                    display: displayMode === 'list' ? 'block' : 'none',
                  }}
                >
                  <Form.Item label={t('panel.options.legend.placement')} name={[...namePrefix, 'placement']} initialValue='bottom'>
                    <Radio.Group buttonStyle='solid'>
                      <Radio.Button value='bottom'>Bottom</Radio.Button>
                      <Radio.Button value='right'>Right</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </>
            );
          }}
        </Form.Item>
        <Col span={24}>
          <Form.Item label={t('panel.options.legend.columns')} name={[...namePrefix, 'columns']}>
            <Select mode='multiple'>
              {_.map(tableColumn, (item) => {
                return (
                  <Select.Option key={item} value={item}>
                    {t(`panel.options.legend.${item}`)}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label={t('panel.options.legend.behaviour.label')} name={[...namePrefix, 'behaviour']} initialValue='showItem'>
            <Select
              options={[
                {
                  label: t('panel.options.legend.behaviour.showItem'),
                  value: 'showItem',
                },
                {
                  label: t('panel.options.legend.behaviour.hideItem'),
                  value: 'hideItem',
                },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={9}>
          <Form.Item label={t('panel.custom.detailName')} name={[...namePrefix, 'detailName']}>
            <Input style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={15}>
          <Form.Item
            label={t('panel.custom.detailUrl')}
            name={[...namePrefix, 'detailUrl']}
            tooltip={{
              overlayInnerStyle: { width: 330 },
              title: <Trans ns='dashboard' i18nKey='dashboard:link.url_tip' components={{ 1: <br /> }} />,
            }}
          >
            <Input style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
    </Panel>
  );
}
