const zh_HK = {
  modal: {
    title: '遷移設置',
    success: '遷移成功',
    datasource_variable: '數據源變量設置',
    variable_name: '變量名稱',
    variable_name_required: '請填寫變量名稱',
    datasource_type: '數據源類型',
    datasource_default: '數據源默認值',
  },
  title: '儀表盤遷移',
  migrate: '遷移',
  help: `
  v6 版本將不再支持全局 Prometheus 集群切換，新版本可通過圖表關聯數據源變量來實現該能力。
  <br />
  遷移工具會創建數據源變量以及關聯所有未關聯數據源的圖表。
  <br />
  以下是待遷移的儀表盤列表，點擊遷移按鈕開始遷移。
  `,
};

export default zh_HK;
