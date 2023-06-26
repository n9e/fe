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
import { Form, Radio, Row, Col, Select, Input } from 'antd';
import _ from 'lodash';
import { Trans, useTranslation } from 'react-i18next';
import { Panel } from '../../Components/Collapse';
import { CaretDownOutlined } from '@ant-design/icons';

export default function index() {
  const { t } = useTranslation('dashboard');
  const namePrefix = ['options', 'legend'];
  const tableColumn = ['max', 'min', 'avg', 'sum', 'last'];

  return (
    <Panel header='Legend'>
      <Row gutter={10}>
        <Col span={12}>
          <Form.Item label={t('panel.options.legend.displayMode.label')} name={[...namePrefix, 'displayMode']}>
            <Radio.Group buttonStyle='solid'>
              <Radio.Button value='table'>{t('panel.options.legend.displayMode.table')}</Radio.Button>
              <Radio.Button value='list'>{t('panel.options.legend.displayMode.list')}</Radio.Button>
              <Radio.Button value='hidden'>{t('panel.options.legend.displayMode.hidden')}</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item noStyle shouldUpdate={(prevValues, curValues) => _.get(prevValues, [...namePrefix, 'displayMode']) !== _.get(curValues, [...namePrefix, 'displayMode'])}>
            {({ getFieldValue }) => {
              if (getFieldValue([...namePrefix, 'displayMode']) === 'list') {
                return (
                  <Form.Item label={t('panel.options.legend.placement')} name={[...namePrefix, 'placement']}>
                    <Radio.Group buttonStyle='solid'>
                      <Radio.Button value='bottom'>Bottom</Radio.Button>
                      <Radio.Button value='right'>Right</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                );
              } else if (getFieldValue([...namePrefix, 'displayMode']) === 'table') {
                return (
                  <Form.Item label={t('panel.options.legend.columns')} name={[...namePrefix, 'columns']}>
                    <Select mode='multiple' placeholder='' suffixIcon={<CaretDownOutlined />}>
                      {_.map(tableColumn, (item) => {
                        return (
                          <Select.Option key={item} value={item}>
                            {t(`panel.options.legend.${item}`)}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                );
              }
              return null;
            }}
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
