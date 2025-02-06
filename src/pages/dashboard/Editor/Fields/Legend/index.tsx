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
  const displayMode = Form.useWatch([...namePrefix, 'displayMode']);
  const placement = Form.useWatch([...namePrefix, 'placement']);
  const legendSizeKey = placement === 'bottom' ? 'height' : 'width';

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
        <Col span={7}>
          <Form.Item label={t('panel.options.legend.placement')} name={[...namePrefix, 'placement']} initialValue='bottom' hidden={displayMode === 'hidden'}>
            <Radio.Group buttonStyle='solid'>
              <Radio.Button value='bottom'>Bottom</Radio.Button>
              <Radio.Button value='right'>Right</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={t(`panel.options.legend.${legendSizeKey}InPercentage`)}
            name={[...namePrefix, `${legendSizeKey}InPercentage`]}
            tooltip={t(`panel.options.legend.${legendSizeKey}InPercentage_tip`)}
            hidden={displayMode === 'hidden'}
          >
            <InputNumber min={20} max={80} style={{ width: '100%' }} placeholder='auto' />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label={t('panel.options.legend.columns')} name={[...namePrefix, 'columns']} hidden={displayMode === 'hidden'}>
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
        <Col span={12}>
          <Form.Item label={t('panel.options.legend.behaviour.label')} name={[...namePrefix, 'behaviour']} initialValue='showItem' hidden={displayMode === 'hidden'}>
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
        <Col span={12}>
          <Form.Item label={t('panel.options.legend.selectMode.label')} name={[...namePrefix, 'selectMode']} initialValue='single' hidden={displayMode === 'hidden'}>
            <Select
              options={[
                {
                  label: t('panel.options.legend.selectMode.single'),
                  value: 'single',
                },
                {
                  label: t('panel.options.legend.selectMode.multiple'),
                  value: 'multiple',
                },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={9}>
          <Form.Item label={t('panel.custom.detailName')} name={[...namePrefix, 'detailName']} hidden={displayMode === 'hidden'}>
            <Input style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={15}>
          <Form.Item
            label={t('panel.custom.detailUrl')}
            name={[...namePrefix, 'detailUrl']}
            tooltip={{
              overlayInnerStyle: { width: 330 },
              title: <Trans ns='dashboard' i18nKey='dashboard:var.help_tip' components={{ 1: <br /> }} />,
            }}
            hidden={displayMode === 'hidden'}
          >
            <Input style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
    </Panel>
  );
}
