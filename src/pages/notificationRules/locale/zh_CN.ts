const zh_CN = {
  title: '通知规则',
  basic_configuration: '基础配置',
  user_group_ids: '授权团队',
  user_group_ids_tip: '这里填写的团队中的用户，将有权限管理或查看此通知规则',
  enabled_tip: '是否启用此通知规则',
  note_tip: '可在此补充该通知规则的详细信息或说明，便于日后维护',
  notification_configuration: {
    title: '通知配置',
    add_btn: '添加通知配置',
    channel: '通知媒介',
    channel_tip: '选择使用哪种媒介发送告警事件通知，如果已有媒介不满足需求，可以联系管理员创建新的媒介',
    channel_msg: '请选择通知媒介',
    template: '消息模板',
    template_tip: '通知内容的模板，可以根据不同的场景使用不同的模板',
    template_msg: '请选择消息模板',
    severities: '适用级别',
    severities_tip: '选择要对哪个等级的告警事件进行通知，只有勾选上的级别，才会被通知。如果三个等级都没有勾选，这个媒介就匹配不到告警事件了，相当于禁用了这个媒介',
    time_ranges: '适用时段',
    time_ranges_tip: '通知规则可以限制仅在部分时段生效，不配置表示不做限制',
    effective_time_start: '开始时间',
    effective_time_end: '结束时间',
    effective_time_week_msg: '请选择生效星期',
    effective_time_start_msg: '请选择开始时间',
    effective_time_end_msg: '请选择结束时间',
    label_keys: '适用标签',
    label_keys_tip: '通知规则可以限制仅对符合条件（通过事件标签做筛选）的部分告警事件生效，不配置表示不做限制',
    attributes: '适用属性',
    attributes_value: '属性值',
    attributes_tip: '通知规则可以限制仅对符合某些事件属性的部分告警事件生效，不配置表示不做限制',
    attributes_options: {
      group_name: '业务组',
      cluster: '数据源',
      is_recovered: '是恢复事件？',
    },
    run_test_btn: '通知测试',
    run_test_btn_tip: '可以选择几个已经产生的事件，测试一下此通知配置是否正确，如果正确，应该会收到相关的通知消息',
    run_test_request_result: '测试通知已发送，通知目标返回响应如下：',
    user_info: {
      user_ids: '接收人',
      user_group_ids: '接收团队',
      error: '接收人和接收团队不能同时为空',
    },
    flashduty: {
      ids: '协作空间',
    },
  },
  user_group_id_invalid_tip: '授权团队不存在',
  channel_invalid_tip: '通知媒介不存在',
  pipeline_configuration: {
    title: '事件处理',
    name_placeholder: '请选择事件处理',
    name_required: '事件处理不能为空',
    add_btn: '添加事件处理',
    disable: '禁用',
    enable: '启用',
  },
};
export default zh_CN;
