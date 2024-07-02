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
import React, { useEffect } from 'react';
import { Form, Select, Row, Col, Switch, Radio, Button, Mentions, Space, Tooltip, Input } from 'antd';
import { DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';
import { Panel } from '../../Components/Collapse';
import { calcsOptions } from '../../config';
import { useGlobalState } from '../../../globalState';

export default function GraphStyles({ chartForm, variableConfigWithOptions }) {
  const { t, i18n } = useTranslation('dashboard');
  const namePrefix = ['custom'];
  const [tableFields, setTableFields] = useGlobalState('tableFields');
  const [tableRefIds, setTableRefIds] = useGlobalState('tableRefIds');
  const calc = Form.useWatch([...namePrefix, 'calc']);

  useEffect(() => {
    return () => {
      setTableFields([]);
      setTableRefIds([]);
    };
  }, []);

  return (
    <Panel header={t('panel.custom.title')}>
      <>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label={t('panel.custom.table.showHeader')} name={[...namePrefix, 'showHeader']} valuePropName='checked'>
              <Switch size='small' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('panel.custom.colorMode')} name={[...namePrefix, 'colorMode']} tooltip={t('panel.custom.table.colorMode_tip')}>
              <Radio.Group buttonStyle='solid'>
                <Radio.Button value='value'>{t('panel.custom.value')}</Radio.Button>
                <Radio.Button value='background'>{t('panel.custom.background')}</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('panel.custom.table.nowrap')} name={[...namePrefix, 'nowrap']} valuePropName='checked'>
              <Switch size='small' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('panel.custom.table.tableLayout.label')} name={[...namePrefix, 'tableLayout']} tooltip={t('panel.custom.table.tableLayout.label_tip')}>
              <Select
                options={[
                  {
                    label: t('panel.custom.table.tableLayout.fixed'),
                    value: 'fixed',
                  },
                  {
                    label: t('panel.custom.table.tableLayout.auto'),
                    value: 'auto',
                  },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label={t('panel.custom.calc')} name={[...namePrefix, 'calc']} tooltip={t('panel.custom.calc_tip')}>
          <Select>
            {_.map(
              {
                ...calcsOptions,
                origin: 'origin',
              },
              (item, key) => {
                return (
                  <Select.Option key={key} value={key}>
                    {t(`calcs.${key}`)}
                  </Select.Option>
                );
              },
            )}
          </Select>
        </Form.Item>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label={t('panel.custom.table.displayMode')} name={[...namePrefix, 'displayMode']}>
              <Select
                onChange={(val) => {
                  if (val === 'labelsOfSeriesToRows') {
                    chartForm.setFieldsValue({ custom: { columns: [] } });
                  } else if (val === 'labelValuesToRows') {
                    chartForm.setFieldsValue({ custom: { aggrDimension: [] } });
                  }
                }}
              >
                <Select.Option value='seriesToRows'>{t('panel.custom.table.seriesToRows')}</Select.Option>
                <Select.Option value='labelsOfSeriesToRows'>{t('panel.custom.table.labelsOfSeriesToRows')}</Select.Option>
                <Select.Option value='labelValuesToRows'>{t('panel.custom.table.labelValuesToRows')}</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Form.Item noStyle shouldUpdate={(prevValues, curValues) => _.get(prevValues, [...namePrefix, 'displayMode']) !== _.get(curValues, [...namePrefix, 'displayMode'])}>
            {({ getFieldValue }) => {
              if (getFieldValue([...namePrefix, 'displayMode']) === 'labelsOfSeriesToRows') {
                return (
                  <Col span={12}>
                    <Form.Item label={t('panel.custom.table.columns')} name={[...namePrefix, 'columns']}>
                      <Select mode='multiple' placeholder=''>
                        {_.map(_.concat(calc === 'origin' ? '__time__' : [], tableFields, 'value'), (item) => {
                          return (
                            <Select.Option key={item} value={item}>
                              {item}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  </Col>
                );
              }
              if (getFieldValue([...namePrefix, 'displayMode']) === 'labelValuesToRows') {
                return (
                  <Col span={12}>
                    <Form.Item label={t('panel.custom.table.aggrDimension')} name={[...namePrefix, 'aggrDimension']}>
                      <Select mode='multiple'>
                        {_.map(_.concat(calc === 'origin' ? '__time__' : [], tableFields), (item) => {
                          return (
                            <Select.Option key={item} value={item}>
                              {item}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  </Col>
                );
              }
              return null;
            }}
          </Form.Item>
        </Row>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                const displayMode = getFieldValue([...namePrefix, 'displayMode']);
                const fieldColumns = getFieldValue([...namePrefix, 'columns']);
                const columns = !_.isEmpty(fieldColumns) ? fieldColumns : _.concat(tableFields, 'value');
                let aggrDimension = getFieldValue([...namePrefix, 'aggrDimension']);
                aggrDimension = _.isArray(aggrDimension) ? aggrDimension : [aggrDimension];
                let keys: string[] = [];
                if (displayMode === 'seriesToRows') {
                  keys = ['name', 'value'];
                } else if (displayMode === 'labelsOfSeriesToRows') {
                  keys = columns;
                } else if (displayMode === 'labelValuesToRows') {
                  keys = _.concat(_.isEmpty(aggrDimension) ? ['name'] : aggrDimension, tableRefIds);
                }

                return (
                  <Form.Item label={t('panel.custom.table.sortColumn')} name={[...namePrefix, 'sortColumn']}>
                    <Select
                      allowClear
                      onChange={() => {
                        if (!chartForm.getFieldValue([...namePrefix, 'sortOrder'])) {
                          const customValues = chartForm.getFieldValue('custom');
                          _.set(customValues, 'sortOrder', 'ascend');
                          chartForm.setFieldsValue({
                            custom: customValues,
                          });
                        }
                      }}
                    >
                      {_.map(keys, (item) => {
                        return (
                          <Select.Option key={item} value={item}>
                            {item}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                );
              }}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('panel.custom.table.sortOrder')} name={[...namePrefix, 'sortOrder']}>
              <Select allowClear>
                <Select.Option value='ascend'>Asc</Select.Option>
                <Select.Option value='descend'>Desc</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label={t('panel.custom.table.link.mode')} name={[...namePrefix, 'linkMode']} initialValue='appendLinkColumn'>
          <Radio.Group buttonStyle='solid'>
            <Radio.Button value='appendLinkColumn'>{t('panel.custom.table.link.appendLinkColumn')}</Radio.Button>
            <Radio.Button value='cellLink'>{t('panel.custom.table.link.cellLink')}</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label={
            <Space>
              {t('panel.base.link.label')}
              <Tooltip title={<Trans ns='dashboard' i18nKey='dashboard:link.url_tip' components={{ 1: <br /> }} />}>
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
          style={{ marginBottom: 0 }}
        >
          <Form.List name={[...namePrefix, 'links']}>
            {(fields, { add, remove }) => (
              <>
                <Button
                  style={{ width: '100%', marginBottom: 10 }}
                  onClick={() => {
                    add({});
                  }}
                >
                  {t('panel.base.link.btn')}
                </Button>
                {fields.map(({ key, name, ...restField }) => {
                  return (
                    <Space
                      key={key}
                      style={{
                        alignItems: 'flex-start',
                      }}
                    >
                      <Form.Item
                        {...restField}
                        name={[name, 'title']}
                        rules={[
                          {
                            required: true,
                            message: t('panel.base.link.name_msg'),
                          },
                        ]}
                      >
                        <Input placeholder={t('link.name')} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'url']}
                        rules={[
                          {
                            required: true,
                            message: t('panel.base.link.url_msg'),
                          },
                        ]}
                      >
                        <Input style={{ width: 284 }} placeholder={t('link.url')} />
                      </Form.Item>
                      <Tooltip title={t('panel.base.link.isNewBlank')}>
                        <Form.Item {...restField} name={[name, 'targetBlank']} valuePropName='checked'>
                          <Switch />
                        </Form.Item>
                      </Tooltip>
                      <Button
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          remove(name);
                        }}
                      />
                    </Space>
                  );
                })}
              </>
            )}
          </Form.List>
        </Form.Item>
        <Form.Item label={t('panel.base.description')} name='description'>
          <Mentions prefix='$' split='' rows={3}>
            {_.map(variableConfigWithOptions, (item) => {
              return (
                <Mentions.Option key={item.name} value={item.name}>
                  {item.name}
                </Mentions.Option>
              );
            })}
          </Mentions>
        </Form.Item>
      </>
    </Panel>
  );
}
