const zh_CN = {
  toolbar: {
    current_chat: '当前会话',
    new_chat: '新建会话',
    history: '会话历史',
    switch_to_drawer: '切换为抽屉模式',
    switch_to_floating: '切换为浮窗模式',
  },
  history: {
    untitled: '新会话',
    today: '今天',
    yesterday: '昨天',
    earlier: '更早',
    unknown_time: '--:--',
    delete_confirm: '删除该会话？',
    empty: '暂无历史会话',
  },
  input: {
    placeholder: '输入问题，Enter 发送，Shift + Enter 换行',
  },
  query: {
    title: '查询语句',
    copied: '已复制查询语句',
    copy: '复制',
    execute: '执行查询',
    execute_disabled: '未传入执行回调，将仅支持复制',
  },
  action: {
    query_generator: '生成查询语句',
  },
  message: {
    generating: '正在生成回复...',
    hint: '提示',
    stopped: '已停止生成',
    request_failed: '请求失败',
    cancelled: '本次回复已被取消。',
    retry_later: '请稍后重试。',
    empty_response: '暂无回复内容',
    thinking: '思考过程',
    unsupported_type: '暂不支持的内容类型：{{type}}',
  },
  form_select: {
    title: '请先补充以下信息后继续：',
    busi_group: '业务组',
    datasource: '数据源',
    placeholder_select: '请选择',
    confirm: '确定',
  },
  alert_rule: {
    title: '告警规则',
    copy: '复制',
    copied: '已复制规则 ID',
    duration_seconds: '持续 {{seconds}} 秒',
    field: {
      id: '规则 ID',
      name: '规则名称',
      group: '业务组',
      datasource: '数据源',
      cate: '数据源类型',
      severity: '告警级别',
      metric: '监控指标',
      condition: '触发条件',
      note: '告警内容',
    },
    severity: {
      critical: 'Critical',
      warning: 'Warning',
      info: 'Info',
    },
  },
  dashboard: {
    title: '仪表盘',
    copied: '已复制仪表盘 ID',
    field: {
      id: '仪表盘 ID',
      name: '名称',
      group: '业务组',
      datasource: '默认数据源',
      panels_count: '面板数',
      variables_count: '变量数',
      tags: '标签',
    },
  },
  empty: {
    greeting_prefix: '你好,我是',
  },
};

export default zh_CN;
