import React, { useContext, useImperativeHandle, useRef, useState } from 'react';
import { Card, Space, Form, Tabs, Tag } from 'antd';
import { RightOutlined, DownOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import DocumentDrawer from '@/components/DocumentDrawer';
import { panelBaseProps } from '@/pages/alertRules/constants';

import Relabel from '../EventSettings/Relabel';
import WorkflowItem, { WorkflowItemRef, WorkflowTabTitle } from './WorkflowItem';
import Annotations from './Annotations';
import EnrichQueries from './EnrichQueries';

export interface PipelineConfigsNGRef {
  checkUnsavedAndNotify: () => boolean;
}

const PipelineConfigsNG = React.forwardRef<PipelineConfigsNGRef>((_props, ref) => {
  const { t, i18n } = useTranslation('alertRules');
  const { darkMode } = useContext(CommonStateContext);

  const [collapsed, setCollapsed] = useState(true);
  const [relabelCollapsed, setRelabelCollapsed] = useState(true);
  const [activeWorkflowTabKey, setActiveWorkflowTabKey] = useState('0');

  const pipeline_configs = Form.useWatch('pipeline_configs');
  const workflowItemRefMap = useRef<Record<string, WorkflowItemRef | null>>({});
  const workflowOrderRef = useRef<string[]>([]);

  const isMultiWorkflow = _.get(pipeline_configs, 'length', 0) > 1;

  useImperativeHandle(ref, () => ({
    checkUnsavedAndNotify: () => {
      const workflowOrder = workflowOrderRef.current;

      Object.values(workflowItemRefMap.current).forEach((workflowRef) => {
        workflowRef?.closeUnsavedPopover();
      });

      const firstUnsavedKey = workflowOrder.find((workflowKey) => {
        return workflowItemRefMap.current[workflowKey]?.isUnsaved();
      });

      if (firstUnsavedKey === undefined) {
        return false;
      }

      const focusUnsavedButton = () => {
        workflowItemRefMap.current[firstUnsavedKey]?.focusSaveButtonWithPopover();
      };

      if (isMultiWorkflow && activeWorkflowTabKey !== firstUnsavedKey) {
        setActiveWorkflowTabKey(firstUnsavedKey);
        setTimeout(() => {
          focusUnsavedButton();
        }, 0);
      } else {
        focusUnsavedButton();
      }

      return true;
    },
  }));

  return (
    <Card
      {...panelBaseProps}
      title={
        <Space
          className='cursor-pointer'
          onClick={() => {
            setCollapsed(!collapsed);
          }}
        >
          {t('pipeline_configuration_ng.title')}
          {collapsed ? <RightOutlined /> : <DownOutlined />}
          {isMultiWorkflow && <Tag color='orange'>{t('pipeline_configuration_ng.legacy_multi_workflow_tip')}</Tag>}
        </Space>
      }
      bodyStyle={{
        display: collapsed ? 'none' : 'block',
        paddingTop: isMultiWorkflow ? 0 : undefined,
      }}
    >
      <Form.List
        name='pipeline_configs'
        initialValue={[
          {
            enable: true,
            processors: [],
          },
        ]}
      >
        {(fields, { add, remove }, { errors }) => (
          <>
            {(() => {
              workflowOrderRef.current = _.map(fields, (field) => String(field.key));
              return null;
            })()}
            {isMultiWorkflow ? (
              <>
                <Tabs activeKey={activeWorkflowTabKey} onChange={setActiveWorkflowTabKey} destroyInactiveTabPane={false}>
                  {fields.map((field, index) => {
                    const workflowId = _.get(pipeline_configs, [index, 'pipeline_id']);
                    const workflowEnabled = _.get(pipeline_configs, [index, 'enable']);
                    return (
                      <Tabs.TabPane
                        tab={<WorkflowTabTitle workflowId={workflowId} fallbackTitle={`${t('pipeline_configuration_ng.workflow_name')} ${index + 1}`} />}
                        key={String(field.key)}
                      >
                        <WorkflowItem
                          ref={(instance) => {
                            workflowItemRefMap.current[String(field.key)] = instance;
                          }}
                          field={field}
                          namePath={[field.name]}
                          prefixNamePath={['pipeline_configs']}
                          workflowId={workflowId}
                          workflowEnabled={workflowEnabled}
                          isMultiWorkflow={isMultiWorkflow}
                          remove={() => {
                            remove(field.name);
                          }}
                        />
                      </Tabs.TabPane>
                    );
                  })}
                </Tabs>
              </>
            ) : (
              fields.map((field, index) => {
                const workflowId = _.get(pipeline_configs, [index, 'pipeline_id']);
                const workflowEnabled = _.get(pipeline_configs, [index, 'enable']);
                return (
                  <WorkflowItem
                    key={String(field.key)}
                    ref={(instance) => {
                      workflowItemRefMap.current[String(field.key)] = instance;
                    }}
                    field={field}
                    namePath={[field.name]}
                    prefixNamePath={['pipeline_configs']}
                    workflowId={workflowId}
                    workflowEnabled={workflowEnabled}
                    remove={() => {
                      remove(field.name);
                    }}
                  />
                );
              })
            )}
          </>
        )}
      </Form.List>
      <div
        className='my-4'
        style={{
          borderBottom: '1px solid var(--fc-border-color)',
        }}
      />
      <div>
        <div className='mb-2'>
          <Space
            className='cursor-pointer'
            onClick={() => {
              setRelabelCollapsed(!relabelCollapsed);
            }}
          >
            <span>{t('relabel.title')}</span>
            {relabelCollapsed ? <RightOutlined /> : <DownOutlined />}
            {!relabelCollapsed && (
              <a
                onClick={(event) => {
                  event.stopPropagation();
                  DocumentDrawer({
                    language: i18n.language,
                    darkMode,
                    title: t('relabel.help_btn'),
                    documentPath: '/n9e-docs/alert-event-relabel',
                  });
                }}
              >
                {t('relabel.help_btn')}
              </a>
            )}
          </Space>
        </div>
        <div
          style={{
            display: relabelCollapsed ? 'none' : 'block',
          }}
        >
          <Relabel />
        </div>
      </div>
      <div
        className='my-4'
        style={{
          borderBottom: '1px solid var(--fc-border-color)',
        }}
      />
      <Annotations />
      <EnrichQueries />
    </Card>
  );
});

PipelineConfigsNG.displayName = 'PipelineConfigsNG';

export default PipelineConfigsNG;
