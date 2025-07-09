const zh_HK = {
  title: '屏蔽規則',
  search_placeholder: '搜索規標題、標籤、屏蔽原因',
  datasource_type: '數據源類型',
  datasource_id: '數據源',
  cause: '屏蔽原因',
  time: '屏蔽時間',
  note: '規則標題',
  btime: '屏蔽開始時間',
  duration: '屏蔽時長',
  etime: '屏蔽結束時間',
  prod: '監控類型',
  severities: '事件等級',
  severities_msg: '事件等級不能為空',
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
      label: '事件標籤',
      tip: `這裡的標籤是指告警事件的標籤，通過如下標籤匹配規則過濾告警事件。支持多種匹配運算符，說明如下：

- \`==\` 匹配某個具體的標籤值，只能填寫一個，如果想同時匹配多個，應該使用 \`in\` 操作符
- \`=~\` 填寫正則表達式，靈活匹配標籤值
- \`in\` 匹配多個標籤值，類似 SQL 裡的 \`in\` 操作
- \`not in\` 不匹配的標籤值，可填寫多個，類似 SQL 裡的 \`not in\` 操作，用於排除多個標籤值
- \`!=\` 不等於，用於排除特定的某個標籤值
- \`!~\` 正則不匹配，填寫正則，匹配這個正則的標籤值都將被排除，類似 PromQL 中的 \`!~\``,
    },
  },
  basic_configs: '基本信息',
  filter_configs: '篩選條件',
  filter_configs_tip: '符合篩選條件的告警事件會命中屏蔽規則，進而被屏蔽。篩選條件本質就是對告警事件的篩選，通過事件的數據源、等級、標籤等信息進行篩選',
  mute_configs: '屏蔽時長',
  alert_content: '為了防止誤配屏蔽規則屏蔽掉公司所有的告警，此屏蔽規則只會生效於特定業務組下的告警事件',
  preview_muted_title: '預覽相關事件',
  preview_muted_save_only: '僅保存',
  preview_muted_save_and_delete: '保存並刪除相關事件',
  expired: '已過期',
};

export default zh_HK;
