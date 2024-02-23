const zh_HK = {
  title: '屏蔽規則',
  search_placeholder: '搜尋標籤、屏蔽原因',
  datasource_type: '數據源類型',
  datasource_id: '數據源',
  cause: '屏蔽原因',
  time: '屏蔽時間',
  note: '規則備註',
  btime: '屏蔽開始時間',
  duration: '屏蔽時長',
  etime: '屏蔽結束時間',
  prod: '監控類型',
  severities: '屏蔽事件等級',
  severities_msg: '屏蔽事件等級不能為空',
  mute_type: {
    '0': '固定時間',
    '1': '週期時間',
    label: '屏蔽時間類型',
    days_of_week: '屏蔽時間',
    start: '開始時間',
    start_msg: '開始時間不能為空',
    end: '結束時間',
    end_msg: '結束時間不能為空',
  },
  tag: {
    key: {
      label: '屏蔽事件標籤 Key',
      tip: '這裏的標籤是指告警事件的標籤，通過如下標籤匹配規則過濾告警事件',
      msg: 'key 不能為空',
    },
    func: {
      label: '運算子',
      msg: '運算子不能為空',
    },
    value: {
      label: '標籤 Value',
      placeholder1: '可以輸入多個值，用回車分割',
      placeholder2: '請輸入正規表示式匹配標籤 value',
      msg: 'value 不能為空',
    },
  },
  quick_template: {
    title: '快捷模板',
    all: '本組全部告警屏蔽',
    target_miss: '機器失聯屏蔽',
    __name__: '屏蔽 Metric',
    ident: '屏蔽 Ident',
  },
};

export default zh_HK;
