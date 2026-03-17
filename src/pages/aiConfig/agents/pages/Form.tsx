import React from 'react';
import { Form, Row, Col, Input, Select, Switch } from 'antd';
import { FormInstance } from 'antd/es/form';
import { useTranslation } from 'react-i18next';
import { useRequest } from 'ahooks';
import { map } from 'lodash';

import { SIZE } from '@/utils/constant';

import { getList as getLLMConfigs } from '../../llmConfigs/services';
import { getList as getSkills } from '../../skills/services';
import { getList as getMCPServers } from '../../mcpServers/services';
import { NS } from '../constants';

interface Props {
  form: FormInstance;
}

export default function FormCpt(props: Props) {
  const { t } = useTranslation(NS);
  const { form } = props;

  const { data: llmConfigs, loading: llmConfigsLoading } = useRequest(getLLMConfigs, {
    refreshDeps: [],
  });
  const { data: skills, loading: skillsLoading } = useRequest(getSkills, {
    refreshDeps: [],
  });
  const { data: mcpServers, loading: mcpServersLoading } = useRequest(getMCPServers, {
    refreshDeps: [],
  });

  return (
    <Form form={form} layout='vertical'>
      <Row gutter={SIZE}>
        <Col flex='auto'>
          <Form.Item label={t('name')} name='name' rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col flex='none'>
          <Form.Item label={t('use_case')} name='use_case' rules={[{ required: true }]} initialValue='ai-chat'>
            <Select
              options={[
                {
                  label: 'AI Chat',
                  value: 'ai-chat',
                },
              ]}
            />
          </Form.Item>
        </Col>
        <Col flex='none'>
          <Form.Item label={t('enabled')} name='enabled' valuePropName='checked' initialValue={true}>
            <Switch />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label={t('description')} name='description'>
        <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} placeholder={t('form.description_placeholder')} />
      </Form.Item>
      <Form.Item label={t('form.llm_config')} name='llm_config_id' rules={[{ required: true }]}>
        <Select
          placeholder={t('form.llm_config_placeholder')}
          loading={llmConfigsLoading}
          options={map(llmConfigs, (config) => ({ label: config.name, value: config.id }))}
          showSearch
          optionFilterProp='label'
        />
      </Form.Item>
      <Form.Item label={t('form.skill')} tooltip={t('form.skill_tip')} name='skill_ids'>
        <Select
          placeholder={t('form.skill_placeholder')}
          loading={skillsLoading}
          options={map(skills, (skill) => ({ label: skill.name, value: skill.id }))}
          showSearch
          optionFilterProp='label'
          mode='multiple'
        />
      </Form.Item>
      <Form.Item label={t('form.mcp')} tooltip={t('form.mcp_tip')} name='mcp_server_ids'>
        <Select
          placeholder={t('form.mcp_placeholder')}
          loading={mcpServersLoading}
          options={map(mcpServers, (server) => ({ label: server.name, value: server.id }))}
          showSearch
          optionFilterProp='label'
          mode='multiple'
        />
      </Form.Item>
    </Form>
  );
}
