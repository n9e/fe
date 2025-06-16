const zh_CN = {
  title: '事件管道',
  teams: '授权团队',
  teams_tip: '限定哪些团队成员可以查看和修改此配置，可以关联多个团队<br />例如：将配置授权给 infra-team，则只有 infra-team 团队下的成员可以访问或调整本配置。',
  basic_configuration: '基本配置',
  filter_enable: '过滤条件',
  label_filters: '适用标签',
  label_filters_tip:
    '设置事件处理的标签过滤条件，仅当事件包含与此处配置匹配的标签时，才会被处理。<br />示例：填写 service=mon，表示仅当事件包含标签 service=mon 时，才会进入该处理流程。',
  attribute_filters: '适用属性',
  attribute_filters_tip:
    '设置事件处理的属性过滤条件，仅当事件包含与此处配置匹配的属性时，才会被处理。<br />示例：填写 业务组==DefaultBusiGroup，表示仅当事件的"业务组"属性为 DefaultBusiGroup 时，才会进入该处理流程。',
  attribute_filters_value: '属性值',
  attribute_filters_options: {
    group_name: '业务组',
    cluster: '数据源',
  },
  processor: {
    title: '处理器',
    add_btn: '添加处理器',
    typ: '类型',
    help_btn: '使用说明',
  },
  label_enrich: {
    label_source_type: {
      label: '标签来源',
      options: {
        built_in_mapping: '内置标签词表',
      },
    },
    label_mapping_id: '词表名称',
    help: '使用源标签中指定的标签查询词表，将词表中查询到的字段根据 "新增标签" 配置追加到告警事件中',
    source_keys: {
      label: '源标签',
      text: '词表中的字段 <strong>{{field}}</strong> 对应事件中的标签',
      target_key_placeholder: '标签 Key',
      target_key_required: '标签 Key 不能为空',
    },
    append_keys: {
      label: '新增标签',
      source_key_placeholder: '词表中的字段',
      rename_key: '重命名标签 Key',
      target_key_placeholder: '标签 Key',
    },
  },
  test_modal: {
    title: {
      settings: '选择告警事件',
      result: '事件预览',
    },
  },
  callback: {
    url: 'URL',
    advanced_settings: '高级设置',
    basic_auth_user: '授权用户名',
    basic_auth_user_placeholder: '请输入授权用户名',
    basic_auth_pass: '授权密码',
    basic_auth_pass_placeholder: '请输入授权密码',
  },
  event_drop: {
    content: '判断逻辑',
    content_placeholder: '使用 go template 语法，如果最后显示为 true，将会将 event 在此环节丢弃',
  },
  script: {
    timeout: '超时时间（单位毫秒）',
    timeout_tooltip: '脚本执行的最大超时时间，超过此时间脚本将被终止',
    timeout_placeholder: '请输入超时时间',
    content: '脚本内容',
    content_tooltip: '编写用于处理事件的脚本代码，告警事件会以 stdin 方式传入脚本，脚本需要将 event 作为 json 对象输出到 stdout',
    content_placeholder: '请输入脚本内容',
  },
  ai_summary: {
    url_placeholder: '请输入 API 服务地址',
    url_required: '请输入 URL',
    api_key_placeholder: 'API 密钥',
    api_key_required: '请输入 API Key',
    model_name: '模型名称',
    model_name_placeholder: '如 deepseek-chat',
    model_name_required: '请输入模型名称',
    prompt_template: '提示词模板',
    prompt_template_required: '请输入提示词模板',
    advanced_config: '高级配置',
    custom_params: 'AI模型参数配置',
    custom_params_key_label: '参数名 (如: temperature)',
    custom_params_value_label: '参数值 (如: 0.7)',
    proxy_placeholder: '如: http://proxy.example.com:8080',
    timeout_placeholder: '超时时间（秒）',
    timeout_required: '请输入超时时间',
    url_tip: `#### URL
- **说明**: AI服务的API接口地址
- **示例**: \`https://api.deepseek.com/v1/chat/completions\``,
    api_key_tip: `#### API Key
- **说明**: AI服务提供商的API密钥
- **获取方式**:
  - OpenAI: 在OpenAI官网申请
  - DeepSeek: 在DeepSeek官网注册获取`,
    model_name_tip: `#### Model Name
- **说明**: 指定使用的AI模型名称
- **常用模型**:
  - \`gpt-3.5-turbo\` (OpenAI)
  - \`gpt-4\` (OpenAI)
  - \`deepseek-chat\` (DeepSeek)`,
    prompt_template_tip: `### 提示词模板
提示词模板是AI分析的核心，可以使用 {{$event}} 引用事件的各个字段，事件的详细结构参考[告警历史表](https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v6/schema/alert_his_event/)说明，刚开始使用提供的默认模板即可`,
    prompt_template_placeholder: `请分析以下告警事件信息，并提供一个简洁明了的中文总结：
告警规则: {{$event.RuleName}}
严重程度: {{$event.Severity}}
告警状态: {{if $event.IsRecovered}}Recovered{{else}}{{$event.Severity}} Triggered{{end}}       
触发时间: {{$event.TriggerTime}}
主机名: {{$event.Host}}
触发值: {{$event.Value}}
规则说明: {{$event.RuleNote}}
标签信息: {{$event.Tags}}
注释信息: {{$event.Annotations}}

请提供一个100字以内的中文总结，重点说明：
1. 什么系统/服务出现了什么问题
2. 问题的严重程度
3. 可能的影响
4. 简单的处理建议
总结内容要简洁明了，方便运维人员快速了解告警情况。`,
    custom_params_tip: `### Custom Params - AI模型参数配置

用于精细化调整AI模型的行为：

| 参数名 | 说明 | 推荐值 | 示例 |
|--------|------|--------|------|
| temperature | 控制回答的随机性 | 0.3-0.7 | 0.7 |
| max_tokens | 最大输出token数 | 200-500 | 300 |
| top_p | 采样概率阈值 | 0.8-1.0 | 0.9 |

**配置方法**:
1. 点击 "Custom Params" 旁的 ➕ 按钮
2. 在"参数名"栏输入参数名（如：temperature）
3. 在"参数值"栏输入对应值（如：0.7）`,
  },
};
export default zh_CN;
