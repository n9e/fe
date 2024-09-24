const ja_JP = {
  title: "メトリクスビュー",
  name: "メトリクス名",
  collector: "コレクタ",
  typ: "タイプ",
  unit: "単位",
  unit_tip: "グラフ描画時、メトリクスの単位に応じて値を自動フォーマットします",
  note: "説明",
  note_preview: "説明プレビュー",
  expression: "式",
  add_btn: "メトリクスの作成",
  clone_title: "メトリクスのクローン",
  edit_title: "メトリクスの編集",
  explorer: "クエリ",
  closePanelsBelow: "下のパネルを閉じる",
  addPanel: "パネルの追加",
  batch: {
    not_select: "まずメトリクスを選択してください",
    export: {
      title: "メトリクスのエクスポート",
    },
    import: {
      title: "メトリクスのインポート",
      name: "メトリクス名",
      result: "インポート結果",
      errmsg: "エラーメッセージ",
    },
  },
  filter: {
    title: "フィルタ条件",
    title_tip:
      'フィルタ条件の目的は、右側のメトリクスをクリックしてメトリクスの監視データを表示する際、クエリの監視データの範囲を縮小することです。フィルタ条件 {ident="n9e01"} を設定して選択した場合、cpu_usage_idle のクエリは cpu_usage_idle{ident="n9e01"} となり、クエリ曲線の数が大幅に減少します',
    add_title: "フィルタ条件の追加",
    edit_title: "フィルタ条件の編集",
    import_title: "フィルタ条件のインポート",
    name: "名前",
    datasource: "データソース",
    datasource_tip: "フィルタ条件のデータソースを補助します",
    configs: "フィルタ条件",
    groups_perm: "権限チーム",
    groups_perm_gid_msg: "権限チームを選択してください",
    perm: {
      "0": "読み取りのみ",
      "1": "読み取りと書き込み",
    },
    build_labelfilter_and_expression_error:
      "ラベルフィルタ条件と式の構築に失敗しました",
    filter_label_msg: "ラベルを入力してください",
    filter_oper_msg: "操作子を入力してください",
    filter_value_msg: "ラベルの値を入力してください",
  },
};

export default ja_JP;
