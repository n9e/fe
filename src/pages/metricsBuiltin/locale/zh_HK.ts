const zh_HK = {
  title: '指標管理',
  name: '名稱',
  collector: '采集器',
  typ: '類型',
  unit: '單位',
  unit_tip: '繪圖時，根據指標單位自動格式化值',
  note: '描述',
  note_preview: '描述預覽',
  expression: '表達式',
  add_btn: '新增指標',
  clone_title: '克隆指標',
  edit_title: '編輯指標',
  explorer: '查詢',
  closePanelsBelow: '關閉下方面板',
  addPanel: '添加面板',
  batch: {
    not_select: '請先選擇指標',
    export: {
      title: '導出指標',
    },
    import: {
      title: '導入指標',
      name: '指標名稱',
      result: '導入結果',
      errmsg: '錯誤信息',
    },
  },
  filter: {
    title: '過濾條件',
    title_tip:
      '過濾條件 的作用是，在點擊右側指標，查看指標的監控數據時，縮小查詢監控數據的範圍。如果配置並選擇了過濾條件 {ident="n9e01"}，則在查詢 cpu_usage_idle 時，發起的查詢是 cpu_usage_idle{ident="n9e01"}，會極大降低查詢曲線的數量',
    add_title: '新增過濾條件',
    edit_title: '編輯過濾條件',
    import_title: '導入過濾條件',
    name: '名稱',
    datasource: '數據源',
    datasource_tip: '輔助查詢過濾條件的數據源',
    configs: '過濾條件',
    groups_perm: '授權團隊',
    groups_perm_gid_msg: '請選擇授權團隊',
    perm: {
      1: '讀寫',
      0: '只讀',
    },
    build_labelfilter_and_expression_error: '構建標籤過濾條件和表達式失敗',
    filter_label_msg: '標籤不能為空',
    filter_oper_msg: '操作符不能為空',
    filter_value_msg: '標籤值不能為空',
  },
};

export default zh_HK;
