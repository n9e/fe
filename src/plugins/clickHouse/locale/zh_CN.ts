const zh_CN = {
  preview: '数据预览',
  query: {
    title: '查询统计',
    execute: '查询',
    query: '查询条件',
    query_required: '查询条件不能为空',
    query_placeholder: '输入 SQL 进行查询，按 Shift+Enter 换行',
    query_placeholder2: '按 Shift+Enter 换行',
    advancedSettings: {
      title: '辅助配置',
      tags_placeholder: '回车输入多个',
      valueKey: '值字段',
      valueKey_tip: 'SQL 查询结果通常包含多个列，您可以指定哪些列的值作为曲线展示在图表上',
      valueKey_required: '值字段不能为空',
      labelKey: '标签字段',
      labelKey_tip: 'SQL 查询结果通常包含多个列，您可以指定哪些列作为曲线的标签元信息',
    },
    schema: '元信息',
    document: '使用文档',
    dashboard: {
      mode: {
        label: '查询模式',
        table: '非时序数据',
        timeSeries: '时序数据',
      },
    },
    historicalRecords: {
      button: '历史记录',
      searchPlaceholder: '搜索历史记录',
    },
    compass_btn_tip: '点击查看表数据',
  },
  trigger: {
    title: '告警条件',
    value_msg: '请输入表达式值',
  },
  datasource: {
    shards: {
      title: '数据源基本信息',
      title_tip: '数据库是否能够连通依赖DBA是否已给相应DB用户授权，如因此未能连通仍可先继续完成后面的设置，后续再做验证。',
      addr: '数据库地址',
      addr_tip: '数据库地址需唯一',
      user: '用户名',
      password: '密码',
      help: '说明：账号需对相应数据库有读权限才可继续后续操作，如修改为其它账号请尽量使用只读权限账号。',
    },
  },
};
export default zh_CN;
