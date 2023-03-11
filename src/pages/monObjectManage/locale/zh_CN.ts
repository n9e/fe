const zh_CN = {
  title: '对象列表',
  default_filter: '预置筛选',
  ungrouped_targets: '未归组对象',
  all_targets: '全部对象',
  datasource: '数据源',
  search_placeholder: '模糊搜索表格内容(多个关键词请用空格分隔)',
  ident_copy_success: '复制成功 {{num}} 条记录',
  not_grouped: '未归组',
  target_up: '状态',
  load_per_core: '单核负载',
  mem_util: '内存',
  disk_util: '根分区',
  offset: '时间偏移',

  targets: '监控对象',
  targets_placeholder: '请填写监控对象的指标，一行一个',
  bind_tag: {
    title: '绑定标签',
    placeholder: '标签格式为 key=value ，使用回车或空格分隔',
    msg1: '请填写至少一项标签！',
    msg2: '标签格式不正确，请检查！',
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
};
export default zh_CN;
