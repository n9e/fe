const zh_CN = {
  title: '工作流',
  title_add: '新增事件工作流',
  title_edit: '编辑事件工作流',
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
    is_recovered: '是恢复事件？',
  },
  use_case: {
    label: '用途',
    firemap: '灭火图',
    event_pipeline: '事件处理',
  },
  trigger_mode: {
    label: '触发模式',
    event: '事件触发',
    api: 'API 触发',
  },
  disabled: {
    form_label: '禁用状态',
    label: '状态',
    false: '已启用',
    true: '已禁用',
  },
  inputs: {
    label: '前置输入',
    help: '前置输入变量可在工作流处理器中通过 {{$inputs.变量名}} 引用',
    add_btn: '添加变量',
    key: '变量名',
    key_required: '变量名不能为空',
    value: '变量默认值',
    description: '变量描述',
  },
  executions: {
    title: '执行记录',
    search_placeholder: '请输入搜索关键字',
    status: {
      label: '状态',
      running: '执行中',
      success: '成功',
      failed: '失败',
    },
    id: '执行 ID',
    pipeline_name: '工作流名称',
    mode: '触发模式',
    created_at: '开始时间',
    finished_at: '结束时间',
    duration_ms: '执行耗时',
    trigger_by: '触发者',
    detail_title: '执行详情',
    detail_basic_info: '基本信息',
    error_message: '错误信息',
    node_results_parsed_title: '节点执行结果',
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
    url_tip: `- **说明**: AI服务的API接口地址
- **示例**: \`https://api.deepseek.com/v1/chat/completions\``,
    api_key_tip: `- **说明**: AI服务提供商的API密钥
- **获取方式**:
  - OpenAI: 在OpenAI官网申请
  - DeepSeek: 在DeepSeek官网注册获取`,
    model_name_tip: `- **说明**: 指定使用的AI模型名称
- **常用模型**:
  - \`gpt-3.5-turbo\` (OpenAI)
  - \`gpt-4\` (OpenAI)
  - \`deepseek-chat\` (DeepSeek)`,
    prompt_template_tip: `提示词模板是AI分析的核心，可以使用 {{$event}} 引用事件的各个字段，事件的详细结构参考[告警历史表](https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/schema/alert_his_event/)说明，刚开始使用提供的默认模板即可`,
    prompt_template_placeholder: `请分析以下告警事件信息，并提供一个简洁明了的中文总结：
告警规则: {{$event.RuleName}}
严重程度: {{$event.Severity}}
告警状态: {{if $event.IsRecovered}}Recovered{{else}}{{$event.Severity}} Triggered{{end}}       
触发时间: {{$event.TriggerTime}}
触发值: {{$event.TriggerValue}}
规则说明: {{$event.RuleNote}}
标签信息: {{$event.Tags}}
注释信息: {{$event.Annotations}}

请提供一个100字以内的中文总结，重点说明：
1. 什么系统/服务出现了什么问题
2. 问题的严重程度
3. 可能的影响
4. 简单的处理建议
总结内容要简洁明了，方便运维人员快速了解告警情况。`,
    custom_params_tip: `用于精细化调整AI模型的行为：

| 参数名 | 说明 | 推荐值 | 示例 |
|--------|------|--------|------|
| temperature | 控制回答的随机性 | 0.3-0.7 | 0.7 |
| max_tokens | 最大输出token数 | 200-500 | 300 |
| top_p | 采样概率阈值 | 0.8-1.0 | 0.9 |

**配置方法**:
1. 点击 "Custom Params" 旁的 + 按钮
2. 在"参数名"栏输入参数名（如：temperature）
3. 在"参数值"栏输入对应值（如：0.7）`,
  },
  script: {
    timeout: '超时时间（单位毫秒）',
    timeout_tooltip: '脚本执行的最大超时时间，超过此时间脚本将被终止',
    timeout_placeholder: '请输入超时时间',
    content: '脚本内容',
    content_tooltip: '编写用于处理事件的脚本代码，告警事件会以 stdin 方式传入脚本，脚本需要将 event 作为 json 对象输出到 stdout',
    content_placeholder: '请输入脚本内容',
  },
  inhibit: {
    help: '事件抑制处理器，当一个告警发送时，避免通知另一个告警事件，减少通知。常见场景如：同一条告警规则存在 P1 级别的活跃故障时，忽略 P2 和 P3 级别的告警通知。更多介绍参考 <a>使用文档</a>',
    tip1: '当 <b>新的告警</b> 满足以下条件',
    tip2: '且',
    tip3: '秒内有满足以下条件的 <b>活跃告警</b>',
    tip4: '且 <b>新的告警</b> 与 <b>活跃告警</b> 存在以下相同项',
    tip5: '满足以上全部条件时，当前告警将被抑制，且不再进行通知',
    duration_required: '抑制时长不能为空',
    duration_max: '抑制时长不能超过 600 秒',
    match_label_keys: '标签',
    match_label_keys_required: '标签不能为空',
    match_attribute_keys: '属性',
    match_attribute_keys_required: '属性不能为空',
    keys_at_least_one_required: '至少需要一个标签或属性',
    labels_conflict: '标签 {{label}} 的值不同，无法进行抑制',
    attributes_conflict: '属性 {{attribute}} 的值不同，无法进行抑制',
    preview:
      '规则预览：当「<b>新告警：{{newAlertLabelsAttrs}}</b>」且在过去「<b>{{duration}} 秒</b>」内存在「<b>活跃告警：{{activeAlertLabelsAttrs}}</b>」，并且两者在「<b>{{matchLabelsAttrs}}</b>」相同时，抑制新告警的通知。',
    labels_filter: {
      label: '标签',
      label_tip: '仅对满足这些标签匹配条件的告警事件进行抑制，用于缩小影响范围，不配置表示不做限制。支持下拉选择已有标签键（推荐），也可手动输入',
      label_placeholder: '输入或者选择用于匹配的标签键，如 app / cluster / alertname',
    },
    labels_filter_value_placeholder: '手动输入或者选择用于匹配的标签值',
    attributes_filter: {
      label: '属性',
      label_tip: '按事件属性限定抑制范围：只有同时匹配这些属性的告警会被抑制；留空则对所有告警生效',
    },
    active_event_labels_filter: {
      label: '标签',
      label_tip: `**用于限定活跃告警的范围**
- 不配置：表示不使用标签进行过滤
- 配置：可以从下拉列表选择已有标签键（推荐），也可以手动输入标签键，只有当活跃告警同时满足这些标签条件时，才会进入筛选范围。

示例：填写 service=mon，表示仅当事件包含标签 service=mon 时，才会参与后续的抑制逻辑。`,
    },
    active_event_attributes_filter: {
      label: '属性',
      label_tip: `**用于限定活跃告警的范围**
- 不配置：表示不使用属性进行过滤
- 配置：只有当活跃告警同时满足这些属性条件时，才会被筛选出来。

示例：填写 业务组==DefaultBusiGroup，表示仅当活跃事件的"业务组"属性为 DefaultBusiGroup 时，才会被筛选出来，用作后续的事件抑制流程`,
    },
  },
  inhibit_qd: {
    help: '按查询结果抑制事件：当告警触发时，会执行下方数据查询；若返回至少一条数据，则抑制本次告警（不再通知）；无数据则正常通知。更多说明见 <a>使用文档</a>',
    t_1: '且 查询到以下 <b>数据</b>',
  },
  annotation_qd: {
    help: '附加查询处理器是一种告警增强方式。告警触发时，它能从数据源中查询相关信息，比如日志等，并附加到告警中。详见 <a>使用文档</a>',
    query_configs: '数据查询',
    use_event_datasource: '使用告警事件数据源',
    use_event_datasource_help: '开启后，仅可选择符合数据源类型的告警样例事件',
    datasource_cate_required: '数据源类型不能为空',
    datasource_ids_required: '数据源不能为空',
    select_alert_event_btn: '选择告警样例事件',
    select_alert_event_tip: '选择告警样例事件，用于渲染查询语句中的变量，并进行数据预览',
    select_alert_event_label: '已选告警样例事件',
    query_required: '查询条件不能为空',
    sql_limit_valid: 'SQL 查询语句必须包含 LIMIT 子句',
    annotation_configs: '数据追加',
    annotation_configs_tip: '配置 Key/Value 将数据查询结果，添加到告警信息中',
    annotation_key_tip: '定义新增字段 Key, 建议使用英文字母命名',
    annotation_val_tip: '新增字段 Value 模板，可参考使用文档中的写法',
    annotation_key_placeholder: '附加字段名称',
    annotation_val_placeholder: '附加字段内容，支持模板语法，将查询结果以变量方式填充',
    annotation_key_required: '附加字段名称不能为空',
    annotation_val_required: '附加字段内容不能为空',
    data_preview: '数据预览',
    data_preview_query: '查询语句',
    data_preview_no_eventid: '请先选择告警事件',
    query_limit: '返回条数限制',
  },
};
export default zh_CN;
