const zh_HK = {
  title: '遮蔽規則',
  search_placeholder: '搜尋標籤、遮蔽原因',
  datasource_type: '資料來源型別',
  datasource_id: '資料來源',
  cause: '遮蔽原因',
  time: '遮蔽時間',
  note: '規則備註',
  btime: '遮蔽開始時間',
  duration: '遮蔽時長',
  etime: '遮蔽結束時間',
  prod: '監控型別',
  mute_type: {
    '0': '固定時間',
    '1': '週期時間',
    label: '遮蔽時間型別',
    days_of_week: '遮蔽時間',
    start: '開始時間',
    start_msg: '開始時間不能為空',
    end: '結束時間',
    end_msg: '結束時間不能為空',
  },
  tag: {
    key: {
      label: '遮蔽事件標籤 Key',
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
};

export default zh_HK;
