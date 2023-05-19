const zh_HK = {
  title: '即時查詢',
  dependencies: '拓撲分析',
  mode: {
    id: 'Trace ID 查詢',
    query: '條件查詢',
  },
  label: '標籤',
  label_tip: `
    <0>
      值支援
      <1>logfmt</1>
      格式
    </0>
    <2>空格分割</2>
    <3>包含空格的字串需要引號包裹</3>
    `,
  time: '時間區間',
  duration_max: '最大耗時',
  duration_min: '最小耗時',
  num_traces: '顯示結果數',
  query: '查詢',
  traceid_msg: '請輸入 Trace ID',
  sort: {
    MOST_RECENT: '最新優先',
    LONGEST_FIRST: '時長優先',
    SHORTEST_FIRST: '時短優先',
    MOST_SPANS: 'span 多優先',
    LEAST_SPANS: 'span 少優先',
  },
};

export default zh_HK;
