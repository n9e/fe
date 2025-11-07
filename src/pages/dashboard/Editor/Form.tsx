import React, { useImperativeHandle, forwardRef, useContext } from 'react';
import { Form, Row, Col, Button, Space, Switch, Tooltip, Mentions, Collapse as AntdCollapse, Select } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';
import queryString from 'query-string';
import { useLocation } from 'react-router-dom';

import { CommonStateContext } from '@/App';
import { SIZE } from '@/utils/constant';

import { defaultValues, defaultCustomValuesMap } from './config';
import Options from './Options';
import Collapse, { Panel } from './Components/Collapse';
import Renderer from '../Renderer/Renderer';
import { useGlobalState } from '../globalState';
import QueryEditor from './QueryEditor';
import VariablesMain from '../Variables/Main';

interface IProps {
  panelWidth?: number; // 面板宽度
  initialValues: any;
  range: any;
  timezone: string;
  id: string;
  editModalVariablecontainerRef: React.RefObject<HTMLDivElement>;
}

function FormCpt(props: IProps, ref) {
  const { t } = useTranslation('dashboard');
  const { darkMode } = useContext(CommonStateContext);
  const [variablesWithOptions] = useGlobalState('variablesWithOptions');
  const [chartForm] = Form.useForm();
  const { panelWidth, initialValues, range, timezone, id } = props;
  const type = Form.useWatch('type', chartForm);
  const values = Form.useWatch([], chartForm);
  const location = useLocation();
  const queryParams = location.search ? queryString.parse(location.search) : {};

  defaultValues.custom = defaultCustomValuesMap[initialValues?.type || defaultValues.type];

  _.forEach(initialValues.targets, (item) => {
    if (_.get(item, 'time.unit')) {
      delete item.time;
    }
  });

  useImperativeHandle(ref, () => ({
    getFormInstance: () => {
      return chartForm;
    },
  }));

  return (
    <Form layout='vertical' preserve={true} form={chartForm} initialValues={_.merge({}, defaultValues, initialValues)}>
      <Form.Item name='type' hidden>
        <div />
      </Form.Item>
      <Form.Item name='id' hidden>
        <div />
      </Form.Item>
      <Form.Item name='layout' hidden>
        <div />
      </Form.Item>
      <Form.Item name='version' hidden>
        <div />
      </Form.Item>
      <div
        style={{
          height: 'calc(100vh - 150px)',
        }}
      >
        <Row
          gutter={SIZE * 2}
          style={{
            flexWrap: 'nowrap',
            height: '100%',
          }}
        >
          <Col flex={1} style={{ minWidth: 100 }}>
            <div className='n9e-dashboard-editor-modal-left-wrapper n9e-gap-2'>
              <div className='n9e-dashboard-editor-modal-left-vars-wrapper n9e-gap-2'>
                <span>{t('var.vars')}</span>
                {/* 直接渲染变量选择器，避免依赖 portal 对 ref 变化不触发重渲染的问题 */}
                <VariablesMain variableValueFixed={queryParams.__variable_value_fixed as any} loading={false} />
              </div>
              <div className='n9e-border-base n9e-dashboard-editor-modal-left-chart-wrapper'>
                {values && (
                  <Renderer id={`${id}__editor__`} time={range} timezone={timezone} values={values} isPreview themeMode={darkMode ? 'dark' : undefined} annotations={[]} />
                )}
              </div>
              {!_.includes(['text', 'iframe'], type) && (
                <div className='n9e-dashboard-editor-modal-left-query-wrapper'>
                  <QueryEditor panelWidth={panelWidth} type={type} variablesWithOptions={variablesWithOptions} />
                </div>
              )}
            </div>
          </Col>
          <Col flex='600px' style={{ overflowY: 'auto' }}>
            <Collapse>
              <Panel header={t('panel.base.title')}>
                <>
                  <Form.Item
                    label={t('panel.base.name')}
                    name='name'
                    tooltip={
                      <div>
                        <div>{t('panel.base.name_tip')}</div>
                        <Trans ns='dashboard' i18nKey='dashboard:panel.base.link.label_tip' components={{ br: <br /> }} />
                      </div>
                    }
                    rules={[
                      {
                        required: type === 'table',
                      },
                    ]}
                  >
                    <Mentions prefix='$' split=''>
                      {_.map(variablesWithOptions, (item) => {
                        return (
                          <Mentions.Option key={item.name} value={item.name}>
                            {item.name}
                          </Mentions.Option>
                        );
                      })}
                    </Mentions>
                  </Form.Item>
                  <Form.Item
                    label={t('panel.base.link.label')}
                    tooltip={<Trans ns='dashboard' i18nKey='dashboard:panel.base.link.label_tip' components={{ br: <br /> }} />}
                    style={{ marginBottom: 0 }}
                  >
                    <Form.List name={'links'}>
                      {(fields, { add, remove }) => (
                        <>
                          <Button
                            className='mb1'
                            style={{ width: '100%' }}
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
                                  <Mentions prefix='$' split='' placeholder={t('panel.base.link.name')}>
                                    {_.map(variablesWithOptions, (item) => {
                                      return (
                                        <Mentions.Option key={item.name} value={item.name}>
                                          {item.name}
                                        </Mentions.Option>
                                      );
                                    })}
                                  </Mentions>
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
                                  <Mentions prefix='$' split='' style={{ width: 280 }} placeholder={t('panel.base.link.url')}>
                                    {_.map(variablesWithOptions, (item) => {
                                      return (
                                        <Mentions.Option key={item.name} value={item.name}>
                                          {item.name}
                                        </Mentions.Option>
                                      );
                                    })}
                                  </Mentions>
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
                    <Form.Item
                      label={t('panel.base.description')}
                      name='description'
                      tooltip={<Trans ns='dashboard' i18nKey='dashboard:panel.base.link.label_tip' components={{ br: <br /> }} />}
                    >
                      <Mentions prefix='$' split='' rows={3}>
                        {_.map(variablesWithOptions, (item) => {
                          return (
                            <Mentions.Option key={item.name} value={item.name}>
                              {item.name}
                            </Mentions.Option>
                          );
                        })}
                      </Mentions>
                    </Form.Item>
                  </Form.Item>
                  <AntdCollapse ghost defaultActiveKey={[]}>
                    <AntdCollapse.Panel header={t('panel.base.repeatOptions.title')} key='1' forceRender>
                      <Row gutter={10}>
                        <Col span={12}>
                          <Form.Item label={t('panel.base.repeatOptions.byVariable')} name='repeat' tooltip={t('panel.base.repeatOptions.byVariableTip')}>
                            <Select allowClear>
                              {_.map(variablesWithOptions, (item) => {
                                return (
                                  <Select.Option key={item.name} value={item.name}>
                                    {item.name}
                                  </Select.Option>
                                );
                              })}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item label={t('panel.base.repeatOptions.maxPerRow')} name='maxPerRow' initialValue={4}>
                            <Select allowClear>
                              {_.map([2, 3, 4, 6, 8, 12], (item) => {
                                return (
                                  <Select.Option key={item} value={item}>
                                    {item}
                                  </Select.Option>
                                );
                              })}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                    </AntdCollapse.Panel>
                  </AntdCollapse>
                </>
              </Panel>
              <Form.Item shouldUpdate={(prevValues, curValues) => !_.isEqual(prevValues.targets, curValues.targets)}>
                {({ getFieldValue }) => {
                  return <Options type={getFieldValue('type')} targets={getFieldValue('targets')} />;
                }}
              </Form.Item>
            </Collapse>
          </Col>
        </Row>
      </div>
    </Form>
  );
}

export default forwardRef(FormCpt);
