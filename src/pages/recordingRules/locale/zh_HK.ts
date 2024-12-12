const zh_HK = {
  title: '記錄規則',
  search_placeholder: '搜尋名稱或標籤',
  name: '指標名稱',
  name_msg: '指標名稱非法',
  name_tip: 'promql 週期性計算，會生成新的指標，這裏填寫新的指標的名字',
  note: '備註',
  disabled: '啟用',
  append_tags: '附加標籤',
  append_tags_msg: '標籤格式不正確，請檢查！',
  append_tags_msg1: '標籤長度應小於等於 64 位',
  append_tags_msg2: '標籤格式應為 key=value。且 key 以字母或下劃線開頭，由字母、數字和下劃線組成。',
  append_tags_placeholder: '標籤格式為 key=value ，使用回車或空格分隔',
  batch: {
    must_select_one: '未選擇任何規則',
    import: {
      title: '匯入記錄規則',
      name: '記錄規則',
    },
    export: {
      title: '匯出記錄規則',
      copy: '複製 JSON 到剪貼簿',
    },
    delete: '刪除記錄規則',
    update: {
      title: '更新記錄規則',
      field: '字段',
      changeto: '改為',
      options: {
        datasource_ids: '數據源',
        disabled: '啟用',
        append_tags: '附加標籤',
        cron_pattern: '執行頻率',
      },
    },
  },
};

export default zh_HK;
