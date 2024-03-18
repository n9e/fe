const zh_HK = {
  title: '訂閱規則',
  search_placeholder: '搜尋規則、標籤、接收組',
  rule_name: '規則名稱',
  sub_rule_name: '訂閱告警規則',
  sub_rule_selected: '已選規則',
  tags: '訂閱標籤',
  user_groups: '告警接收組',
  tag: {
    key: {
      label: '訂閱事件標籤鍵',
      tip: '這裏的標籤是指告警事件的標籤，通過如下標籤匹配規則過濾告警事件',
    },
    func: {
      label: '運算子',
    },
    value: {
      label: '標籤值',
    },
  },
  group: {
    key: {
      label: '訂閱業務組',
      placeholder: '業務組',
    },
    func: {
      label: '運算子',
    },
    value: {
      label: '值',
    },
  },
  redefine_severity: '重新定義告警級別',
  redefine_channels: '重新定義通知媒介',
  redefine_webhooks: '重新定義回撥地址',
  user_group_ids: '訂閱告警接收組',
  for_duration: '訂閱事件持續時長超過 (秒)',
  for_duration_tip:
    '舉例說明：如果配置了300，同一個告警事件，在第一次被訂閱到的時候，不會匹配訂閱，後續再次被訂閱到的時候，會計算當前事件的觸發時間和此事件被首次訂閱的觸發時間的差值，得到的值如果超過了300 秒會滿足訂閱條件，走相關通知邏輯，如果小於300 秒，不會匹配訂閱。此功能可以當做告警升級使用，團隊的負責人可以配置一個持續時間超過1小時（3600s）的訂閱，接收人配置為自己，作為兜底負責人，保證告警一定有人跟進。',
  webhooks: '新回撥地址',
  webhooks_msg: '回撥地址不能為空',
  prod: '監控類型',
  subscribe_btn: '訂閱',
  basic_configs: '基礎配置',
  severities: '訂閱事件等級',
  severities_msg: '訂閱事件等級不能為空',
  tags_groups_require: '標籤和接收組至少填寫一項',
  note: '規則備註',
};

export default zh_HK;
