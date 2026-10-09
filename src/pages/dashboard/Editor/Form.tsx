import React, { useImperativeHandle, forwardRef, useContext, useLayoutEffect, useRef, useState } from 'react';
import { Form, Row, Col, Button, Space, Switch, Tooltip, Mentions, Collapse as AntdCollapse, Select } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useSize } from 'ahooks';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';
import queryString from 'query-string';
import { useLocation } from 'react-router-dom';
import { Resizable } from 're-resizable';

import { CommonStateContext } from '@/App';
import { SIZE } from '@/utils/constant';

import { defaultValues } from './config';
import { defaultCustomValuesMap } from '../Renderer/registry/defaults';
import Options from './Options';
import Collapse, { Panel } from './Components/Collapse';
import Renderer from '../Renderer/Renderer';
import { useGlobalState } from '../globalState';
import QueryEditor from './QueryEditor';
import VariablesMain from '../Variables/Main';
import { clampEditorLayout, editorLayoutMinimums, readEditorLayout, writeEditorLayout } from './editorLayout';
import type { IRawTimeRange } from '@/components/TimeRangePicker';
import type { IPanel } from '../types';

export interface EditorFormHandle {
  getFormInstance: () => ReturnType<typeof Form.useForm>[0];
}

interface IProps {
  panelWidth?: number; // 面板宽度
  initialValues: IPanel;
  range: IRawTimeRange;
  timezone: string;
  id: string;
  editModalVariablecontainerRef: React.RefObject<HTMLDivElement>;
}

function FormCpt(props: IProps, ref: React.ForwardedRef<EditorFormHandle>) {
  const { t } = useTranslation('dashboard');
  const { darkMode } = useContext(CommonStateContext);
  const [variablesWithOptions] = useGlobalState('variablesWithOptions');
  const [chartForm] = Form.useForm();
  const { panelWidth, initialValues, range, timezone, id } = props;
  const type = Form.useWatch('type', chartForm);
  const values = Form.useWatch([], chartForm);
  const location = useLocation();
  const queryParams = location.search ? queryString.parse(location.search) : {};
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorContainerSize = useSize(editorContainerRef);
  const [editorLayout, setEditorLayout] = useState(readEditorLayout);
  const hasQueryEditor = !_.includes(['text', 'iframe'], type);
  const layoutBounds = {
    maxPreviewHeight:
      hasQueryEditor && editorContainerSize?.height
        ? Math.max(editorLayoutMinimums.previewHeight, editorContainerSize.height - editorLayoutMinimums.queryHeight - SIZE * 5)
        : undefined,
    maxSidebarWidth: editorContainerSize?.width
      ? Math.max(editorLayoutMinimums.sidebarWidth, editorContainerSize.width - editorLayoutMinimums.workspaceWidth - SIZE * 2)
      : undefined,
  };
  const constrainedEditorLayout = clampEditorLayout(editorLayout, layoutBounds);

  const updateEditorLayout = (nextLayout: Partial<typeof editorLayout>, persist = false) => {
    setEditorLayout((currentLayout) => {
      const next = clampEditorLayout({ ...currentLayout, ...nextLayout }, layoutBounds);
      if (persist) writeEditorLayout(next);
      return next;
    });
  };

  defaultValues.custom = defaultCustomValuesMap[initialValues?.type || defaultValues.type];

  _.forEach(initialValues.targets, (item) => {
    if (_.get(item, 'time.unit')) {
      delete item.time;
    }
  });

  const formInitialValuesRef = useRef(_.merge({}, defaultValues, initialValues));
  useLayoutEffect(() => {
    // Form.Item / Form.List 中保留各数据源自己的默认值；已保存的面板配置在字段注册后统一覆盖默认值。
    // 不使用 Form.initialValues，避免同一路径同时存在 Item.initialValue 时触发 antd 警告。
    chartForm.setFieldsValue(formInitialValuesRef.current);
  }, [chartForm]);

  useImperativeHandle(ref, () => ({
    getFormInstance: () => {
      return chartForm;
    },
  }));

  return (
    <Form layout='vertical' preserve={true} form={chartForm}>
      <Form.Item name='type' hidden>
        <div />
      </Form.Item>
      <Form.Item name='id' hidden>
        <div />
      </Form.Item>
      <Form.Item name='layout' hidden>
        <div />
      </Form.Item>
      <div className='n9e-dashboard-editor-modal-workspace' ref={editorContainerRef}>
        <div className='n9e-dashboard-editor-modal-left-pane'>
          <div className='n9e-dashboard-editor-modal-left-wrapper'>
            <div className='n9e-dashboard-editor-modal-left-vars-wrapper gap-4'>
              <span>{t('var.vars')}</span>
              {/* 直接渲染变量选择器，避免依赖 portal 对 ref 变化不触发重渲染的问题 */}
              <VariablesMain variableValueFixed={queryParams.__variable_value_fixed === 'true'} loading={false} />
            </div>
            {hasQueryEditor ? (
              <Resizable
                className='n9e-dashboard-editor-modal-left-chart-resizable'
                size={{ width: '100%', height: constrainedEditorLayout.previewHeight }}
                minHeight={editorLayoutMinimums.previewHeight}
                maxHeight={layoutBounds.maxPreviewHeight}
                enable={{ bottom: true }}
                handleClasses={{ bottom: 'n9e-dashboard-editor-resize-handle n9e-dashboard-editor-resize-handle-horizontal' }}
                onResize={(_event, _direction, element) => {
                  updateEditorLayout({ previewHeight: element.offsetHeight });
                }}
                onResizeStop={(_event, _direction, element) => {
                  updateEditorLayout({ previewHeight: element.offsetHeight }, true);
                }}
              >
                <div className='fc-border rounded-lg bg-fc-100 n9e-dashboard-editor-modal-left-chart-wrapper'>
                  {values && (
                    <Renderer
                      id={`${id}__editor__`}
                      panelWidth={panelWidth}
                      time={range}
                      timezone={timezone}
                      values={values}
                      isPreview
                      themeMode={darkMode ? 'dark' : undefined}
                      annotations={[]}
                      onOverridesChange={(overrides) => {
                        chartForm.setFieldsValue({ overrides });
                      }}
                    />
                  )}
                </div>
              </Resizable>
            ) : (
              <div className='fc-border rounded-lg bg-fc-100 n9e-dashboard-editor-modal-left-chart-wrapper n9e-dashboard-editor-modal-left-chart-wrapper-full'>
                {values && (
                  <Renderer
                    id={`${id}__editor__`}
                    panelWidth={panelWidth}
                    time={range}
                    timezone={timezone}
                    values={values}
                    isPreview
                    themeMode={darkMode ? 'dark' : undefined}
                    annotations={[]}
                    onOverridesChange={(overrides) => {
                      chartForm.setFieldsValue({ overrides });
                    }}
                  />
                )}
              </div>
            )}
            {hasQueryEditor && (
              <div className='n9e-dashboard-editor-modal-left-query-wrapper'>
                <QueryEditor panelWidth={panelWidth} type={type} variablesWithOptions={variablesWithOptions} range={range} />
              </div>
            )}
          </div>
        </div>
        <Resizable
          className='n9e-dashboard-editor-modal-options-resizable'
          size={{ width: constrainedEditorLayout.sidebarWidth, height: '100%' }}
          minWidth={editorLayoutMinimums.sidebarWidth}
          maxWidth={layoutBounds.maxSidebarWidth}
          enable={{ left: true }}
          handleClasses={{ left: 'n9e-dashboard-editor-resize-handle n9e-dashboard-editor-resize-handle-vertical' }}
          onResize={(_event, _direction, element) => {
            updateEditorLayout({ sidebarWidth: element.offsetWidth });
          }}
          onResizeStop={(_event, _direction, element) => {
            updateEditorLayout({ sidebarWidth: element.offsetWidth }, true);
          }}
        >
          <div className='n9e-dashboard-editor-modal-options-wrapper'>
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
                            className='mb-2'
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
          </div>
        </Resizable>
      </div>
    </Form>
  );
}

export default forwardRef<EditorFormHandle, IProps>(FormCpt);
