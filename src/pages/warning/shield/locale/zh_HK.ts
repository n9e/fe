const zh_HK = {
  title: '屏蔽規則',
  edit_missing_params: '缺少必要參數，無法編輯，請聯繫管理員',
  search_placeholder: '搜索規標題、標籤、屏蔽原因',
  datasource_type: '數據源類型',
  datasource_id: '數據源',
  cause: '屏蔽原因',
  cause_tip: '記錄本次屏蔽的背景，便於團隊成員理解為什麼屏蔽、什麼時候可以解除',
  cause_placeholder: '例如：訂單服務發版，預計 1 小時內完成',
  time: '屏蔽時間',
  note: '規則標題',
  btime: '屏蔽開始時間',
  btime_msg: '屏蔽開始時間不能為空',
  duration: '屏蔽時長',
  duration_quick: '快捷時長',
  duration_quick_tip: '以「屏蔽開始時間」為起點推算結束時間，也可以直接修改下面的起止時間',
  etime: '屏蔽結束時間',
  etime_msg: '屏蔽結束時間不能為空',
  etime_before_btime_msg: '屏蔽結束時間必須晚於開始時間',
  expired_tip: '該規則已過期，當前不會屏蔽任何告警。如需繼續生效，請選擇快捷時長或修改結束時間',
  long_duration_tip: '屏蔽時長超過 {{days}} 天，期間的告警將長期不可見，請確認是否符合預期',
  prod: '監控類型',
  severities: '事件等級',
  severities_tip: '只有勾選的等級會被屏蔽，未勾選的等級仍會正常告警',
  severities_msg: '事件等級不能為空',
  scope_unlimited_tip: '當前沒有配置數據源和事件標籤，該規則將屏蔽所選業務組下的所有告警事件，請確認是否符合預期',
  mute_type: {
    '0': '固定時間',
    '1': '週期時間',
    label: '屏蔽時間類型',
    days_of_week: '屏蔽時間',
    days_preset: {
      everyday: '每天',
      workday: '工作日',
      weekend: '週末',
    },
    start: '開始時間',
    start_msg: '開始時間不能為空',
    end: '結束時間',
    end_msg: '結束時間不能為空',
    periodic_tip: '週期屏蔽長期有效，每週在上述時段內命中的告警都會被屏蔽；開始時間與結束時間相同表示全天',
  },
  mute_method: {
    label: '屏蔽方式',
    0: '屏蔽事件與通知',
    '0_desc': '（不產生事件，也不發通知）',
    1: '只屏蔽通知',
    '1_desc': '（正常記錄事件，只是不發通知）',
    tip: '選擇「只屏蔽通知」時，屏蔽週期內匹配的告警仍會正常產生事件並記錄，僅不發送通知，便於感知變更期間是否產生異常，處理恢復後再放開屏蔽。',
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
  name_auto_tip: '標題會根據上面的篩選條件自動生成，可隨時修改',
  name_auto_template: '屏蔽 {{scope}}',
  name_auto_separator: '、',
  name_auto_all_alerts: '全部告警',
  summary: {
    severities_all: '全部等級',
    tags_none: '標籤不限',
    tags_count: '{{count}} 個標籤條件',
    periodic_count: '{{count}} 個時段',
  },
  basic_configs: '基本信息',
  basic_configs_desc: '規則標題與屏蔽原因，便於團隊協作和後續檢索',
  filter_configs: '篩選條件',
  filter_configs_desc: '決定哪些告警事件會被屏蔽：業務組、數據源、事件等級、事件標籤，條件之間是「與」的關係，留空表示不限制',
  mute_configs: '屏蔽設置',
  mute_configs_desc: '決定什麼時候屏蔽、屏蔽到什麼程度：固定的一段時間，或每週重複的時段',
  alert_content: '為了防止誤配屏蔽規則屏蔽掉公司所有的告警，此屏蔽規則只會生效於特定業務組下的告警事件',
  preview_muted_title: '預覽相關事件',
  preview_muted_desc: '以下是當前已存在、且符合本條篩選條件的告警事件。保存後新產生的同類事件會被屏蔽，已存在的事件不會自動消失，可在此一併刪除。',
  preview_muted_save_only: '僅保存',
  preview_muted_save_and_delete: '保存並刪除相關事件',
  expired: '已過期',
  empty_guide: {
    title: '還沒有屏蔽規則',
    desc: '發版、維護、演練期間，用屏蔽規則臨時擋掉已知的告警，避免打擾值班同學；到期自動失效，不需要手動恢復。',
    select_busi_group: '請先在左側選擇一個業務組',
  },
  delete_mutes: {
    title: '屏蔽規則清理',
    alert_message: '一旦刪除將無法找回，請謹慎操作！',
    timestamp: '時間篩選',
    timestamp_options: {
      1: '1 個月之前',
      3: '3 個月之前',
      6: '6 個月之前',
      12: '1 年之前',
    },
  },
  filter_disabled: {
    placeholder: '啟用狀態',
    0: '啟用',
    1: '停用',
  },
};

export default zh_HK;
