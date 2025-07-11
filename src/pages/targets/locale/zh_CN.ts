const zh_CN = {
  title: '机器列表',
  default_filter: '预置筛选',
  ungrouped_targets: '未归组机器',
  all_targets: '全部机器',
  datasource: '数据源',
  search_placeholder: '模糊搜索表格内容(多个关键词请用空格分隔)',
  filterDowntime: '心跳更新',
  filterDowntimeNegative: '心跳有更新',
  filterDowntimePositive: '心跳无更新',
  filterDowntimeNegativeMin: '{{count}} 分钟内有更新',
  filterDowntimePositiveMin: '{{count}} 分钟内无更新',
  ident_copy_success: '复制成功 {{num}} 条记录',
  not_grouped: '未归组',
  host_ip: 'IP',
  host_tags: '上报的标签',
  tags: '自定义标签',
  group_obj: '业务组',
  target_up: '状态',
  mem_util: '内存',
  cpu_util: 'CPU',
  cpu_num: '核数',
  offset: '时间偏移',
  offset_tip: '计算逻辑为用 夜莺部署机器的时间减去categraf部署机器的时间',
  os: '操作系统',
  arch: 'CPU架构',
  update_at: '更新时间',
  update_at_tip: `
    1分钟内有过心跳：绿色 <1 />
    3分钟内有过心跳：黄色 <1 />
    3分钟内没有心跳：红色
  `,
  remote_addr: '来源 IP',
  remote_addr_tip: '来源 IP 是从 HTTP Header 中获取的，如果经过了代理，不一定是真实的来源IP',
  agent_version: 'Agent 版本',
  note: '备注',
  unknown_tip: '机器元信息的展示，categraf 的版本需要高于 0.2.35',
  organize_columns: {
    title: '显示列',
  },
  targets: '监控对象',
  targets_placeholder: '请填写监控对象的指标，一行一个',
  copy: {
    current_page: '复制当前页',
    all: '复制全部',
    selected: '复制所选',
    no_data: '没有可复制的数据',
  },
  bind_tag: {
    title: '绑定标签',
    placeholder: '标签格式为 key=value ，使用回车或空格分隔',
    msg1: '请填写至少一项标签！',
    msg2: '标签格式不正确，请检查！',
    msg3: '标签 key 不能重复',
    render_tip1: '标签长度应小于等于 64 位',
    render_tip2: '标签格式应为 key=value。且 key 以字母或下划线开头，由字母、数字和下划线组成。',
  },
  unbind_tag: {
    title: '解绑标签',
    placeholder: '请选择要解绑的标签',
    msg: '请填写至少一项标签！',
  },
  update_busi: {
    title: '修改业务组',
    label: '归属业务组',
    mode: {
      label: '模式',
      reset: '覆盖',
      add: '新增',
      del: '删除',
    },
    tags: '绑定标签',
    tags_tip: '为空不会覆盖之前的标签',
  },
  remove_busi: {
    title: '移出业务组',
    msg: '提示信息：移出所属业务组，该业务组的管理人员将不再有权限操作这些监控对象！您可能需要提前清空这批监控对象的标签和备注信息！',
    btn: '移出',
  },
  update_note: {
    title: '修改备注',
    placeholder: '内容如果为空，表示清空备注信息',
  },
  batch_delete: {
    title: '批量删除',
    msg: '提示信息：该操作会把监控对象从系统内中彻底删除，非常危险，慎重操作！',
    btn: '删除',
  },
  meta_tip: '查看元信息',
  meta_title: '元信息',
  meta_desc_key: '元信息名称',
  meta_desc_value: '元信息值',
  meta_value_click_to_copy: '点击复制',
  meta_expand: '展开',
  meta_collapse: '收起',
  meta_no_data: '暂无数据',
  all_no_data: '没有部署采集器？可参考 <a>安装手册</a> 安装部署',
  categraf_doc: 'categraf 文档',
  hosts_select: {
    placeholder: '机器标识或者 IP',
    modal_title: '填写机器标识或者 IP',
    modal_placeholder: '每行一个机器标识或者 IP',
  },
};
export default zh_CN;
