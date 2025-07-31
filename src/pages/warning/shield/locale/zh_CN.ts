const zh_CN = {
  title: '屏蔽规则',
  search_placeholder: '搜索规则标题、标签、屏蔽原因',
  datasource_type: '数据源类型',
  datasource_id: '数据源',
  cause: '屏蔽原因',
  time: '屏蔽时间',
  note: '规则标题',
  btime: '屏蔽开始时间',
  duration: '屏蔽时长',
  etime: '屏蔽结束时间',
  prod: '监控类型',
  severities: '事件等级',
  severities_msg: '事件等级不能为空',
  mute_type: {
    label: '屏蔽时间类型',
    0: '固定时间',
    1: '周期时间',
    days_of_week: '屏蔽时间',
    start: '开始时间',
    start_msg: '开始时间不能为空',
    end: '结束时间',
    end_msg: '结束时间不能为空',
  },
  tag: {
    key: {
      label: '事件标签',
      tip: `这里的标签是指告警事件的标签，通过如下标签匹配规则过滤告警事件。支持多种匹配运算符，说明如下：

- \`==\` 匹配某个具体的标签值，只能填写一个，如果想同时匹配多个，应该使用 \`in\` 操作符
- \`=~\` 填写正则表达式，灵活匹配标签值
- \`in\` 匹配多个标签值，类似 SQL 里的 \`in\` 操作
- \`not in\` 不匹配的标签值，可填写多个，类似 SQL 里的 \`not in\` 操作，用于排除多个标签值
- \`!=\` 不等于，用于排除特定的某个标签值
- \`!~\` 正则不匹配，填写正则，匹配这个正则的标签值都将被排除，类似 PromQL 中的 \`!~\``,
    },
  },
  basic_configs: '基本信息',
  filter_configs: '筛选条件',
  filter_configs_tip: '符合筛选条件的告警事件会命中屏蔽规则，进而被屏蔽。筛选条件本质就是对告警事件的筛选，通过事件的数据源、等级、标签等信息进行筛选',
  mute_configs: '屏蔽时长',
  alert_content: '为了防止误配屏蔽规则屏蔽掉公司所有的告警，此屏蔽规则只会生效于特定业务组下的告警事件',
  preview_muted_title: '预览相关事件',
  preview_muted_save_only: '仅保存',
  preview_muted_save_and_delete: '保存并删除相关事件',
  expired: '已过期',
  quick_mute: '快速屏蔽',
};
export default zh_CN;
