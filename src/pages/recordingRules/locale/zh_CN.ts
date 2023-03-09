const zh_CN = {
  title: '记录规则',
  search_placeholder: '搜索名称或标签',
  name: '指标名称',
  name_msg: '指标名称非法',
  name_tip: 'promql周期性计算，会生成新的指标，这里填写新的指标的名字',
  note: '备注',
  disabled: '启用',
  prom_eval_interval: '执行频率',
  prom_eval_interval_tip: 'promql 执行频率，每隔 {{num}} 秒查询时序库，查到的结果重新命名写回时序库',
  append_tags: '附加标签',
  append_tags_msg: '标签格式不正确，请检查！',
  append_tags_msg1: '标签长度应小于等于 64 位',
  append_tags_msg2: '标签格式应为 key=value。且 key 以字母或下划线开头，由字母、数字和下划线组成。',
  append_tags_placeholder: '标签格式为 key=value ，使用回车或空格分隔',
  batch: {
    must_select_one: '未选择任何规则',
    import: {
      title: '导入记录规则',
      name: '记录规则',
    },
    export: {
      title: '导出记录规则',
      copy: '复制 JSON 到剪贴板',
    },
    delete: '删除记录规则',
    update: {
      title: '更新记录规则',
      field: '字段',
      changeto: '改为',
      prom_eval_interval_tip: 'promql 执行频率，每隔 {{num}} 秒查询时序库，查到的结果重新命名写回时序库',
      options: {
        datasource_ids: '数据源',
        prom_eval_interval: '执行频率',
        disabled: '启用',
        append_tags: '附加标签',
      },
    },
  },
};
export default zh_CN;
