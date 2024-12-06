const zh_CN = {
  title: '活跃告警',
  search_placeholder: '模糊搜索规则和标签(多个关键词请用空格分隔)',
  hours: {
    6: '最近 6 小时',
    12: '最近 12 小时',
    24: '最近 1 天',
    48: '最近 2 天',
    72: '最近 3 天',
    168: '最近 7 天',
    336: '最近 14 天',
    720: '最近 30 天',
    1440: '最近 60 天',
    2160: '最近 90 天',
  },
  severity: '告警级别',
  eventType: '事件类别',
  rule_name: '规则标题&事件标签',
  first_trigger_time: '首次触发时间',
  trigger_time: '触发时间',
  shield: '屏蔽',
  prod: '监控类型',

  aggregate_rule: '聚合规则',
  aggregate_rule_name: '规则名称',
  public: '公开',
  isPublic: '是否公开',
  status: '是否认领',
  status_1: '已认领',
  status_0: '未认领',
  batch_btn: '批量操作',
  batch_claim: '批量认领',
  batch_unclaim: '批量取消认领',
  claim: '认领',
  unclaim: '取消认领',
  claimant: '认领人',

  delete_confirm: {
    title: '删除告警事件',
    content: '通常只有在确定监控数据永远不再上报的情况下（比如调整了监控数据标签，或者机器下线）才删除告警事件，因为相关告警事件永远无法自动恢复了，您确定要这么做吗？',
  },

  detail: {
    title: '告警详情',
    card_title: '告警事件详情',
    buisness_not_exist: '该业务组已删除或无查看权限',
    rule_name: '规则标题',
    group_name: '业务组',
    rule_note: '规则备注',
    cate: '数据源类型',
    datasource_id: '数据源',
    severity: '告警级别',
    is_recovered: '事件状态',
    tags: '事件标签',
    target_note: '对象备注',
    trigger_time: '触发时间',
    first_trigger_time: '首次触发时间',
    last_eval_time: '本次检测时间',
    trigger_value: '上次异常触发时值',
    trigger_value2: '触发时值',
    recover_time: '恢复时间',
    rule_algo: '告警方式',
    rule_algo_anomaly: '智能告警',
    rule_algo_threshold: '阈值告警',
    prom_eval_interval: '执行频率',
    prom_for_duration: '持续时长',
    notify_channels: '通知渠道',
    notify_groups_obj: '告警接收组',
    callbacks: '回调地址',
    runbook_url: '预案链接',
    detail_url: '详情链接',
    host: {
      trigger: '触发',
    },
    trigger: '触发',
    firemap_ql_label: '卡片',
    northstar_ql_label: '指标',
    event_notify_records: {
      label: '通知记录',
      view: '查看详情',
      result_title: '通知结果',
      alert_rule_notify_records: '告警规则通知',
      subscription_rule_notify_records: '订阅规则通知',
      channel: '通知渠道',
      username: '通知对象',
      target: '通知目标',
      status: '通知状态',
      detail: '结果详情',
      sub_id: '规则 ID',
    },
    task_tpls: {
      label: '自愈模板',
    },
  },
};
export default zh_CN;
