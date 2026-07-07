const ja_JP = {
  modal: {
    title: '移行設定',
    success: '移行に成功しました',
    datasource_variable: 'データソース変数の設定',
    variable_name: '変数名',
    variable_name_required: '変数名を入力してください',
    datasource_type: 'データソースタイプ',
    datasource_default: 'データソースのデフォルト値',
  },
  title: "ダッシュボード移行",
  migrate: "移行",
  help: "\n  v6 版本では、全局 Prometheus クラスターの切り替えがサポートされなくなります。新しいバージョンでは、データソース変数を通じてグラフの関連付けを行うことで、この機能を実現できます。\n  <br />\n  移行ツールは、データソース変数を作成し、未関連のデータソースを持つすべてのグラフを関連付けします。\n  <br />\n  以下は移行が必要なダッシュボードの一覧です。移行ボタンをクリックして移行を開始します。\n  ",
};

export default ja_JP;
