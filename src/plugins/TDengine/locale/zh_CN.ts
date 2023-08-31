const zh_CN = {
  preview: '数据预览',
  query: {
    title: '查询统计',
    execute: '查询',
    project: '项目',
    project_msg: '请选择项目',
    project_tip: `
      <1>项目是日志服务的资源管理单元，是进行多用户隔离与访问控制的主要边界。更多信息，请参见<1>
      <2>项目</2>
    `,
    logstore: '日志库',
    logstore_msg: '请选择日志库',
    logstore_tip: `
      <1>日志库是日志服务中日志数据的采集、存储和查询单元。更多信息，请参见<1>
      <2>日志库</2>
    `,
    range: '查询区间',
    power_sql: 'SQL增强',
    query: '查询条件',
    mode: {
      timeSeries: '时序值',
      raw: '日志原文',
    },
    advancedSettings: {
      title: '辅助配置',
      valueKey_tip: '通过此字段从返回结果中提取的数值。例如 查询条件为 `* | select count(1) as PV` 返回结果为 PV:11，ValueKey 写了 PV，则会根据 PV 提取到 11，作为查询结果的值',
      tags_placeholder: '回车输入多个',
      labelKey_tip:
        '将此字段以及期对应的 value，作为tag，追加到监控数据的标签中，例如 查询条件为  `* | select count(1) as PV group by host` 返回结果为 `[{PV:11 host:dev01},{PV:10 host:dev02}]`, LabelKey 写了 host, 则第一条返回数据 host=dev01 会作为tag',
      timeKey_tip: '指定哪个字段是时间字段，作为绘制曲线图的x轴坐标',
      timeFormat_tip: '时间的格式，会根据此格式将时间转为时间戳',
    },
  },
  trigger: {
    title: '告警条件',
    value_msg: '请输入表达式值',
  },
  logs: {
    title: '日志详情',
    count: '结果数',
    filter_fields: '筛选字段',
    settings: {
      breakLine: '换行',
      reverse: '时间',
      organizeFields: {
        title: '字段列设置',
        allFields: '可用字段',
        showFields: '显示字段',
        showFields_empty: '日志默认显示全部字段',
      },
      jsonSettings: {
        title: 'JSON 设置',
        displayMode: '默认展示类型',
        displayMode_tree: '树形展示',
        displayMode_string: '字符串展示',
        expandLevel: '默认展开层级',
      },
    },
    tagsDetail: 'Tag 详情',
    expand: '展开',
    collapse: '收起',
  },
};
export default zh_CN;
