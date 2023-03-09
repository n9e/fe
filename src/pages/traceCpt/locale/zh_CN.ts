const zh_CN = {
  title: '即时查询',
  dependencies: '拓扑分析',
  mode: {
    id: 'Trace ID 查询',
    query: '条件查询',
  },
  label: '标签',
  label_tip: `
    <0>
      值支持
      <1>logfmt</1>
      格式
    </0>
    <2>空格分割</2>
    <3>包含空格的字符串需要引号包裹</3>
    `,
  time: '时间区间',
  duration_max: '最大耗时',
  duration_min: '最小耗时',
  num_traces: '显示结果数',
  query: '查询',
  traceid_msg: '请输入 Trace ID',
  sort: {
    MOST_RECENT: '最新优先',
    LONGEST_FIRST: '时长优先',
    SHORTEST_FIRST: '时短优先',
    MOST_SPANS: 'span多优先',
    LEAST_SPANS: 'span少优先',
  },
};
export default zh_CN;
