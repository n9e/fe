import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Collapse, Form, Input, Radio, Row, Select, Space, Spin, Switch, Tooltip } from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { ChannelItem } from '@/pages/notificationChannels/types';

import { getJiraIssueTypeCheck, getJiraIssueTypes, getJiraPriorities, getJiraProjects, JiraIssueType, JiraIssueTypeCheck, JiraPriority, JiraProject } from '../../../services';
import { NS } from '../../../constants';

interface Props {
  prefixNamePath?: (string | number)[];
  field: FormListFieldData;
  channelItem?: ChannelItem;
}

/**
 * Jira 规则侧参数：项目、工作类型、恢复时的处理，其余折叠在高级区。
 * 参数都存为字符串（后端 GetNotifyConfigParams 会把非字符串值 fmt.Sprint 成 map[...]），
 * 优先级映射 / 标签 / 自定义字段以 JSON 字符串保存，这里的几个小组件负责与表单形态互转。
 */
export default function Jira(props: Props) {
  const { t } = useTranslation(NS);
  const { field, channelItem, prefixNamePath = [] } = props;
  const form = Form.useFormInstance();
  const base = [...prefixNamePath, field.name, 'params'];
  const project: string | undefined = Form.useWatch([...base, 'project_key']);
  const issueType: string | undefined = Form.useWatch([...base, 'issue_type']);
  const fieldsJSON: string | undefined = Form.useWatch([...base, 'fields']);
  const channelId = channelItem?.id;

  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string>();
  const [issueTypes, setIssueTypes] = useState<JiraIssueType[]>([]);
  const [issueTypesLoading, setIssueTypesLoading] = useState(false);
  const [issueTypesError, setIssueTypesError] = useState<string>();
  const [priorities, setPriorities] = useState<JiraPriority[]>([]);
  const [check, setCheck] = useState<JiraIssueTypeCheck>();

  // 真实站点要先解析 Cloud ID 再走网关，列表要等一两秒：加载中不能显示成「没有权限」；
  // 切换媒介 / 项目时丢弃上一轮还没回来的结果
  useEffect(() => {
    if (!channelId) return;
    let alive = true;
    setProjectsError(undefined);
    setProjectsLoading(true);
    getJiraProjects(channelId)
      .then((list) => alive && setProjects(list))
      .catch((err) => {
        if (!alive) return;
        setProjects([]);
        setProjectsError(err?.message);
      })
      .finally(() => alive && setProjectsLoading(false));
    getJiraPriorities(channelId)
      .then((list) => alive && setPriorities(list))
      .catch(() => alive && setPriorities([]));
    return () => {
      alive = false;
    };
  }, [channelId]);

  useEffect(() => {
    if (!channelId || !project) {
      setIssueTypes([]);
      return;
    }
    let alive = true;
    setIssueTypesError(undefined);
    setIssueTypesLoading(true);
    getJiraIssueTypes(channelId, project)
      .then((list) => {
        if (!alive) return;
        setIssueTypes(list);
        // 按旧接入文档配置过的项目里有 Alert 工作类型，默认选中它
        if (!form.getFieldValue([...base, 'issue_type'])) {
          const alertType = _.find(list, (it) => it.name === 'Alert');
          if (alertType) {
            form.setFields([{ name: [...base, 'issue_type'], value: alertType.name }]);
          }
        }
      })
      .catch((err) => {
        if (!alive) return;
        setIssueTypes([]);
        setIssueTypesError(err?.message);
      })
      .finally(() => alive && setIssueTypesLoading(false));
    return () => {
      alive = false;
    };
  }, [channelId, project]);

  useEffect(() => {
    if (!channelId || !project || !issueType) {
      setCheck(undefined);
      return;
    }
    let alive = true;
    getJiraIssueTypeCheck(channelId, project, issueType)
      .then((res) => alive && setCheck(res))
      .catch(() => alive && setCheck(undefined));
    return () => {
      alive = false;
    };
  }, [channelId, project, issueType]);

  // 该工作类型的必填字段里，还没在「自定义字段」里填的
  const uncoveredFields = useMemo(() => {
    const filled = _.keys(parseJSON<Record<string, string>>(fieldsJSON, {}));
    return _.filter(check?.required_fields, (f) => !_.includes(filled, f.fieldId));
  }, [check, fieldsJSON]);

  const label = (key: string) => (
    <Space size={4}>
      {t(`notification_configuration.jira.${key}`)}
      <Tooltip className='n9e-ant-from-item-tooltip' overlayClassName='ant-tooltip-max-width-600' title={t(`notification_configuration.jira.${key}_tip`)}>
        <QuestionCircleOutlined />
      </Tooltip>
    </Space>
  );

  return (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            {...field}
            label={label('project')}
            messageVariables={{ label: t('notification_configuration.jira.project') }}
            name={[field.name, 'params', 'project_key']}
            rules={[{ required: true }]}
            help={projectsError}
            validateStatus={projectsError ? 'warning' : undefined}
          >
            {/* 列表拉不到时（权限、网络、媒介还没保存）退回文本框，允许直接输入项目 key */}
            {projectsError || !channelId ? (
              <Input placeholder='OPS' />
            ) : (
              <Select
                showSearch
                optionFilterProp='label'
                loading={projectsLoading}
                options={_.map(projects, (p) => ({ label: `${p.name} (${p.key})`, value: p.key }))}
                notFoundContent={projectsLoading ? <Spin size='small' /> : t('notification_configuration.jira.project_empty')}
                onChange={() => {
                  form.setFields([{ name: [...base, 'issue_type'], value: undefined }]);
                }}
              />
            )}
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            {...field}
            label={label('issue_type')}
            messageVariables={{ label: t('notification_configuration.jira.issue_type') }}
            name={[field.name, 'params', 'issue_type']}
            rules={[{ required: true }]}
            help={issueTypesError}
            validateStatus={issueTypesError ? 'warning' : undefined}
          >
            {issueTypesError || projectsError || !channelId ? (
              <Input placeholder='Bug' />
            ) : (
              <Select
                showSearch
                optionFilterProp='label'
                loading={issueTypesLoading}
                notFoundContent={issueTypesLoading ? <Spin size='small' /> : undefined}
                options={_.map(issueTypes, (it) => ({ label: it.name, value: it.name }))}
              />
            )}
          </Form.Item>
        </Col>
      </Row>
      {check && (!_.isEmpty(check.missing_permissions) || !_.isEmpty(uncoveredFields)) && (
        <Alert
          className='mb-4'
          type='warning'
          showIcon
          message={
            <div>
              {!_.isEmpty(check.missing_permissions) && <div>{t('notification_configuration.jira.missing_permissions', { list: _.join(check.missing_permissions, ', ') })}</div>}
              {!_.isEmpty(uncoveredFields) && (
                <div>
                  {t('notification_configuration.jira.required_fields', {
                    list: _.join(
                      _.map(uncoveredFields, (f) => `${f.name} (${f.fieldId})`),
                      ', ',
                    ),
                  })}
                </div>
              )}
            </div>
          }
        />
      )}
      <Form.Item {...field} label={label('on_resolve')} name={[field.name, 'params', 'on_resolve']} getValueProps={(v) => ({ value: v || 'close' })}>
        <Radio.Group>
          <Radio value='close'>{t('notification_configuration.jira.on_resolve_close')}</Radio>
          <Radio value='comment'>{t('notification_configuration.jira.on_resolve_comment')}</Radio>
          <Radio value='none'>{t('notification_configuration.jira.on_resolve_none')}</Radio>
        </Radio.Group>
      </Form.Item>

      <Collapse ghost className='n9e-collapse-advanced-settings mb-2'>
        <Collapse.Panel key='advanced' header={t('notification_configuration.jira.advanced')} forceRender>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item {...field} label={label('resolve_transition')} name={[field.name, 'params', 'resolve_transition']}>
                <Input placeholder={t('notification_configuration.jira.resolve_transition_placeholder')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item {...field} label={label('on_repeat')} name={[field.name, 'params', 'on_repeat']} getValueProps={(v) => ({ value: v || 'none' })}>
                <Radio.Group>
                  <Radio value='none'>{t('notification_configuration.jira.on_repeat_none')}</Radio>
                  <Radio value='comment'>{t('notification_configuration.jira.on_repeat_comment')}</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item {...field} label={label('priority_map')} name={[field.name, 'params', 'priority_map']}>
            <PriorityMapInput priorities={priorities} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item {...field} label={label('labels')} name={[field.name, 'params', 'labels']}>
                <JSONTagsInput placeholder={t('notification_configuration.jira.labels_placeholder')} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                {...field}
                label={label('tags_as_labels')}
                name={[field.name, 'params', 'tags_as_labels']}
                valuePropName='checked'
                getValueProps={(v) => ({ checked: v === 'true' })}
                normalize={(v) => (v ? 'true' : 'false')}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item {...field} label={label('fields')} name={[field.name, 'params', 'fields']}>
            <JSONFieldsInput />
          </Form.Item>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
}

function parseJSON<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch (e) {
    return fallback;
  }
}

/** 空值存 undefined 而不是 "{}" / "[]"，避免规则里留一堆空参数 */
function toJSONOrUndefined(value: any): string | undefined {
  if (_.isEmpty(value)) return undefined;
  return JSON.stringify(value);
}

const SEVERITIES = [1, 2, 3];
const COMMON_PRIORITIES: Record<number, string> = { 1: 'Highest', 2: 'High', 3: 'Medium' };

function PriorityMapInput(props: { value?: string; onChange?: (v?: string) => void; priorities: JiraPriority[] }) {
  const { t } = useTranslation(NS);
  const { value, onChange, priorities } = props;
  const map = parseJSON<Record<string, string>>(value, {});
  const options = _.map(priorities, (p) => ({ label: p.name, value: p.name }));
  const update = (next: Record<string, string>) => onChange?.(toJSONOrUndefined(_.omitBy(next, (v) => !v)));

  return (
    <Space wrap align='start'>
      {_.map(SEVERITIES, (sev) => (
        <Space key={sev} size={4}>
          <span>S{sev}</span>
          <Select
            allowClear
            style={{ width: 140 }}
            options={options}
            value={map[String(sev)]}
            onChange={(v) => update({ ...map, [String(sev)]: v })}
            placeholder={t('notification_configuration.jira.priority_unset')}
          />
        </Space>
      ))}
      <Button
        onClick={() => {
          const names = _.map(priorities, 'name');
          const next: Record<string, string> = {};
          _.forEach(COMMON_PRIORITIES, (name, sev) => {
            if (_.includes(names, name)) next[sev] = name;
          });
          update(next);
        }}
      >
        {t('notification_configuration.jira.priority_fill_common')}
      </Button>
    </Space>
  );
}

function JSONTagsInput(props: { value?: string; onChange?: (v?: string) => void; placeholder?: string }) {
  const tags = parseJSON<string[]>(props.value, []);
  return (
    <Select
      mode='tags'
      open={false}
      tokenSeparators={[',', ' ']}
      className='w-full'
      placeholder={props.placeholder}
      value={tags}
      onChange={(v: string[]) => props.onChange?.(toJSONOrUndefined(v))}
    />
  );
}

function JSONFieldsInput(props: { value?: string; onChange?: (v?: string) => void }) {
  const { t } = useTranslation(NS);
  // 行内编辑中间态（key 可能暂时为空）放本地 state，只把完整的键值写回表单
  const [rows, setRows] = useState<{ key: string; value: string }[]>(() => _.map(parseJSON<Record<string, string>>(props.value, {}), (value, key) => ({ key, value })));

  const commit = (next: { key: string; value: string }[]) => {
    setRows(next);
    const obj = _.fromPairs(
      _.map(
        _.filter(next, (r) => _.trim(r.key)),
        (r) => [_.trim(r.key), r.value],
      ),
    );
    props.onChange?.(toJSONOrUndefined(obj));
  };

  return (
    <div>
      {_.map(rows, (row, idx) => (
        <Row key={idx} gutter={8} className='mb-2'>
          <Col span={9}>
            <Input value={row.key} placeholder='customfield_10010' onChange={(e) => commit(_.map(rows, (r, i) => (i === idx ? { ...r, key: e.target.value } : r)))} />
          </Col>
          <Col flex='auto'>
            <Input
              value={row.value}
              placeholder={t('notification_configuration.jira.field_value_placeholder')}
              onChange={(e) => commit(_.map(rows, (r, i) => (i === idx ? { ...r, value: e.target.value } : r)))}
            />
          </Col>
          <Col flex='none'>
            <MinusCircleOutlined className='mt-2' onClick={() => commit(_.filter(rows, (_r, i) => i !== idx))} />
          </Col>
        </Row>
      ))}
      <Button type='dashed' icon={<PlusCircleOutlined />} onClick={() => setRows([...rows, { key: '', value: '' }])}>
        {t('notification_configuration.jira.field_add')}
      </Button>
    </div>
  );
}
