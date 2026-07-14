import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Row, Col, Form, Input, InputNumber, Switch, Space, Tooltip, Select } from 'antd';
import { DownOutlined, RightOutlined, PlusCircleOutlined, MinusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { FormListFieldData } from 'antd/lib/form/FormList';
import classnames from 'classnames';

import CodeMirror from '@/components/CodeMirror';
import Markdown from '@/components/Markdown';
import { getList as getLLMConfigList } from '@/pages/aiConfig/llmConfigs/services';
import { LLMConfig } from '@/pages/aiConfig/llmConfigs/types';

import { NS } from '../../../constants';

interface Props {
  field: FormListFieldData;
  namePath: (string | number)[];
  prefixNamePath?: (string | number)[];
}

export default function AISummary(props: Props) {
  const { t } = useTranslation(NS);
  const { field, namePath = [], prefixNamePath = [] } = props;
  const { name, key, ...resetField } = field;
  const form = Form.useFormInstance();
  const [isAdvancedVisible, setIsAdvancedVisible] = useState(false);
  const [llmConfigs, setLLMConfigs] = useState<LLMConfig[]>([]);

  // 复用集中式 LLM 配置：选中一条后，内联的 url/api_key/model_name 不再必填。
  // useWatch 必须用「从表单根开始的绝对路径」(prefixNamePath + namePath)，
  // 否则在 Form.List 里监听不到值。参考同目录 Relabel.tsx 的写法。
  const llmConfigId = Form.useWatch([...prefixNamePath, ...namePath, 'llm_config_id']);
  const useLLMConfig = !!llmConfigId;

  useEffect(() => {
    getLLMConfigList()
      .then((list) => setLLMConfigs(list))
      .catch(() => setLLMConfigs([]));
  }, []);

  return (
    <>
      <Form.Item
        {...resetField}
        label={t('ai_summary.llm_config')}
        tooltip={{
          title: <Markdown style={{ marginTop: 16, marginRight: 12 }} content={t('ai_summary.llm_config_tip')} inTooltip />,
          overlayClassName: 'ant-tooltip-max-width-600',
        }}
        name={[...namePath, 'llm_config_id']}
      >
        <Select
          allowClear
          showSearch
          optionFilterProp='label'
          placeholder={t('ai_summary.llm_config_placeholder')}
          options={llmConfigs.map((item) => ({ label: item.name, value: item.id }))}
          onChange={(value) => {
            // 选中集中式 LLM 配置后，清空内联的 url/api_key/model_name，
            // 避免把无关的旧值一起提交（后端会忽略，但保持数据干净）。
            if (value) {
              form.setFields([
                { name: [...prefixNamePath, ...namePath, 'url'], value: undefined },
                { name: [...prefixNamePath, ...namePath, 'api_key'], value: undefined },
                { name: [...prefixNamePath, ...namePath, 'model_name'], value: undefined },
              ]);
            }
          }}
        />
      </Form.Item>
      <Row gutter={10}>
        <Col span={10}>
          <Form.Item
            {...resetField}
            label='URL'
            tooltip={{
              title: <Markdown style={{ marginTop: 16, marginRight: 12 }} content={t('ai_summary.url_tip')} inTooltip />,
              overlayClassName: 'ant-tooltip-max-width-600',
            }}
            name={[...namePath, 'url']}
            rules={[{ required: !useLLMConfig, message: t('ai_summary.url_required') }]}
            hidden={useLLMConfig}
          >
            <Input placeholder={t('ai_summary.url_placeholder')} />
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item
            {...resetField}
            label='API Key'
            tooltip={{
              title: <Markdown style={{ marginTop: 16, marginRight: 12 }} content={t('ai_summary.api_key_tip')} inTooltip />,
              overlayClassName: 'ant-tooltip-max-width-600',
            }}
            name={[...namePath, 'api_key']}
            rules={[{ required: !useLLMConfig, message: t('ai_summary.api_key_required') }]}
            hidden={useLLMConfig}
          >
            <Input.Password placeholder={t('ai_summary.api_key_placeholder')} />
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item
            {...resetField}
            label={t('ai_summary.model_name')}
            tooltip={{
              title: <Markdown style={{ marginTop: 16, marginRight: 12 }} content={t('ai_summary.model_name_tip')} inTooltip />,
              overlayClassName: 'ant-tooltip-max-width-600',
            }}
            name={[...namePath, 'model_name']}
            rules={[{ required: !useLLMConfig, message: t('ai_summary.model_name_required') }]}
            hidden={useLLMConfig}
          >
            <Input placeholder={t('ai_summary.model_name_placeholder')} />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        {...resetField}
        label={t('ai_summary.prompt_template')}
        tooltip={{
          title: <Markdown style={{ marginTop: 16 }} content={t('ai_summary.prompt_template_tip', { interpolation: { skipOnVariables: true } })} inTooltip />,
          overlayClassName: 'ant-tooltip-max-width-600 ant-tooltip-with-link',
        }}
        name={[...namePath, 'prompt_template']}
        rules={[{ required: true, message: t('ai_summary.prompt_template_required') }]}
        initialValue={t('ai_summary.prompt_template_placeholder', { interpolation: { skipOnVariables: true } })}
      >
        <CodeMirror
          height='200px'
          options={{ lineNumbers: true, mode: 'text' }}
          placeholder={t('ai_summary.prompt_template_placeholder', { interpolation: { skipOnVariables: true } })}
        />
      </Form.Item>
      <div className='mb-4'>
        <div className='flex items-center cursor-pointer mb-2' onClick={() => setIsAdvancedVisible(!isAdvancedVisible)}>
          <span className='text-sm pr-1'>{t('ai_summary.advanced_config')}</span>
          {isAdvancedVisible ? <DownOutlined /> : <RightOutlined />}
        </div>
        <div
          className={classnames({
            'p-4 border-t border-solid border-[var(--fc-border-color)] rounded-lg': true,
            hidden: !isAdvancedVisible,
          })}
        >
          <div className='space-y-4'>
            {/* Custom Params */}
            <Form.List name={[...namePath, 'custom_params']}>
              {(fields, { add, remove }) => (
                <div className='mb-4'>
                  <div className='mb-3'>
                    <Space size={4}>
                      Custom Params
                      <span style={{ color: '#888' }}>({t('ai_summary.custom_params')})</span>
                      <Tooltip
                        placement='rightTop'
                        overlayClassName='ant-tooltip-max-width-600'
                        title={
                          <div style={{ maxWidth: 600 }}>
                            <Markdown style={{ margin: '16px 12px 0 12px' }} content={t('ai_summary.custom_params_tip')} inTooltip />
                          </div>
                        }
                      >
                        <QuestionCircleOutlined style={{ color: '#888' }} />
                      </Tooltip>
                      <PlusCircleOutlined onClick={() => add({ key: '', value: '' })} />
                    </Space>
                  </div>
                  {fields.length > 0 && (
                    <Row gutter={10} className='mb-3'>
                      <Col flex='auto'>
                        <Row gutter={10}>
                          <Col span={12}>{t('ai_summary.custom_params_key_label')}</Col>
                          <Col span={12}>{t('ai_summary.custom_params_value_label')}</Col>
                        </Row>
                      </Col>
                      <Col flex='none'>
                        <div className='w-3' />
                      </Col>
                    </Row>
                  )}
                  <div>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row gutter={10} key={key} className='mb-2'>
                        <Col flex='auto'>
                          <Row gutter={10}>
                            <Col span={12}>
                              <Form.Item {...restField} name={[name, 'key']} className='mb-0'>
                                <Input placeholder='temperature' />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item {...restField} name={[name, 'value']} className='mb-0'>
                                <Input placeholder='0.7' />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Col>
                        <Col flex='none'>
                          <MinusCircleOutlined className='mt-2' onClick={() => remove(name)} />
                        </Col>
                      </Row>
                    ))}
                  </div>
                </div>
              )}
            </Form.List>
            {/* HTTP Headers */}
            <Form.List name={[...namePath, 'header']}>
              {(fields, { add, remove }) => (
                <div className='mb-4'>
                  <div className='mb-3'>
                    <Space size={4}>
                      <span className='text-sm'>HTTP Headers</span>
                      <PlusCircleOutlined onClick={() => add({ key: '', value: '' })} />
                    </Space>
                  </div>
                  {fields.length > 0 && (
                    <Row gutter={10} className='mb-3'>
                      <Col flex='auto'>
                        <Row gutter={10}>
                          <Col span={12}>Header Key</Col>
                          <Col span={12}>Header Value</Col>
                        </Row>
                      </Col>
                      <Col flex='none'>
                        <div className='w-3' />
                      </Col>
                    </Row>
                  )}
                  <div>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row gutter={10} key={key} className='mb-2'>
                        <Col flex='auto'>
                          <Row gutter={10}>
                            <Col span={12}>
                              <Form.Item {...restField} name={[name, 'key']} className='mb-0'>
                                <Input placeholder='Header Key' />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item {...restField} name={[name, 'value']} className='mb-0'>
                                <Input placeholder='Header Value' />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Col>
                        <Col flex='none'>
                          <MinusCircleOutlined className='mt-2' onClick={() => remove(name)} />
                        </Col>
                      </Row>
                    ))}
                  </div>
                </div>
              )}
            </Form.List>
            <Row gutter={10} className='mb-3'>
              <Col flex='auto'>
                <Row gutter={10}>
                  <Col span={12}>
                    <Form.Item {...resetField} label='HTTP Proxy' name={[...namePath, 'proxy']}>
                      <Input placeholder={t('ai_summary.proxy_placeholder')} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      {...resetField}
                      label='Timeout'
                      name={[...namePath, 'timeout']}
                      initialValue={30000}
                      rules={[{ required: true, message: t('ai_summary.timeout_required') }]}
                    >
                      <InputNumber min={0} style={{ width: '100%' }} addonAfter='ms' placeholder={t('ai_summary.timeout_placeholder')} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...resetField} label='TLS InsecureSkipVerify' name={[...namePath, 'insecure_skip_verify']} valuePropName='checked'>
                      <Switch size='small' />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col flex='none'>
                <div className='w-3' />
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </>
  );
}
