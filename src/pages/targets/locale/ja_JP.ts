const ja_JP = {
  title: "マシンリスト",
  default_filter: "デフォルトのフィルタ",
  ungrouped_targets: "グループに属していないマシン",
  all_targets: "全てのマシン",
  datasource: "データソース",
  search_placeholder:
    "テーブルの内容を模糊検索（複数のキーワードはスペースで区切ってください）",
  filterDowntime: "更新が無い時間が",
  filterDowntimeMin: "{{count}} 分間",
  ident_copy_success: "コピー成功 {{num}} レコード",
  not_grouped: "グループに属していない",
  host_ip: "IP",
  host_tags: "マシンタグ",
  host_tags_tip:
    "categrafのグローバルラベル設定で追加されたタグは、このマシンが報告する時系列データに追加されます",
  tags: "ユーザータグ",
  tags_tip:
    "ユーザーがページで設定したタグは、このマシンが報告する時系列データに追加されます",
  group_obj: "ビジネスグループ",
  target_up: "状態",
  mem_util: "メモリ",
  cpu_util: "CPU",
  cpu_num: "コア数",
  offset: "時間オフセット",
  offset_tip:
    "計算ロジックは、夜莺で展開されたマシンの時間からcategrafで展開されたマシンの時間を引いたものです",
  os: "オペレーティングシステム",
  arch: "CPUアーキテクチャ",
  update_at: "更新時間",
  update_at_tip:
    "\n    1分以内に心拍があれば：緑色 <1 />\n    3分以内に心拍があれば：黄色 <1 />\n    3分以内に心拍がなければ：赤色\n  ",
  remote_addr: "リモートIP",
  remote_addr_tip:
    "リモートIPはHTTPヘッダから取得されますが、プロキシを経由した場合は、実際のリモートIPとは異なる場合があります",
  agent_version: "エージェントバージョン",
  note: "備考",
  unknown_tip:
    "マシンのメタ情報の表示には、categrafのバージョンが0.2.35より高い必要があります",
  organize_columns: {
    title: "表示する列",
  },
  targets: "監視対象",
  targets_placeholder: "監視対象の指標を一行ずつ入力してください",
  copy: {
    current_page: "現在のページをコピー",
    all: "全てをコピー",
    selected: "選択したものをコピー",
    no_data: "コピーできるデータがありません",
  },
  bind_tag: {
    title: "タグのバインド",
    placeholder: "タグの形式は key=value です。回車や空白で区切ってください",
    msg1: "少なくとも一つのタグを入力してください！",
    msg2: "タグの形式が間違っています。確認してください！",
    msg3: "タグの key は重複できません",
    render_tip1: "タグの長さは 64 文字以下にしてください",
    render_tip2:
      "タグの形式は key=value です。key はアルファベットまたはアンダースコアで始まり、アルファベット、数字、アンダースコアで構成されます。",
  },
  unbind_tag: {
    title: "タグのバインド解除",
    placeholder: "解除するタグを選択してください",
    msg: "少なくとも一つのタグを入力してください！",
  },
  update_busi: {
    title: "ビジネスグループの更新",
    label: "所属ビジネスグループ",
  },
  remove_busi: {
    title: "ビジネスグループからの削除",
    msg: "注意：所属ビジネスグループから削除すると、そのビジネスグループの管理者はこれらの監視オブジェクトに対する権限を失います！あなたはまずこれらの監視オブジェクトのタグと備考情報をクリアする必要があります！",
    btn: "削除",
  },
  update_note: {
    title: "備考の更新",
    placeholder: "内容が空の場合は、備考情報をクリアします",
  },
  batch_delete: {
    title: "バッチ削除",
    msg: "注意：この操作はシステムから監視オブジェクトを完全に削除します。非常に危険な操作です。注意してください！",
    btn: "削除",
  },
  meta_tip: "メタ情報を見る",
  meta_title: "メタ情報",
  meta_desc_key: "メタ情報名",
  meta_desc_value: "メタ情報値",
  meta_value_click_to_copy: "クリックしてコピー",
  meta_expand: "展開",
  meta_collapse: "折りたたみ",
  meta_no_data: "データがありません",
  all_no_data:
    "コレクタをデプロイしていませんか？ <a>インストールマニュアル</a> を参照してインストールしてください",
};

export default ja_JP;
