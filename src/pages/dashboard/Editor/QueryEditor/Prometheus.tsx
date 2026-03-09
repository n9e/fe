import React from 'react';
import { Form, Row, Col, Input, Switch, Space, Tag, Tooltip } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';

import { alphabet } from '@/utils/constant';
import Resolution from '@/components/Resolution';
import PromQLInputNG, { interpolateString } from '@/components/PromQLInputNG';
import { getRealStep } from '@/pages/dashboard/Renderer/datasource/prometheus';
import QueryExtraActions from '@/pages/dashboard/Components/QueryExtraActions';
import { useGlobalState } from '@/pages/dashboard/globalState';

import Collapse, { Panel } from '../Components/Collapse';
import ExpressionPanel from '../Components/ExpressionPanel';
import AddQueryButtons from '../Components/AddQueryButtons';

export default function Prometheus({ panelWidth, datasourceValue, range }) {
  const { t } = useTranslation('dashboard');
  const [variablesWithOptions] = useGlobalState('variablesWithOptions');
  const varNams = _.map(variablesWithOptions, (item) => {
    return `$${item.name}`;
  });
  const targets = Form.useWatch('targets');
  const chartType = Form.useWatch('type');
  const maxDataPoints = Form.useWatch('maxDataPoints');
  const queryOptionsTime = Form.useWatch('queryOptionsTime');

  return (
    <Form.List name='targets'>
      {(fields, { add, remove }, { errors }) => {
        return (
          <>
            <Collapse>
              {_.map(fields, (field, index) => {
                const { __mode__ } = targets?.[field.name] || {};
                if (__mode__ === '__expr__') {
                  return <ExpressionPanel key={field.key} fields={fields} remove={remove} field={field} />;
                }
                return (
                  <Panel
                    header={
                      <Form.Item noStyle shouldUpdate>
                        {({ getFieldValue }) => {
                          const target = getFieldValue(['targets', field.name]);
                          const step = getRealStep({
                            time: queryOptionsTime || range,
                            maxDataPoints,
                            panelWidth: panelWidth,
                            minStep: target?.step,
                          });
                          const name = target?.refId || alphabet[index];
                          return (
                            <Space>
                              {name}
                              {step ? (
                                <Tooltip placement='right' title={t('query.prometheus.step.tag_tip')}>
                                  <Tag color='purple'>{`step=${step}s`}</Tag>
                                </Tooltip>
                              ) : null}
                            </Space>
                          );
                        }}
                      </Form.Item>
                    }
                    key={field.key}
                    extra={
                      <Space>
                        <QueryExtraActions field={field} add={add} />
                        {fields.length > 1 ? (
                          <DeleteOutlined
                            onClick={() => {
                              remove(field.name);
                            }}
                          />
                        ) : null}
                      </Space>
                    }
                  >
                    <Form.Item noStyle {...field} name={[field.name, 'refId']}>
                      <div />
                    </Form.Item>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Form.Item
                        label={t('query.prometheus.query')}
                        tooltip={{
                          overlayInnerStyle: { width: 330 },
                          title: <Trans ns='dashboard' i18nKey='dashboard:var.help_tip' components={{ 1: <br /> }} />,
                        }}
                        {...field}
                        name={[field.name, 'expr']}
                        validateTrigger={['onBlur']}
                        rules={[
                          {
                            required: true,
                            message: '',
                          },
                        ]}
                        style={{ flex: 1 }}
                      >
                        <PromQLInputNG
                          onChangeTrigger={['onBlur', 'onEnter']}
                          datasourceValue={datasourceValue}
                          variablesNames={varNams}
                          durationVariablesCompletion
                          showBuiltinMetrics
                          interpolateString={(query) => {
                            return interpolateString({
                              query,
                              range: range,
                              minStep: targets?.[field.name]?.step,
                            });
                          }}
                        />
                      </Form.Item>
                    </div>
                    <Row gutter={10}>
                      {chartType !== 'tableNG' && (
                        <Col flex='auto'>
                          <Form.Item
                            label={t('query.legend')}
                            {...field}
                            name={[field.name, 'legend']}
                            tooltip={{
                              getPopupContainer: () => document.body,
                              title: t('query.legendTip', {
                                interpolation: { skipOnVariables: true },
                              }),
                            }}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                      )}
                      <Col flex='none'>
                        <Form.Item label={t('query.prometheus.minStep.label')} tooltip={t('query.prometheus.minStep.tip')} {...field} name={[field.name, 'step']}>
                          <Resolution placeholder='15' width='100%' />
                        </Form.Item>
                      </Col>
                      <Col flex='none'>
                        <Form.Item
                          label={t('query.prometheus.instant.label')}
                          tooltip={t('query.prometheus.instant.tip')}
                          {...field}
                          name={[field.name, 'instant']}
                          valuePropName='checked'
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Panel>
                );
              })}

              <Form.ErrorList errors={errors} />
            </Collapse>
            <AddQueryButtons
              add={add}
              addQuery={(newRefId) => {
                add({ expr: '', __mode__: '__query__', refId: newRefId });
              }}
            />
          </>
        );
      }}
    </Form.List>
  );
}
