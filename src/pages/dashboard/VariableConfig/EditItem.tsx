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
import React, { useContext } from 'react';
import { Form, Input, Row, Col, Select, Switch, Button, Space, Alert } from 'antd';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';

import { DatasourceCateEnum } from '@/utils/constant';
import { DatasourceSelectV2 } from '@/components/DatasourceSelect';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { CommonStateContext } from '@/App';
import { Dashboard } from '@/store/dashboardInterface';
import { allCates } from '@/components/AdvancedWrap/utils';

import { IVariable } from './definition';
import { stringToRegex } from './constant';
import Querybuilder from './Querybuilder';

interface IProps {
  id: string;
  range: IRawTimeRange;
  index: number;
  data: IVariable;
  vars: IVariable[];
  datasourceVars: IVariable[];
  editMode?: number; // 0: 变量名、类型、数据源类型、数据源值无法修改
  onOk: (val: IVariable) => void;
  onCancel: () => void;
  dashboard: Dashboard;
}

const typeOptions = [
  {
    label: 'Query',
    value: 'query',
  },
  {
    label: 'Custom',
    value: 'custom',
  },
  {
    label: 'Text box',
    value: 'textbox',
  },
  {
    label: 'Constant',
    value: 'constant',
  },
  {
    label: 'Datasource',
    value: 'datasource',
  },
  // {
  //   label: 'Datasource name',
  //   value: 'datasourceName',
  // },
  {
    label: 'Host ident',
    value: 'hostIdent',
  },
];

function EditItem(props: IProps) {
  const { t } = useTranslation('dashboard');
  const { data, vars, id, datasourceVars, onOk, onCancel, dashboard, editMode } = props;
  const anonymousAccess = dashboard.public === 1 && dashboard.public_cate === 0;
  const [form] = Form.useForm();
  const { groupedDatasourceList, datasourceCateOptions, datasourceList } = useContext(CommonStateContext);
  const otherVars = _.filter(vars, (item) => item.name !== data.name);
  const varType = Form.useWatch(['type'], form);
  const datesourceCate = Form.useWatch(['datasource', 'cate'], form);

  return (
    <Form layout='vertical' autoComplete='off' preserve={false} form={form} initialValues={data}>
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item
            label={t('var.name')}
            name='name'
            rules={[
              { required: true },
              { pattern: /^[0-9a-zA-Z_]+$/, message: t('var.name_msg') },
              () => ({
                validator(_rule, value) {
                  // 如果 name 重复，提示错误
                  if (_.find(otherVars, { name: value })) {
                    return Promise.reject(t('var.name_repeat_msg'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input disabled={editMode === 0} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label={t('var.label')} name='label'>
            <Input disabled={editMode === 0} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label={t('var.type')} name='type' rules={[{ required: true }]}>
            <Select
              style={{ width: '100%' }}
              onChange={(val) => {
                form.setFieldsValue({
                  definition: '',
                  defaultValue: '',
                  hide: _.includes(['constant'], val),
                });
              }}
              disabled={editMode === 0}
            >
              {_.map(typeOptions, (item) => {
                return (
                  <Select.Option value={item.value} key={item.value}>
                    {t(`var.type_map.${item.value}`)}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Col>
        {/* initialValue 值为了兼容旧的 constant 默认值为 true */}
        <Col span={6}>
          <Form.Item label={t('var.hide')} name='hide' valuePropName='checked' initialValue={_.includes(['constant'], varType)}>
            <Switch disabled={editMode === 0} />
          </Form.Item>
        </Col>
      </Row>
      {varType === 'query' && (
        <>
          <Form.Item name={['datasource', 'cate']} hidden>
            <div />
          </Form.Item>
          <Form.Item
            label={t('common:datasource.id')}
            name={['datasource', 'value']}
            rules={[
              {
                required: true,
                message: t('query.datasource_msg'),
              },
            ]}
          >
            <DatasourceSelectV2
              datasourceCateList={_.filter(datasourceCateOptions, (item) => {
                return item.dashboardVariable === true;
              })}
              datasourceList={_.filter(
                _.concat(
                  _.map(datasourceVars, (item) => {
                    return {
                      id: `\${${item.name}}`,
                      name: `\${${item.name}}`,
                      plugin_type: item.definition,
                    };
                  }),
                  datasourceList as any,
                ),
                (item) => {
                  return _.find(allCates, { value: item.plugin_type })?.dashboardVariable === true;
                },
              )}
              onChange={(val) => {
                const cate = _.find(
                  _.concat(
                    _.map(datasourceVars, (item) => {
                      return {
                        id: `\${${item.name}}`,
                        name: `\${${item.name}}`,
                        plugin_type: item.definition,
                      };
                    }),
                    datasourceList as any,
                  ),
                  { id: val },
                )?.plugin_type;
                form.setFieldsValue({
                  datasource: {
                    cate: cate,
                    value: val,
                  },
                });
              }}
            />
          </Form.Item>
          <Querybuilder dashboardId={id} variables={vars} />
          <Form.Item
            label={t('var.reg')}
            name='reg'
            tooltip={
              <Trans
                ns='dashboard'
                i18nKey='var.reg_tip'
                components={{ a: <a target='_blank' href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions' /> }}
              />
            }
            rules={[{ pattern: new RegExp('^/(.*?)/(g?i?m?y?)$'), message: 'invalid regex' }]}
          >
            <Input placeholder='/*.hna/' />
          </Form.Item>
        </>
      )}
      {varType === 'textbox' && (
        <Form.Item label={t('var.textbox.defaultValue')} name='defaultValue'>
          <Input />
        </Form.Item>
      )}
      {varType === 'custom' && (
        <Form.Item label={t('var.custom.definition')} name='definition' rules={[{ required: true }]}>
          <Input placeholder='1,10' />
        </Form.Item>
      )}
      {varType === 'constant' && (
        <Form.Item label={t('var.constant.definition')} name='definition' tooltip={t('var.constant.defaultValue_tip')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      )}
      {varType === 'datasource' && (
        <>
          <Form.Item label={t('var.datasource.definition')} name='definition' rules={[{ required: true }]}>
            <Select disabled={editMode === 0}>
              {_.map(datasourceCateOptions, (item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={t('var.datasource.regex')}
            name='regex'
            tooltip={
              <Trans
                ns='dashboard'
                i18nKey='var.datasource.regex_tip'
                components={{ a: <a target='_blank' href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions' /> }}
              />
            }
            rules={[{ pattern: new RegExp('^/(.*?)/(g?i?m?y?)$'), message: 'invalid regex' }]}
          >
            <Input placeholder='/vm/' />
          </Form.Item>
          <Form.Item shouldUpdate={(prevValues, curValues) => prevValues?.definition !== curValues?.regex || prevValues?.regex} noStyle>
            {({ getFieldValue }) => {
              const definition = getFieldValue('definition');
              const regex = getFieldValue('regex');
              return (
                <Form.Item label={t('var.datasource.defaultValue')} name='defaultValue'>
                  <Select>
                    {_.map(
                      _.filter(groupedDatasourceList[definition], (item) => {
                        if (regex) {
                          const reg = stringToRegex(regex);
                          return reg ? reg.test(item.name) : false;
                        }
                        return true;
                      }),
                      (item) => (
                        <Select.Option key={item.id} value={item.id}>
                          {item.name}
                        </Select.Option>
                      ),
                    )}
                  </Select>
                </Form.Item>
              );
            }}
          </Form.Item>
        </>
      )}
      {varType === 'hostIdent' && (
        <>
          {anonymousAccess && <Alert className='mb2' type='warning' message={t('var.hostIdent.invalid')} />}
          <Form.Item
            label={t('var.reg')}
            name='reg'
            tooltip={
              <Trans
                ns='dashboard'
                i18nKey='var.reg_tip'
                components={{ a: <a target='_blank' href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions' /> }}
              />
            }
            rules={[{ pattern: new RegExp('^/(.*?)/(g?i?m?y?)$'), message: 'invalid regex' }]}
          >
            <Input placeholder='/*.hna/' />
          </Form.Item>
        </>
      )}
      {_.includes(['custom', 'hostIdent'], varType) ||
        (_.includes([DatasourceCateEnum.prometheus, DatasourceCateEnum.elasticsearch, DatasourceCateEnum.pgsql], datesourceCate) && (
          <Row gutter={16}>
            <Col flex='120px'>
              <Form.Item label={t('var.multi')} name='multi' valuePropName='checked'>
                <Switch />
              </Form.Item>
            </Col>
            <Col flex='120px'>
              <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.multi !== curValues.multi} noStyle>
                {({ getFieldValue }) => {
                  const multi = getFieldValue('multi');
                  if (multi) {
                    return (
                      <Form.Item label={t('var.allOption')} name='allOption' valuePropName='checked'>
                        <Switch />
                      </Form.Item>
                    );
                  }
                }}
              </Form.Item>
            </Col>
            <Col flex='auto'>
              <Form.Item shouldUpdate noStyle>
                {({ getFieldValue }) => {
                  const multi = getFieldValue('multi');
                  const allOption = getFieldValue('allOption');
                  if (multi && allOption) {
                    return (
                      <Form.Item label={t('var.allValue')} name='allValue'>
                        <Input placeholder='.*' />
                      </Form.Item>
                    );
                  }
                }}
              </Form.Item>
            </Col>
          </Row>
        ))}
      <Form.Item>
        <Space>
          <Button
            type='primary'
            onClick={() => {
              form.validateFields().then((res) => {
                onOk(res);
              });
            }}
            disabled={varType === 'hostIdent' && anonymousAccess}
          >
            {t('common:btn.save')}
          </Button>
          <Button onClick={onCancel}>{t('common:btn.cancel')}</Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

export default EditItem;
