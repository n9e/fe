import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Select, InputNumber } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';

import CodeMirror from '@/components/CodeMirror';

import { NS } from '../../../constants';
import { getLLMConfigBriefs, LLMConfigBrief } from '../../../services';

interface Props {
  field: FormListFieldData;
  namePath: (string | number)[];
}

// AI Runner 仅暴露三个字段：模型（联动 LLM Config 下拉）、任务描述、超时秒数。
// 与 ai_summary 形成对照：ai_summary 让用户填裸 API key/url；AI Runner 只引用
// 已配置好的 LLM Config ID，避免在处理器层重复维护 LLM 凭据。
export default function AIRunner(props: Props) {
  const { t } = useTranslation(NS);
  const { field, namePath = [] } = props;
  const { name, key, ...resetField } = field;

  const [llmConfigs, setLlmConfigs] = useState<LLMConfigBrief[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getLLMConfigBriefs()
      .then((lst) => setLlmConfigs(lst))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Form.Item
        {...resetField}
        label={t('ai_runner.llm_config_id')}
        name={[...namePath, 'llm_config_id']}
        rules={[{ required: true, message: t('ai_runner.llm_config_id_required') }]}
      >
        <Select
          loading={loading}
          showSearch
          optionFilterProp='label'
          placeholder={t('ai_runner.llm_config_id_placeholder')}
          options={llmConfigs.map((c) => ({
            value: c.id,
            label: c.model ? `${c.name} (${c.model})` : c.name,
          }))}
        />
      </Form.Item>

      <Form.Item
        {...resetField}
        label={t('ai_runner.description')}
        name={[...namePath, 'description']}
        tooltip={t('ai_runner.description_tip', { interpolation: { skipOnVariables: true } })}
        rules={[{ required: true, message: t('ai_runner.description_required') }]}
      >
        <CodeMirror
          height='200px'
          options={{ lineNumbers: true, mode: 'text' }}
          placeholder={t('ai_runner.description_placeholder', { interpolation: { skipOnVariables: true } })}
        />
      </Form.Item>

      <Form.Item
        {...resetField}
        label={t('ai_runner.timeout_seconds')}
        name={[...namePath, 'timeout_seconds']}
        tooltip={t('ai_runner.timeout_seconds_tip')}
        initialValue={180}
        rules={[{ required: true, message: t('ai_runner.timeout_seconds_required') }]}
      >
        <InputNumber min={1} max={3600} style={{ width: 240 }} addonAfter='s' />
      </Form.Item>
    </>
  );
}
