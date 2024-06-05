const zh_CN = {
  title: '订阅规则',
  search_placeholder: '搜索规则、标签、接收组',
  rule_name: '规则名称',
  sub_rule_name: '订阅告警规则',
  sub_rule_selected: '已选规则',
  tags: '订阅标签',
  user_groups: '告警接收组',
  tag: {
    key: {
      label: '订阅事件标签键',
      tip: '这里的标签是指告警事件的标签，通过如下标签匹配规则过滤告警事件',
    },
    func: {
      label: '运算符',
    },
    value: {
      label: '标签值',
    },
  },
  group: {
    key: {
      label: '订阅业务组',
      placeholder: '业务组',
    },
    func: {
      label: '运算符',
    },
    value: {
      label: '值',
    },
  },
  redefine_severity: '重新定义告警级别',
  redefine_channels: '重新定义通知媒介',
  redefine_webhooks: '重新定义回调地址',
  user_group_ids: '订阅告警接收组',
  for_duration: '订阅事件持续时长超过(秒)',
  for_duration_tip:
    '举例说明：如果配置了 300，同一个告警事件，在第一次被订阅到的时候，不会匹配订阅，后续再次被订阅到的时候，会计算当前事件的触发时间和此事件被首次订阅的触发时间的差值，得到的值如果超过了 300 秒会满足订阅条件，走相关通知逻辑，如果小于 300 秒，不会匹配订阅。此功能可以当做告警升级使用，团队的负责人可以配置一个持续时间超过1小时（3600s）的订阅，接收人配置为自己，作为兜底负责人，保证告警一定有人跟进。',
  webhooks: '新回调地址',
  webhooks_msg: '回调地址不能为空',
  prod: '监控类型',
  subscribe_btn: '订阅',
  basic_configs: '基础配置',
  severities: '订阅事件等级',
  severities_msg: '订阅事件等级不能为空',
  tags_groups_require: '标签和接收组至少填写一项',
  note: '规则备注',
};
export default zh_CN;
