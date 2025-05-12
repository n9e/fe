const zh_CN = {
  title: '事件 Pipelines',
  teams: '授权团队',
  teams_tip: '限定哪些团队成员可以查看和修改此配置，可以关联多个团队<br />例如：将配置授权给 infra-team，则只有 infra-team 团队下的成员可以访问或调整本配置。',
  basic_configuration: '基本配置',
  filter_enable: '过滤条件',
  label_filters: '适用标签',
  label_filters_tip:
    '设置事件处理的标签过滤条件，仅当事件包含与此处配置匹配的标签时，才会被处理。<br />示例：填写 service=mon，表示仅当事件包含标签 service=mon 时，才会进入该处理流程。',
  attribute_filters: '适用属性',
  attribute_filters_tip:
    '设置事件处理的属性过滤条件，仅当事件包含与此处配置匹配的属性时，才会被处理。<br />示例：填写 业务组==DefaultBusiGroup，表示仅当事件的“业务组”属性为 DefaultBusiGroup 时，才会进入该处理流程。',
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
};
export default zh_CN;
