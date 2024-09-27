const ja_JP = {
  title: "データソース管理",
  search_placeholder: "検索キーワードを入力してください",
  chooseDataSourceType: "データソースタイプを選択",
  name: "データソース名",
  id: "データソースID",
  description: "備考",
  type: "データソースタイプ",
  enable: "有効",
  disable: "無効",
  confirm: {
    enable: "このデータソースを有効にしますか？",
    disable: "このデータソースを無効にしますか？",
  },
  success: {
    enable: "有効に成功",
    disable: "無効に成功",
  },
  add_title: "データソースを作成",
  edit_title: "データソースを編集",
  rename_title: "データソース名を編集",
  type_btn_add: "追加",
  default: "デフォルトデータソースに設定",
  default_msg:
    "このデータソースタイプのデフォルトクラスターに、ネットワーク探索機能が収集した時系列データが報告されます",
  default_tip: "ネットワーク探索機能が収集した時系列データが報告されます",
  auth: {
    name: "認証",
    "not-support": "現在サポート中",
  },
  status: {
    title: "状態",
    enabled: "有効",
    disabled: "無効",
  },
  form: {
    other: "その他",
    name: "名前",
    name_msg:
      "アルファベット/数字/アンダースコアを入力してください。アルファベットで始まる必要があります",
    name_msg2: "少なくとも三文字を入力してください",
    timeout: "タイムアウト（単位:ms）",
    auth: "認証",
    username: "ユーザー名",
    password: "パスワード",
    skip_ssl_verify: "SSL検証をスキップ",
    yes: "はい",
    no: "いいえ",
    headers: "カスタムHTTPヘッダー",
    description: "備考",
    cluster: "関連するアラートエンジンクラスター",
    cluster_tip:
      "複数の機房のアーキテクチャー下で、複数のアラートエンジンクラスターが展開される場合、各機房のデータソースは対応する機房のアラートエンジンクラスターに関連する必要があります。クラスターが一つのみの場合は、デフォルトを保持してください。",
    cluster_confirm:
      "データソースがアラートエンジンクラスターに関連付けされていないことを発見しました。これにより、アラートに使用できません。アラートエンジンクラスターに関連付けを行いますか？",
    cluster_confirm_ok: "関連付けしない",
    cluster_confirm_cancel: "関連付けを行う",
    url_no_spaces_msg: "URLには空白を含めることはできません",
    prom: {
      write_addr_tip:
        "記録ルールが生成するデータの書き込みアドレスの例（時系列データベースの設定例）",
      read_addr: "時系列データベースの内網アドレス",
      read_addr_tip:
        "通常は、エッジ機房でのアラートエンジンの下沉部署シナリオで使用されます。このフィールドが空でない場合、n9e-edgeはこのアドレスを使用して時系列データベースにアクセスします。このフィールドが空の場合、n9e-edgeは上記のURLを使用して時系列データベースにアクセスします",
      url_tip:
        "時系列データベースの設定例（PrometheusクエリAPIとの互換性あり）",
      help_content:
        "時系列データベースを展開していませんか？<a>インストールマニュアル</a>を参照してインストールしてください",
      prom_installation_title: "インストールマニュアル",
      prom_installation:
        "夜莺を展開するマシン上で、以下のコマンドを実行してPrometheus時系列データベースをインストールします。生産環境では、VictoriaMetricsのクラスターバージョンを展開することをお勧めします。<a>公式ドキュメント</a>を参照してください",
      tsdb_type: "時系列データベースタイプ",
    },
    es: {
      write_config: "書き込み設定",
      disable_write: "書き込みを許可しない",
      enable_write: "書き込みを許可",
      version: "バージョン",
      max_shard: "最大並行シャードリクエスト数",
      min_interval: "最小時間間隔(s)",
      min_interval_tip:
        "時間間隔による自動グループ化の下限。書き込み頻度に応じて設定することをお勧めします。例えば、データが毎分書き込まれる場合は1mに設定します。",
    },
    jaeger: {
      version: "バージョン",
    },
    ck: {
      title: "データベース基本情報",
      addr: "データベースアドレス",
    },
    sls: {
      title: "サービスエントリ",
      endpoint:
        "アクセスドメイン（プライベートドメイン/パブリックドメイン/クロスドメイン）",
      access: "認証",
      endpoint_link: "設定説明",
    },
    os: {
      title: "OpenSearch詳細",
      enable_write_title: "書き込み設定",
      enable_write: "書き込みを許可",
    },
  },
};

export default ja_JP;