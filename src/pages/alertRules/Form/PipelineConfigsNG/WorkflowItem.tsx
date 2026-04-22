import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useRequest } from 'ahooks';
import { Space, Spin, Switch, Dropdown, Menu, Button, Form, Row, Col, Tag, Tooltip, Modal, Input, Popover, message, Alert } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { SIZE } from '@/utils/constant';
import { getItem as getWorkflowItem, getList as getWorkflowList, postItem as postWorkflow, putItem as putWorkflow } from '@/pages/eventPipeline/services';
import { DEFAULT_VALUES, NS as EVENTPIPELINE_NS } from '@/pages/eventPipeline/constants';

import Processor from './Processor';

export function WorkflowTabTitle(props: { workflowId?: number; fallbackTitle?: string }) {
  const { workflowId, fallbackTitle } = props;
  const shouldFetchWorkflow = _.isNumber(workflowId);
  const { data: item, loading } = useRequest(() => getWorkflowItem(workflowId as number), {
    cacheKey: `workflow-item-${workflowId}`,
    refreshDeps: [workflowId],
    ready: shouldFetchWorkflow,
  });

  if (!shouldFetchWorkflow) return <span>{fallbackTitle ?? '--'}</span>;
  if (loading) return <Spin size='small' />;

  return <span>{item?.name ?? workflowId}</span>;
}

interface Props {
  field: FormListFieldData;
  namePath: (string | number)[];
  prefixNamePath?: (string | number)[];
  workflowId?: number;
  workflowEnabled: boolean;
  isMultiWorkflow?: boolean;
  remove: () => void;
}

export interface WorkflowItemRef {
  isUnsaved: () => boolean;
  focusSaveButtonWithPopover: () => void;
  closeUnsavedPopover: () => void;
}

const WorkflowItem = React.forwardRef<WorkflowItemRef, Props>((props, ref) => {
  const { t } = useTranslation('alertRules');
  const { field, namePath = [], prefixNamePath = [], workflowId, workflowEnabled, isMultiWorkflow, remove } = props;
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [saveWorkflowName, setSaveWorkflowName] = useState('');
  const [savingWorkflow, setSavingWorkflow] = useState(false);
  const [unsavedPopoverVisible, setUnsavedPopoverVisible] = useState(false);
  const [savedProcessorsSnapshot, setSavedProcessorsSnapshot] = useState<any[]>();

  const resetField = _.omit(field, ['name', 'key']);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  const form = Form.useFormInstance();
  const group_id = Form.useWatch('group_id');
  const processors = Form.useWatch([...prefixNamePath, ...namePath, 'processors']);

  const { data: workflowList } = useRequest(() => getWorkflowList({ group_id, use_case: 'alert_rule' }), {
    cacheKey: 'workflow-list',
    refreshDeps: [group_id],
  });

  const { data: item, loading } = useRequest(
    () => {
      if (!workflowId) return Promise.reject(undefined);
      return getWorkflowItem(workflowId);
    },
    {
      cacheKey: `workflow-item-${workflowId}`,
      refreshDeps: [workflowId],
      ready: !!workflowId,
      onSuccess: (data) => {
        // 将 data.processors 设置到 form 中, path 是 [...prefixNamePath, ...namePath, 'processors']
        // 使用 setFieldsValue 而非 setFields，避免 Form.List 内部 key 未正确初始化导致重复 key
        const currentValues = _.cloneDeep(form.getFieldsValue());
        _.set(currentValues, [...prefixNamePath, ...namePath, 'processors'], data.processors);
        form.setFieldsValue(currentValues);
      },
    },
  );

  useEffect(() => {
    if (workflowId !== undefined && item?.processors) {
      setSavedProcessorsSnapshot(_.cloneDeep(item.processors));
    }
  }, [workflowId, item?.processors]);

  const processorsChanged = workflowId !== undefined && savedProcessorsSnapshot !== undefined && !_.isEqual(savedProcessorsSnapshot, processors);
  const canSaveWorkflow = workflowId ? processorsChanged : _.get(processors, 'length', 0) > 0;
  const saveWorkflowTooltip = workflowId && !processorsChanged ? t('pipeline_configuration_ng.no_changes') : t('pipeline_configuration_ng.save_workflow_tip');

  useImperativeHandle(
    ref,
    () => ({
      isUnsaved: () => canSaveWorkflow,
      focusSaveButtonWithPopover: () => {
        setUnsavedPopoverVisible(true);
        saveButtonRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        saveButtonRef.current?.focus();
      },
      closeUnsavedPopover: () => {
        setUnsavedPopoverVisible(false);
      },
    }),
    [canSaveWorkflow],
  );

  useEffect(() => {
    if (!canSaveWorkflow && unsavedPopoverVisible) {
      setUnsavedPopoverVisible(false);
    }
  }, [canSaveWorkflow, unsavedPopoverVisible]);

  const getDefaultWorkflowName = () => {
    const processorTypes = _.chain(processors)
      .map((processor) => processor?.typ ?? processor?.type)
      .filter((processorType) => _.isString(processorType) && processorType.length > 0)
      .value();
    const namePrefix = _.get(processorTypes, 'length', 0) > 0 ? processorTypes.join('_') : 'relabel';
    return `${namePrefix}_${Date.now()}`;
  };

  const openSaveWorkflowModal = () => {
    setUnsavedPopoverVisible(false);
    if (workflowId && item?.name) {
      setSaveWorkflowName(item.name);
    } else {
      setSaveWorkflowName(getDefaultWorkflowName());
    }
    setSaveModalVisible(true);
  };

  const handleSaveWorkflow = async () => {
    const name = saveWorkflowName.trim();
    if (!name) {
      message.error(t('pipeline_configuration_ng.workflow_name_required'));
      return;
    }

    setSavingWorkflow(true);
    try {
      if (workflowId) {
        await putWorkflow({
          id: workflowId,
          group_id,
          use_case: 'alert_rule',
          name,
          processors,
        });
        setSavedProcessorsSnapshot(_.cloneDeep(processors));
        message.success(t('common:success.edit'));
      } else {
        const createdWorkflow = await postWorkflow({
          group_id,
          use_case: 'alert_rule',
          name,
          processors,
        });

        const createdWorkflowId = _.get(createdWorkflow, 'id', createdWorkflow);
        if (_.isNumber(createdWorkflowId)) {
          const currentValues = _.cloneDeep(form.getFieldsValue());
          _.set(currentValues, [...prefixNamePath, ...namePath, 'pipeline_id'], createdWorkflowId);
          _.set(currentValues, [...prefixNamePath, ...namePath, 'enable'], _.get(currentValues, [...prefixNamePath, ...namePath, 'enable'], true));
          form.setFieldsValue(currentValues);
          setSavedProcessorsSnapshot(_.cloneDeep(processors));
        }
        message.success(t('common:success.add'));
      }
      setSaveModalVisible(false);
    } catch (error) {
      message.error(_.get(error, 'message') || _.get(error, 'error') || t('pipeline_configuration_ng.save_workflow_failed'));
    } finally {
      setSavingWorkflow(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Spin spinning />
      </div>
    );
  }

  return (
    <>
      <div>
        <Space>
          {isMultiWorkflow && <Button size='small' icon={<DeleteOutlined />} onClick={remove} />}
          <span>
            {t('pipeline_configuration_ng.enabled')}{' '}
            <Switch
              size='small'
              checked={workflowEnabled}
              onChange={(checked) => {
                // 更新 pipeline_configs 中对应项的 enable 字段
                const currentValues = _.cloneDeep(form.getFieldsValue());
                _.set(currentValues, [...prefixNamePath, ...namePath, 'enable'], checked);
                form.setFieldsValue(currentValues);
              }}
            />
          </span>
          <Dropdown
            overlay={
              <Menu className='max-h-64 overflow-y-auto overflow-x-hidden'>
                <Menu.Item
                  key='add'
                  onClick={() => {
                    // 删除 pipeline_configs 中对应项的 workflow_id，并重置 processors
                    const currentValues = _.cloneDeep(form.getFieldsValue());
                    _.unset(currentValues, [...prefixNamePath, ...namePath, 'pipeline_id']);
                    _.set(currentValues, [...prefixNamePath, ...namePath, 'processors'], [DEFAULT_VALUES.processors[0]]);
                    form.setFieldsValue(currentValues);
                  }}
                >
                  {t('pipeline_configuration_ng.add_workflow')}
                </Menu.Item>
                {_.map(workflowList, (workflow) => {
                  return (
                    <Menu.Item
                      key={workflow.id}
                      disabled={workflow.id === workflowId}
                      onClick={() => {
                        // 更新 pipeline_configs 中对应项的 workflow_id，并重置 processors
                        const currentValues = _.cloneDeep(form.getFieldsValue());
                        _.set(currentValues, [...prefixNamePath, ...namePath, 'pipeline_id'], workflow.id);
                        _.set(currentValues, [...prefixNamePath, ...namePath, 'processors'], []);
                        form.setFieldsValue(currentValues);
                      }}
                    >
                      {workflow.name}
                    </Menu.Item>
                  );
                })}
              </Menu>
            }
          >
            <Button size='small'>{t('pipeline_configuration_ng.select_workflow')}</Button>
          </Dropdown>
          {workflowId && item?.name && <Tag color='orange'>{t('pipeline_configuration_ng.reference_workflow_tip', { workflowName: item.name })}</Tag>}
        </Space>
      </div>
      <Form.List {...resetField} name={[...namePath, 'processors']}>
        {(fields, { add, remove, move }) => (
          <Space direction='vertical' size={SIZE * 2} className='w-full'>
            {fields.map((field) => {
              return (
                <Processor
                  key={field.key}
                  fields={fields}
                  field={field}
                  namePath={[field.name]}
                  prefixNamePath={[...prefixNamePath, ...namePath, 'processors']}
                  add={add}
                  remove={remove}
                  move={move}
                />
              );
            })}
            <Row gutter={SIZE} className={`${fields.length === 0 ? 'mt-4' : ''}`}>
              <Col flex='none'>
                <Tooltip title={saveWorkflowTooltip}>
                  <Popover
                    content={<Alert showIcon type='warning' message={t('pipeline_configuration_ng.workflow_unsaved')} />}
                    placement='top'
                    visible={unsavedPopoverVisible}
                    trigger='click'
                    onVisibleChange={(visible) => {
                      if (!visible) {
                        setUnsavedPopoverVisible(false);
                      }
                    }}
                  >
                    <Button ref={saveButtonRef} type='primary' disabled={!canSaveWorkflow} onClick={openSaveWorkflowModal}>
                      {t('pipeline_configuration_ng.save_workflow')}
                    </Button>
                  </Popover>
                </Tooltip>
              </Col>
              <Col flex='auto'>
                <Button className='w-full' type='dashed' onClick={() => add(DEFAULT_VALUES.processors[0])} icon={<PlusOutlined />}>
                  {t(`${EVENTPIPELINE_NS}:processor.add_btn`)}
                </Button>
              </Col>
            </Row>
          </Space>
        )}
      </Form.List>
      <Modal
        title={t(workflowId ? 'pipeline_configuration_ng.save_workflow_modal_title_edit' : 'pipeline_configuration_ng.save_workflow_modal_title_new')}
        visible={saveModalVisible}
        confirmLoading={savingWorkflow}
        onOk={handleSaveWorkflow}
        onCancel={() => setSaveModalVisible(false)}
      >
        <Form layout='vertical'>
          <Form.Item label={t('pipeline_configuration_ng.workflow_name')} required>
            <Input
              value={saveWorkflowName}
              onChange={(e) => {
                setSaveWorkflowName(e.target.value);
              }}
              placeholder={t('pipeline_configuration_ng.workflow_name_placeholder')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
});

WorkflowItem.displayName = 'WorkflowItem';

export default WorkflowItem;
