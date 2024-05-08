const zh_CN = {
  title: '指标管理',
  name: '指标名称',
  collector: '采集器',
  typ: '类型',
  unit: '单位',
  unit_tip: '绘图时，根据指标单位自动格式化值',
  note: '描述',
  note_preview: '描述预览',
  expression: '表达式',
  add_btn: '新增指标',
  clone_title: '克隆指标',
  edit_title: '编辑指标',
  explorer: '查询',
  closePanelsBelow: '关闭下方面板',
  addPanel: '添加面板',
  batch: {
    not_select: '请先选择指标',
    export: {
      title: '导出指标',
    },
    import: {
      title: '导入指标',
      name: '指标名称',
      result: '导入结果',
      errmsg: '错误信息',
    },
  },
  filter: {
    title: '过滤条件',
    title_tip:
      '过滤条件 的作用是，在点击右侧指标，查看指标的监控数据时，缩小查询监控数据的范围。如果配置并选择了过滤条件 {ident="n9e01"}，则在查询 cpu_usage_idle 时，发起的查询是 cpu_usage_idle{ident="n9e01"}，会极大降低查询曲线的数量',
    add_title: '新增过滤条件',
    edit_title: '编辑过滤条件',
    import_title: '导入过滤条件',
    name: '名称',
    datasource: '数据源',
    datasource_tip: '辅助查询过滤条件的数据源',
    configs: '过滤条件',
    groups_perm: '授权团队',
    perm: {
      1: '读写',
      0: '只读',
    },
    build_labelfilter_and_expression_error: '构建标签过滤条件和表达式失败',
  },
};
export default zh_CN;
